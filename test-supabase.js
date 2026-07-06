require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  console.log("Testing Supabase connection...");
  const { data, error } = await supabase.from('transactions').select('*').limit(1);
  if (error) {
    console.error("Connection failed:", error.message);
    process.exit(1);
  }
  console.log("Connection successful! Data fetched:", data);
}
test();
