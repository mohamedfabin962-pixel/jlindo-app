import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://jeilanpnqtcdxfswrfeq.supabase.co',
  'sb_publishable_tYi7RBXMxUuHm4wcQDkI4g_STLTjVkD'
);

async function check() {
  const tables = ['activity_logs', 'logs', 'audit_logs', 'activities'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('*').limit(1);
    if (error) {
      console.log(`Table ${t} does not exist or error:`, error.message);
    } else {
      console.log(`Table ${t} exists! Data:`, data);
    }
  }
}

check();
