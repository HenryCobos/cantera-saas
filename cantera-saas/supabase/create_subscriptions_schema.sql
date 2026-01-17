-- ============================================
-- TABLAS Y FUNCIONES PARA SUSCRIPCIONES (HOTMART)
-- ============================================
-- Este script crea la infraestructura necesaria para gestionar suscripciones
-- Ejecutar en Supabase SQL Editor después de verificar que la tabla organizations existe

-- ============================================
-- 1. TABLA: subscriptions
-- ============================================
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  plan TEXT NOT NULL CHECK (plan IN ('free', 'starter', 'profesional', 'business')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired', 'trial', 'pending_payment')),
  billing_period TEXT CHECK (billing_period IN ('monthly', 'yearly')),
  
  -- IDs de Hotmart
  hotmart_transaction_id TEXT UNIQUE,
  hotmart_subscription_id TEXT,
  hotmart_product_id TEXT,
  hotmart_buyer_email TEXT,
  
  -- Fechas importantes
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc'::text, NOW()),
  expires_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE,
  
  -- Metadatos adicionales
  metadata JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_organization ON subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_hotmart_transaction ON subscriptions(hotmart_transaction_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_hotmart_subscription ON subscriptions(hotmart_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subscriptions_expires_at ON subscriptions(expires_at);

-- ============================================
-- 2. TABLA: subscription_history
-- ============================================
CREATE TABLE IF NOT EXISTS subscription_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  old_plan TEXT,
  new_plan TEXT NOT NULL,
  old_status TEXT,
  new_status TEXT NOT NULL,
  reason TEXT, -- 'upgrade', 'downgrade', 'renewal', 'cancellation', 'hotmart_webhook', 'manual'
  hotmart_event_id TEXT,
  hotmart_event_type TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subscription_history_subscription ON subscription_history(subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_organization ON subscription_history(organization_id);
CREATE INDEX IF NOT EXISTS idx_subscription_history_created_at ON subscription_history(created_at);

-- ============================================
-- 3. FUNCIÓN: Obtener suscripción activa de una organización
-- ============================================
CREATE OR REPLACE FUNCTION get_active_subscription(org_id UUID)
RETURNS TABLE (
  id UUID,
  plan TEXT,
  status TEXT,
  billing_period TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  next_billing_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.plan,
    s.status,
    s.billing_period,
    s.expires_at,
    s.next_billing_date
  FROM subscriptions s
  WHERE s.organization_id = org_id
    AND s.status = 'active'
    AND (s.expires_at IS NULL OR s.expires_at > NOW())
  ORDER BY s.created_at DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. FUNCIÓN: Actualizar plan de organización basado en suscripción
-- ============================================
CREATE OR REPLACE FUNCTION update_organization_plan_from_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la suscripción está activa y no ha expirado, actualizar el plan de la organización
  IF NEW.status = 'active' AND (NEW.expires_at IS NULL OR NEW.expires_at > NOW()) THEN
    UPDATE organizations
    SET plan = NEW.plan,
        updated_at = NOW()
    WHERE id = NEW.organization_id;
    
    -- Registrar en historial
    INSERT INTO subscription_history (
      subscription_id,
      organization_id,
      old_plan,
      new_plan,
      old_status,
      new_status,
      reason,
      hotmart_event_type
    )
    SELECT 
      NEW.id,
      NEW.organization_id,
      COALESCE(OLD.plan, 'free'),
      NEW.plan,
      COALESCE(OLD.status, 'active'),
      NEW.status,
      CASE 
        WHEN OLD.plan IS NULL THEN 'initial_subscription'
        WHEN OLD.plan != NEW.plan AND NEW.plan > OLD.plan THEN 'upgrade'
        WHEN OLD.plan != NEW.plan AND NEW.plan < OLD.plan THEN 'downgrade'
        WHEN OLD.status != NEW.status AND NEW.status = 'active' THEN 'reactivation'
        WHEN OLD.status != NEW.status AND NEW.status = 'cancelled' THEN 'cancellation'
        ELSE 'update'
      END,
      'trigger'
    WHERE OLD IS DISTINCT FROM NEW;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar plan automáticamente
DROP TRIGGER IF EXISTS trigger_update_organization_plan ON subscriptions;
CREATE TRIGGER trigger_update_organization_plan
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_plan_from_subscription();

-- ============================================
-- 5. FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_subscriptions_updated_at ON subscriptions;
CREATE TRIGGER trigger_update_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscriptions_updated_at();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_history ENABLE ROW LEVEL SECURITY;

-- Política: Los usuarios pueden ver suscripciones de su organización
CREATE POLICY "Users can view subscriptions in own organization" ON subscriptions
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- Política: Solo admins pueden crear/actualizar suscripciones (webhooks lo harán con SECURITY DEFINER)
-- En la práctica, los webhooks usarán SECURITY DEFINER para bypassear RLS

-- Política: Los usuarios pueden ver historial de su organización
CREATE POLICY "Users can view subscription history in own organization" ON subscription_history
  FOR SELECT USING (
    organization_id = (SELECT organization_id FROM profiles WHERE id = auth.uid())
  );

-- ============================================
-- 7. VERIFICACIÓN
-- ============================================
-- Verificar que las tablas se crearon correctamente
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscriptions') THEN
    RAISE NOTICE 'Tabla subscriptions creada correctamente';
  ELSE
    RAISE EXCEPTION 'Error: No se pudo crear la tabla subscriptions';
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'subscription_history') THEN
    RAISE NOTICE 'Tabla subscription_history creada correctamente';
  ELSE
    RAISE EXCEPTION 'Error: No se pudo crear la tabla subscription_history';
  END IF;
END $$;

