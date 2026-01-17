'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Database } from './database.types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.');
  // Return a mock client to prevent crashes, but it won't work until env vars are set
  throw new Error('Missing Supabase environment variables. Please configure them in Vercel Settings → Environment Variables.');
}

export const supabase = createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);

