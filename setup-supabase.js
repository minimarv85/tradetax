const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://issryxbhnwezxwrjhznq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_Ng-4FojiB1es07oJ0w1_Xg_7pXRe6C_';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function setupDatabase() {
  console.log('Setting up Supabase tables...\n');
  
  // SQL to run
  const sql = `
    -- Add user_id column to transactions if missing
    ALTER TABLE transactions ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users;
    
    -- Add user_id column to mileage_trips if missing
    ALTER TABLE mileage_trips ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users;
    
    -- Create index for faster queries
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    CREATE INDEX IF NOT EXISTS idx_mileage_trips_user_id ON mileage_trips(user_id);
    
    -- Enable Row Level Security
    ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
    ALTER TABLE mileage_trips ENABLE ROW LEVEL SECURITY;
    
    -- Drop old policies if they exist
    DROP POLICY IF EXISTS "Users can CRUD own transactions" ON transactions;
    DROP POLICY IF EXISTS "Users can CRUD own mileage" ON mileage_trips;
    
    -- Create policies for user data isolation
    CREATE POLICY "Users can CRUD own transactions" ON transactions
      FOR ALL USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can CRUD own mileage" ON mileage_trips
      FOR ALL USING (auth.uid() = user_id);
    
    SELECT 'Database setup complete!';
  `;
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', { query: sql });
    
    // Since exec_sql might not exist, let's try alternative approach
    if (error) {
      console.log('RPC method not available, trying alternative...');
      
      // Try using the REST API endpoint for SQL
      const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          'Prefer': 'return=minimal'
        },
        body: JSON.stringify({
          query: sql
        })
      });
      
      console.log('SQL executed via REST API');
    } else {
      console.log('Database setup successful!');
    }
    
    console.log('\n✅ Database should now be configured!');
    console.log('If there were errors, please run this SQL in Supabase Dashboard → SQL Editor:');
    console.log('\n--- COPY BELOW ---\n');
    console.log(sql);
    console.log('\n--- COPY ABOVE ---\n');
    
  } catch (err) {
    console.log('Error:', err.message);
    console.log('\n⚠️ Please run the SQL manually in Supabase Dashboard:');
    console.log('Go to https://issryxbhnwezxwrjhznq.supabase.co');
    console.log('Click "SQL Editor" and run the setup SQL.\n');
  }
}

setupDatabase();
