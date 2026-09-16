const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = '.env.local';
const env = fs.readFileSync(envFile, 'utf8').split('\n').reduce((acc, line) => {
  const [key, ...rest] = line.split('=');
  const val = rest.join('=');
  if (key && val) acc[key.trim()] = val.trim();
  return acc;
}, {});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const { data, error } = await supabase.from('users').select('id, created_at, subscription_expires_at, plan_status, is_admin, account_type').eq('email', 'nahun89_campos@hotmail.com').single();
  console.log("DB User:", data);
  
  if (data) {
     const { data: rpcData, error: rpcError } = await supabase.rpc('get_user_plan', { p_user_id: data.id });
     console.log("RPC Data:", rpcData, rpcError);
  }
}
run();
