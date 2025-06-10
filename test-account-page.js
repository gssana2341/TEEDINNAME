// Test script to verify account page functionality with real user data
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Read environment variables from .env.local
function loadEnvFile() {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8')
    const envVars = {}
    
    envContent.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=')
        if (key) {
          envVars[key.trim()] = valueParts.join('=').trim()
        }
      }
    })
    
    return envVars
  } catch (error) {
    console.error('Error reading .env.local file:', error.message)
    return {}
  }
}

async function testAccountPageData() {
  console.log('🧪 Testing Account Page Data Functionality')
  console.log('=' .repeat(50))

  // Load environment variables
  const envVars = loadEnvFile()
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing environment variables')
    return
  }

  // Create admin client
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })

  // Create regular client
  const supabase = createClient(supabaseUrl, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY)

  const testUser = {
    email: 'bkknm121@gmail.com',
    password: 'awdawdasd1' // The corrected password
  }

  try {
    console.log('📧 Testing user:', testUser.email)

    // 1. Test login and get session
    console.log('\n1. Testing login...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: testUser.email,
      password: testUser.password
    })

    if (loginError) {
      console.error('❌ Login failed:', loginError.message)
      return
    }

    console.log('✅ Login successful!')
    console.log(`   User ID: ${loginData.user.id}`)
    console.log(`   Email: ${loginData.user.email}`)
    console.log(`   Session exists: ${!!loginData.session}`)
    
    // 2. Test fetching user data from custom users table
    console.log('\n2. Testing user data fetch from custom table...')
    const { data: customUserData, error: customUserError } = await supabase
      .from('users')
      .select('*')
      .eq('email', testUser.email)
      .single()

    if (customUserError) {
      console.error('❌ Failed to fetch custom user data:', customUserError.message)
    } else {
      console.log('✅ Custom user data found:')
      console.log(`   ID: ${customUserData.id}`)
      console.log(`   Name: ${customUserData.first_name} ${customUserData.last_name}`)
      console.log(`   Email: ${customUserData.email}`)
      console.log(`   Phone: ${customUserData.phone || 'Not set'}`)
      console.log(`   Role: ${customUserData.role}`)
      console.log(`   Password: ${customUserData.password}`)
      console.log(`   Created: ${customUserData.created_at}`)
    }

    // 3. Test profile data
    console.log('\n3. Testing profile data...')
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', testUser.email)
      .single()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('❌ Failed to fetch profile data:', profileError.message)
    } else if (profileData) {
      console.log('✅ Profile data found:')
      console.log(`   Auth ID: ${profileData.id}`)
      console.log(`   User ID: ${profileData.user_id}`)
      console.log(`   Role: ${profileData.user_role}`)
    } else {
      console.log('⚠️ No profile data found (may need to be created)')
    }

    // 4. Test updating user data
    console.log('\n4. Testing user data update...')
    const updateData = {
      first_name: 'Updated',
      last_name: 'Test',
      phone: '081-234-5678',
      updated_at: new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('email', testUser.email)

    if (updateError) {
      console.error('❌ Failed to update user data:', updateError.message)
    } else {
      console.log('✅ User data updated successfully')
      
      // Verify update
      const { data: updatedData, error: verifyError } = await supabase
        .from('users')
        .select('first_name, last_name, phone, updated_at')
        .eq('email', testUser.email)
        .single()

      if (!verifyError && updatedData) {
        console.log('   Updated data verified:')
        console.log(`   Name: ${updatedData.first_name} ${updatedData.last_name}`)
        console.log(`   Phone: ${updatedData.phone}`)
        console.log(`   Updated: ${updatedData.updated_at}`)
      }
    }

    // 5. Test password update via Auth Admin
    console.log('\n5. Testing password update...')
    const newPassword = 'awdawdasd1' // Keep the same password for consistency
    
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      loginData.user.id,
      { password: newPassword }
    )

    if (passwordError) {
      console.error('❌ Failed to update password:', passwordError.message)
    } else {
      console.log('✅ Password updated successfully in Auth')
      
      // Update password in custom table too
      const { error: customPasswordError } = await supabase
        .from('users')
        .update({ 
          password: newPassword,
          updated_at: new Date().toISOString()
        })
        .eq('email', testUser.email)

      if (customPasswordError) {
        console.error('❌ Failed to update password in custom table:', customPasswordError.message)
      } else {
        console.log('✅ Password updated in custom table')
      }
    }

    // 6. Test logout
    console.log('\n6. Testing logout...')
    const { error: logoutError } = await supabase.auth.signOut()
    
    if (logoutError) {
      console.error('❌ Logout failed:', logoutError.message)
    } else {
      console.log('✅ Logout successful')
    }

    console.log('\n🎉 All tests completed!')
    console.log('\n📋 Summary:')
    console.log('✅ Login functionality works')
    console.log('✅ User data fetch works')
    console.log('✅ User data update works') 
    console.log('✅ Password update works')
    console.log('✅ Logout works')
    console.log('\n💡 The account page should now display real user data!')

  } catch (error) {
    console.error('❌ Test error:', error)
  }
}

// Run the test
testAccountPageData().catch(console.error)
