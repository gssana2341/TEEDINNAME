const { createClient } = require('@supabase/supabase-js')

// ใช้ค่าที่ถูกต้องจากไฟล์ environment
const supabaseUrl = 'https://kxkryylxfkkjgbgtxfog.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4a3J5eWx4ZmtramdiZ3R4Zm9nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjgwMDU4MywiZXhwIjoyMDYyMzc2NTgzfQ.6Jq5oyxsaw9wN3Z79PUazCxHefbdzkBmJpjtbLq2HAg'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function investigateGassana() {
  console.log('🔍 ตรวจสอบ gassana2341@gmail.com อย่างละเอียด...\n')

  try {
    // 1. ดูข้อมูลใน Auth
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
      console.log('❌ ไม่สามารถดึงข้อมูล Auth:', authError.message)
      return
    }

    const gassanaAuth = authUsers.users.find(u => u.email === 'gassana2341@gmail.com')
    if (gassanaAuth) {
      console.log('📋 ข้อมูลใน Auth:')
      console.log(`   - ID: ${gassanaAuth.id}`)
      console.log(`   - Email: ${gassanaAuth.email}`)
      console.log(`   - ยืนยันอีเมล: ${gassanaAuth.email_confirmed_at ? 'แล้ว' : 'ยังไม่'}`)
      console.log(`   - สร้างเมื่อ: ${new Date(gassanaAuth.created_at).toLocaleString('th-TH')}`)
    } else {
      console.log('❌ ไม่พบผู้ใช้ใน Auth')
      return
    }

    // 2. ดูข้อมูลใน public.users
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('*')
      .eq('email', 'gassana2341@gmail.com')

    if (publicError) {
      console.log('❌ ไม่สามารถดึงข้อมูลจาก public.users:', publicError.message)
      return
    }

    console.log('\n📋 ข้อมูลใน public.users:')
    if (publicUsers && publicUsers.length > 0) {
      const gassanaPublic = publicUsers[0]
      console.log(`   - ID: ${gassanaPublic.id}`)
      console.log(`   - Email: ${gassanaPublic.email}`)
      console.log(`   - ชื่อ: ${gassanaPublic.first_name} ${gassanaPublic.last_name}`)
      console.log(`   - รหัสผ่าน: ${gassanaPublic.password}`)
      console.log(`   - บทบาท: ${gassanaPublic.role}`)
      
      // เปรียบเทียบ ID
      if (gassanaAuth.id !== gassanaPublic.id) {
        console.log(`   ⚠️  ID ไม่ตรงกัน! Auth: ${gassanaAuth.id}, Public: ${gassanaPublic.id}`)
      } else {
        console.log(`   ✅ ID ตรงกัน`)
      }
    } else {
      console.log('❌ ไม่พบผู้ใช้ใน public.users')
    }

    // 3. ทดสอบรหัสผ่านหลายแบบ
    console.log('\n🧪 ทดสอบรหัสผ่านต่างๆ:')
    const testPasswords = [
      '123456123456',  // จากฐานข้อมูล
      '123456',
      'admin',
      'admin123',
      'password',
      'gassana2341',
      'gassana123',
      '12345678',
      'qwerty',
      'password123'
    ]

    let foundPassword = null
    for (const testPassword of testPasswords) {
      try {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: 'gassana2341@gmail.com',
          password: testPassword
        })

        if (!signInError && signInData.user) {
          console.log(`   ✅ รหัสผ่านที่ใช้งานได้: ${testPassword}`)
          foundPassword = testPassword
          await supabase.auth.signOut()
          break
        } else {
          console.log(`   ❌ ${testPassword}: ${signInError?.message || 'ไม่ถูกต้อง'}`)
        }
      } catch (error) {
        console.log(`   ❌ ${testPassword}: ${error.message}`)
      }
    }

    // 4. ถ้าหารหัสผ่านเจอ ให้อัปเดตฐานข้อมูล
    if (foundPassword) {
      console.log(`\n🔧 อัปเดตรหัสผ่านในฐานข้อมูลเป็น: ${foundPassword}`)
      
      const { error: updateError } = await supabase
        .from('users')
        .update({ password: foundPassword })
        .eq('email', 'gassana2341@gmail.com')

      if (updateError) {
        console.log(`   ❌ ไม่สามารถอัปเดต: ${updateError.message}`)
      } else {
        console.log(`   ✅ อัปเดตสำเร็จ`)
      }
    } else {
      console.log('\n❌ ไม่พบรหัสผ่านที่ใช้งานได้')
      
      // ลองรีเซ็ตรหัสผ่าน
      console.log('\n🔄 ลองรีเซ็ตรหัสผ่านเป็น "admin123"')
      const { data: resetData, error: resetError } = await supabase.auth.admin.updateUserById(
        gassanaAuth.id,
        { password: 'admin123' }
      )

      if (resetError) {
        console.log(`   ❌ ไม่สามารถรีเซ็ต: ${resetError.message}`)
      } else {
        console.log(`   ✅ รีเซ็ตสำเร็จ`)
        
        // อัปเดตฐานข้อมูลด้วย
        const { error: updateError } = await supabase
          .from('users')
          .update({ password: 'admin123' })
          .eq('email', 'gassana2341@gmail.com')

        if (!updateError) {
          console.log(`   ✅ อัปเดตฐานข้อมูลด้วย`)
        }

        // ทดสอบใหม่
        console.log(`   🧪 ทดสอบรหัสผ่านใหม่: admin123`)
        const { data: testData, error: testError } = await supabase.auth.signInWithPassword({
          email: 'gassana2341@gmail.com',
          password: 'admin123'
        })

        if (!testError && testData.user) {
          console.log(`   ✅ เข้าสู่ระบบได้แล้ว!`)
          await supabase.auth.signOut()
        } else {
          console.log(`   ❌ ยังเข้าไม่ได้: ${testError?.message}`)
        }
      }
    }

  } catch (error) {
    console.log(`❌ เกิดข้อผิดพลาด: ${error.message}`)
  }
}

investigateGassana()
