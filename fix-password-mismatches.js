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

async function fixPasswordMismatches() {
  console.log('🔧 แก้ไขรหัสผ่านที่ไม่ตรงกันในระบบ...\n')

  // รายการผู้ใช้ที่ต้องแก้ไข
  const usersToFix = [
    {
      email: 'xateee@gmail.com',
      correctPassword: 'awdawdasd1', // รหัสผ่านที่ใช้งานได้จริง
      wrongPassword: 'awdasdasd1'   // รหัสผ่านที่ผิดในฐานข้อมูล
    },
    {
      email: 'bkknm121@gmail.com',
      correctPassword: 'awdawdasd1', // รหัสผ่านที่ใช้งานได้จริง
      wrongPassword: 'awdasdasd1'   // รหัสผ่านที่ผิดในฐานข้อมูล
    }
  ]

  for (const user of usersToFix) {
    console.log(`🔄 แก้ไข: ${user.email}`)
    
    try {
      // 1. อัปเดตรหัสผ่านในฐานข้อมูล users table
      const { data: updateData, error: updateError } = await supabase
        .from('users')
        .update({ password: user.correctPassword })
        .eq('email', user.email)
        .select()

      if (updateError) {
        console.log(`   ❌ ไม่สามารถอัปเดตในตาราง users: ${updateError.message}`)
        continue
      }

      if (updateData && updateData.length > 0) {
        console.log(`   ✅ อัปเดตรหัสผ่านในตาราง users สำเร็จ`)
      }

      // 2. อัปเดตรหัสผ่านใน Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.updateUserById(
        updateData[0].id,
        { password: user.correctPassword }
      )

      if (authError) {
        console.log(`   ⚠️  ไม่สามารถอัปเดตใน Auth: ${authError.message}`)
      } else {
        console.log(`   ✅ อัปเดตรหัสผ่านใน Auth สำเร็จ`)
      }

      // 3. ทดสอบการเข้าสู่ระบบ
      console.log(`   🧪 ทดสอบการเข้าสู่ระบบด้วยรหัสผ่าน: ${user.correctPassword}`)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.correctPassword
      })

      if (signInError) {
        console.log(`   ❌ ยังเข้าสู่ระบบไม่ได้: ${signInError.message}`)
      } else {
        console.log(`   ✅ เข้าสู่ระบบได้แล้ว!`)
        await supabase.auth.signOut() // ออกจากระบบ
      }

    } catch (error) {
      console.log(`   ❌ เกิดข้อผิดพลาด: ${error.message}`)
    }
    
    console.log('') // เว้นบรรทัด
  }

  // ตรวจสอบ gassana2341@gmail.com แยกต่างหาก
  console.log('🔍 ตรวจสอบ gassana2341@gmail.com...')
  
  try {
    // ทดสอบรหัสผ่านหลายแบบ
    const testPasswords = ['123456123456', '123456', 'password', 'admin123', 'gassana2341']
    
    for (const testPassword of testPasswords) {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: 'gassana2341@gmail.com',
        password: testPassword
      })

      if (!signInError && signInData.user) {
        console.log(`   ✅ เข้าสู่ระบบได้ด้วยรหัสผ่าน: ${testPassword}`)
        
        // อัปเดตฐานข้อมูลให้ตรงกัน
        const { error: updateError } = await supabase
          .from('users')
          .update({ password: testPassword })
          .eq('email', 'gassana2341@gmail.com')

        if (!updateError) {
          console.log(`   ✅ อัปเดตรหัสผ่านในฐานข้อมูลเป็น: ${testPassword}`)
        }
        
        await supabase.auth.signOut()
        break
      }
    }
  } catch (error) {
    console.log(`   ❌ เกิดข้อผิดพลาดกับ gassana2341@gmail.com: ${error.message}`)
  }

  console.log('\n🎉 การแก้ไขเสร็จสิ้น!')
  console.log('\nสรุปรหัสผ่านที่ใช้งานได้:')
  console.log('- xateee@gmail.com: awdawdasd1')
  console.log('- bkknm121@gmail.com: awdawdasd1')
  console.log('- gassana2341@gmail.com: (ตรวจสอบผลลัพธ์ด้านบน)')
}

fixPasswordMismatches()
