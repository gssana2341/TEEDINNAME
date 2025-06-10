// Check duplicate users in database
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

async function checkDuplicateUsers() {
  console.log('🔍 Checking for duplicate users')
  console.log('=' .repeat(50))
  
  const envVars = loadEnvFile()
  const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = envVars.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceKey) {
    console.error('❌ Missing environment variables')
    return
  }

  const supabase = createClient(supabaseUrl, serviceKey)

  try {
    // Check for duplicate emails
    console.log('1. 📧 Checking duplicate emails...')
    const { data: allUsers, error: allError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, created_at')
      .order('email')

    if (allError) {
      console.error('❌ Error fetching all users:', allError)
      return
    }

    console.log(`📊 Total users found: ${allUsers.length}`)

    // Group by email
    const emailGroups = {}
    allUsers.forEach(user => {
      if (!emailGroups[user.email]) {
        emailGroups[user.email] = []
      }
      emailGroups[user.email].push(user)
    })

    // Find duplicates
    const duplicates = []
    Object.keys(emailGroups).forEach(email => {
      if (emailGroups[email].length > 1) {
        duplicates.push({ email, users: emailGroups[email] })
      }
    })

    if (duplicates.length === 0) {
      console.log('✅ No duplicate emails found')
    } else {
      console.log(`⚠️ Found ${duplicates.length} duplicate email(s):`)
      duplicates.forEach(dup => {
        console.log(`\n📧 Email: ${dup.email}`)
        dup.users.forEach((user, index) => {
          console.log(`   ${index + 1}. ID: ${user.id}`)
          console.log(`      Name: ${user.first_name} ${user.last_name}`)
          console.log(`      Created: ${user.created_at}`)
        })
      })
    }

    // Specifically check bkknm121@gmail.com
    console.log('\n2. 🎯 Checking bkknm121@gmail.com specifically...')
    const { data: targetUsers, error: targetError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'bkknm121@gmail.com')

    if (targetError) {
      console.error('❌ Error fetching target user:', targetError)
      return
    }

    console.log(`📊 Found ${targetUsers.length} records for bkknm121@gmail.com:`)
    targetUsers.forEach((user, index) => {
      console.log(`\n${index + 1}. Record:`)
      console.log(`   ID: ${user.id}`)
      console.log(`   Email: ${user.email}`)
      console.log(`   Name: ${user.first_name} ${user.last_name}`)
      console.log(`   Phone: ${user.phone}`)
      console.log(`   Role: ${user.role}`)
      console.log(`   Password: ${user.password}`)
      console.log(`   Created: ${user.created_at}`)
      console.log(`   Updated: ${user.updated_at}`)
    })

  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// Run the check
checkDuplicateUsers().catch(console.error)
