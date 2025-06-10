const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function debugUserComplete() {
  console.log('🔍 Complete User Debug for bkknm121@gmail.com')
  console.log('=' .repeat(60))
  
  try {
    // 1. ตรวจสอบใน auth.users
    console.log('\n1️⃣ Checking auth.users table...')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Auth error:', authError)
      return
    }
    
    const targetAuthUser = authUsers.users.find(u => u.email === 'bkknm121@gmail.com')
    if (targetAuthUser) {
      console.log('✅ Found in auth.users:')
      console.log('   - ID:', targetAuthUser.id)
      console.log('   - Email:', targetAuthUser.email)
      console.log('   - Email confirmed:', targetAuthUser.email_confirmed_at ? 'Yes' : 'No')
      console.log('   - Created:', targetAuthUser.created_at)
      console.log('   - Last sign in:', targetAuthUser.last_sign_in_at)
    } else {
      console.log('❌ NOT found in auth.users')
    }

    // 2. ตรวจสอบใน custom users table
    console.log('\n2️⃣ Checking custom users table...')
    const { data: customUsers, error: customError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'bkknm121@gmail.com')
    
    if (customError) {
      console.error('❌ Custom users error:', customError)
    } else if (customUsers && customUsers.length > 0) {
      console.log(`✅ Found ${customUsers.length} record(s) in custom users table:`)
      customUsers.forEach((user, index) => {
        console.log(`   Record ${index + 1}:`)
        console.log('   - ID:', user.id)
        console.log('   - Email:', user.email)
        console.log('   - Password:', user.password)
        console.log('   - First name:', user.first_name)
        console.log('   - Last name:', user.last_name)
        console.log('   - Phone:', user.phone)
        console.log('   - Role:', user.role)
        console.log('   - Created:', user.created_at)
        console.log('   - Updated:', user.updated_at)
        console.log('   ---')
      })
    } else {
      console.log('❌ NOT found in custom users table')
    }

    // 3. ทดสอบ login ด้วยรหัสผ่านต่างๆ
    console.log('\n3️⃣ Testing login with different passwords...')
    const passwordsToTest = ['awdasdasd1', 'awdawdasd1', 'password123456']
    
    for (const password of passwordsToTest) {
      console.log(`\n🔐 Testing password: "${password}"`)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'bkknm121@gmail.com',
        password: password
      })
      
      if (signInError) {
        console.log('❌ Login failed:', signInError.message)
      } else {
        console.log('✅ Login successful!')
        console.log('   - User ID:', signInData.user?.id)
        console.log('   - Session:', signInData.session ? 'Created' : 'No session')
        
        // Sign out after successful test
        await supabase.auth.signOut()
      }
    }

    // 4. ตรวจสอบ database configuration
    console.log('\n4️⃣ Database configuration check...')
    console.log('   - Supabase URL:', supabaseUrl?.substring(0, 30) + '...')
    console.log('   - Service key available:', !!supabaseServiceKey)
    console.log('   - Service key length:', supabaseServiceKey?.length || 0)

    // 5. ตรวจสอบจำนวนผู้ใช้ทั้งหมดในระบบ
    console.log('\n5️⃣ System overview...')
    const { count: authCount } = await supabase.auth.admin.listUsers()
    console.log('   - Total auth users:', authCount || authUsers.users.length)
    
    const { count: customCount, error: countError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
    
    if (!countError) {
      console.log('   - Total custom users:', customCount)
    }

  } catch (error) {
    console.error('🚨 Unexpected error:', error)
  }
}

debugUserComplete()
