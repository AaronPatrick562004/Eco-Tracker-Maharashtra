// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

// CORRECT URL from your project
const supabaseUrl = 'https://ubnxvxxknbirfpkbxoao.supabase.co';
const supabaseAnonKey = 'sb_publishable_zo4mUCCCmkhae76_bUC5Lw_pIHuiHA6';

console.log('Connecting to Supabase:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  }
});

// Test function
export const testConnection = async () => {
  try {
    console.log('Testing connection...');
    const { data, error, count } = await supabase
      .from('schools')
      .select('*', { count: 'exact' })
      .limit(1);
    
    if (error) throw error;
    console.log('✅ Connected! Found', count, 'schools');
    return { success: true, count, data };
  } catch (error) {
    console.error('❌ Connection failed:', error);
    return { success: false, error: String(error) };
  }
};