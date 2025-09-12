import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lqpxiakeqsvztiqjdvid.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcHhpYWtlcXN2enRpcWpkdmlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1MjM3MzMsImV4cCI6MjA3MzA5OTczM30.zHxQ5tbkxkf8nG1aBztflW05PKUjkk1L7nHe8n0gdoA';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('app_f6a677c6d3_events')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('✅ Supabase connection successful');
    return true;
  } catch (error) {
    console.error('❌ Supabase connection error:', error);
    return false;
  }
};