import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function verifyLoginFix() {
  const targetEmail = 'bkknm121@gmail.com';
  const testPassword = 'awdasdasd1';
  
  console.log('🔍 Verifying login fix for:', targetEmail);
  console.log('=' .repeat(50));
  
  try {
    // 1. Check if user exists in Auth
    console.log('1. Checking Supabase Auth user...');
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError);
      return;
    }
    
    const authUser = authUsers.users.find(user => user.email === targetEmail);
    if (!authUser) {
      console.log('❌ User not found in Supabase Auth');
      return;
    }
    
    console.log('✅ User found in Auth:');
    console.log(`   - ID: ${authUser.id}`);
    console.log(`   - Email: ${authUser.email}`);
    console.log(`   - Email confirmed: ${authUser.email_confirmed_at ? 'Yes' : 'No'}`);
    console.log(`   - Created: ${authUser.created_at}`);
    console.log(`   - Last sign in: ${authUser.last_sign_in_at || 'Never'}`);
    
    // 2. Check users table
    console.log('\n2. Checking users table...');
    const { data: dbUser, error: dbError } = await supabase
      .from('users')
      .select('*')
      .eq('email', targetEmail)
      .single();
      
    if (dbError && dbError.code !== 'PGRST116') {
      console.error('❌ Error fetching user from database:', dbError);
    } else if (dbUser) {
      console.log('✅ User found in users table:');
      console.log(`   - ID: ${dbUser.id}`);
      console.log(`   - Email: ${dbUser.email}`);
      console.log(`   - Role: ${dbUser.role}`);
      console.log(`   - Auth ID matches: ${dbUser.id === authUser.id ? 'Yes' : 'No'}`);
    } else {
      console.log('⚠️  User not found in users table');
    }
    
    // 3. Test login with the password we set
    console.log('\n3. Testing login with updated password...');
    
    // Create a regular client for testing login
    const testClient = createClient(supabaseUrl, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    
    const { data: loginData, error: loginError } = await testClient.auth.signInWithPassword({
      email: targetEmail,
      password: testPassword
    });
    
    if (loginError) {
      console.log('❌ Login failed:', loginError.message);
      
      // Check if it's a password issue by trying to update it again
      console.log('\n4. Attempting to reset password again...');
      const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
        authUser.id,
        { password: testPassword }
      );
      
      if (updateError) {
        console.error('❌ Failed to update password:', updateError);
      } else {
        console.log('✅ Password updated again');
        
        // Try login one more time
        console.log('5. Retrying login...');
        const { data: retryData, error: retryError } = await testClient.auth.signInWithPassword({
          email: targetEmail,
          password: testPassword
        });
        
        if (retryError) {
          console.log('❌ Login still failed:', retryError.message);
        } else {
          console.log('✅ Login successful!');
          console.log(`   - User ID: ${retryData.user?.id}`);
          console.log(`   - Session: ${retryData.session ? 'Created' : 'None'}`);
        }
      }
    } else {
      console.log('✅ Login successful!');
      console.log(`   - User ID: ${loginData.user?.id}`);
      console.log(`   - Session: ${loginData.session ? 'Created' : 'None'}`);
    }
    
    // 4. Check for any RLS policies that might be blocking
    console.log('\n6. Checking RLS policies on users table...');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_table_policies', { table_name: 'users' })
      .catch(() => {
        // If the function doesn't exist, try a different approach
        return { data: null, error: 'Custom function not available' };
      });
    
    if (policies) {
      console.log('RLS Policies:', policies);
    } else {
      console.log('⚠️  Could not fetch RLS policies');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

verifyLoginFix().then(() => {
  console.log('\n' + '='.repeat(50));
  console.log('Verification complete');
  process.exit(0);
});
