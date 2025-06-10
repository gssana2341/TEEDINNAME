const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Read environment variables from .env.local
function loadEnvFile() {
  try {
    const envFile = fs.readFileSync('.env.local', 'utf8')
    const envVars = {}
    envFile.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, ...valueParts] = line.split('=')
        envVars[key.trim()] = valueParts.join('=').trim()
      }
    })
    return envVars
  } catch (error) {
    console.error('Error reading .env.local:', error.message)
    return {}
  }
}

const envVars = loadEnvFile()
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Missing environment variables')
  console.log('SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.log('SERVICE_KEY:', serviceKey ? 'Set' : 'Missing')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceKey)

async function debugSpecificUser(email) {
  console.log(`🔍 Debugging user: ${email}`)
  
  try {
    // Check auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
      console.error('❌ Auth users error:', authError)
      return
    }
    
    const authUser = authUsers.users.find(u => u.email === email)
    console.log('📧 Auth user found:', !!authUser)
    if (authUser) {
      console.log(`   ID: ${authUser.id}`)
      console.log(`   Email confirmed: ${authUser.email_confirmed_at ? 'Yes' : 'No'}`)
      console.log(`   Created: ${authUser.created_at}`)
      console.log(`   Last sign in: ${authUser.last_sign_in_at || 'Never'}`)
    }
    
    // Check users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
    
    if (usersError) {
      console.error('❌ Users table error:', usersError)
    } else {
      console.log('🗂️ Custom users table found:', users.length > 0)
      if (users.length > 0) {
        console.log('   User data:', users[0])
      }
    }
    
    // Try to sign in as this user
    console.log('\n🔐 Testing login...')
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: email,
      password: 'password123' // Try common password
    })
    
    if (signInError) {
      console.log('❌ Login failed:', signInError.message)
      
      // Try to reset password for this user
      if (authUser) {
        console.log('🔧 Attempting to reset password...')
        const { error: updateError } = await supabase.auth.admin.updateUserById(
          authUser.id,
          { password: 'password123' }
        )
        
        if (updateError) {
          console.error('❌ Password reset failed:', updateError)
        } else {
          console.log('✅ Password reset successful')
          
          // Try login again
          const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
            email: email,
            password: 'password123'
          })
          
          if (retryError) {
            console.log('❌ Retry login failed:', retryError.message)
          } else {
            console.log('✅ Retry login successful!')
          }
        }
      }
    } else {
      console.log('✅ Login successful!')
    }
    
  } catch (error) {
    console.error('❌ Debug error:', error)
  }
}

// Debug the specific user
debugSpecificUser('bkknm121@gmail.com')
