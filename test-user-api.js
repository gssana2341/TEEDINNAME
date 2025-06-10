// Test user API endpoint
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')

// Read environment variables from .env.local
function loadEnvFile() {
  try {
    const envLocal = fs.readFileSync('.env.local', 'utf8')
    const envVars = {}
    envLocal.split('\n').forEach(line => {
      if (line.trim() && !line.startsWith('#')) {
        const [key, value] = line.split('=')
        if (key && value) {
          envVars[key.trim()] = value.trim()
        }
      }
    })
    return envVars
  } catch (error) {
    console.error('Error reading .env.local:', error.message)
    return {}
  }
}

async function testUserAPI() {
  console.log('🧪 Testing User API Endpoint')
  console.log('=' .repeat(50))
  
  const envVars = loadEnvFile()
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Missing environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey)

  try {
    // 1. Login first
    console.log('1. 🔐 Logging in as bkknm121@gmail.com...')
    const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
      email: 'bkknm121@gmail.com',
      password: 'awdawdasd1' // รหัสผ่านที่ถูกต้อง
    })

    if (loginError) {
      console.error('❌ Login failed:', loginError.message)
      return
    }

    console.log('✅ Login successful!')
    console.log(`   User ID: ${loginData.user.id}`)
    console.log(`   Email: ${loginData.user.email}`)
    console.log(`   Access Token: ${loginData.session.access_token ? 'Present' : 'Missing'}`)

    // 2. Test GET /api/user
    console.log('\n2. 📊 Testing GET /api/user...')
    try {
      const response = await fetch('http://localhost:3000/api/user', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${loginData.session.access_token}`,
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error('❌ API request failed:', result.error)
        console.log('   Status:', response.status)
        console.log('   Response:', result)
      } else {
        console.log('✅ GET /api/user successful!')
        console.log('   User data received:')
        console.log(`   - ID: ${result.user.id}`)
        console.log(`   - Email: ${result.user.email}`)
        console.log(`   - Name: ${result.user.first_name} ${result.user.last_name}`)
        console.log(`   - Phone: ${result.user.phone}`)
        console.log(`   - Role: ${result.user.role}`)
        console.log(`   - Password: ${result.user.password}`)
        console.log(`   - Created: ${result.user.created_at}`)
      }
    } catch (fetchError) {
      console.error('❌ Fetch error:', fetchError.message)
      console.log('💡 Make sure the development server is running on http://localhost:3000')
    }

    // 3. Test PUT /api/user
    console.log('\n3. ✏️ Testing PUT /api/user...')
    try {
      const updateData = {
        first_name: 'Papon Updated',
        last_name: 'Moonkonburee',
        phone: '0647601846',
        password: 'awdawdasd1' // Keep same password
      }

      const response = await fetch('http://localhost:3000/api/user', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${loginData.session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData)
      })

      const result = await response.json()
      
      if (!response.ok) {
        console.error('❌ PUT request failed:', result.error)
        console.log('   Status:', response.status)
        console.log('   Response:', result)
      } else {
        console.log('✅ PUT /api/user successful!')
        console.log('   Message:', result.message)
      }
    } catch (fetchError) {
      console.error('❌ PUT fetch error:', fetchError.message)
    }

    // 4. Logout
    console.log('\n4. 🚪 Logging out...')
    await supabase.auth.signOut()
    console.log('✅ Logged out successfully')

  } catch (error) {
    console.error('❌ Test error:', error)
  }

  console.log('\n🎉 User API test completed!')
}

// Run the test
testUserAPI().catch(console.error)
