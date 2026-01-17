import { NextRequest, NextResponse } from 'next/server';
import { canCreateCantera, canAddCliente, canRegisterProduccion, canRegisterVenta, canAddUser, canExportPDF, canExportExcel } from '@/lib/limits';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (!action || typeof action !== 'string') {
      return NextResponse.json({ error: 'Acción requerida' }, { status: 400 });
    }

    let result;

    switch (action) {
      case 'create_cantera':
        result = await canCreateCantera();
        break;
      case 'add_cliente':
        result = await canAddCliente();
        break;
      case 'register_produccion':
        result = await canRegisterProduccion();
        break;
      case 'register_venta':
        result = await canRegisterVenta();
        break;
      case 'add_user':
        result = await canAddUser();
        break;
      case 'export_pdf':
        result = { allowed: await canExportPDF() };
        break;
      case 'export_excel':
        result = { allowed: await canExportExcel() };
        break;
      default:
        return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error checking limit:', error);
    return NextResponse.json(
      { error: error.message || 'Error al verificar límite' },
      { status: 500 }
    );
  }
}

