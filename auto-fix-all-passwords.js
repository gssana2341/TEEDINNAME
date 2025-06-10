const { createClient } = require('@supabase/supabase-js')

// ใช้ค่าที่ถูกต้องจากไฟล์ environment
const supabaseUrl = 'https://kxkryylxfkkjgbgtxfog.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt4a3J5eWx4ZmtramdiZ3R4Zm9nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjgwMDU4MywiZXhwIjoyMDYyMzc2NTgzfQ.6Jq5oyxsaw9wN3Z79PUazCxHefbdzkBmJpjtbLq2HAg'

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// รายการรหัสผ่านที่ถูกต้องสำหรับแต่ละ user
const knownPasswords = {
  'xateee@gmail.com': 'awdawdasd1',
  'bkknm121@gmail.com': 'awdawdasd1',
  '9methas@gmail.com': 'methas2448',
  'methasphoynxk@gmail.com': 'Methas2448',
  'gassana2341@gmail.com': 'admin123',
  'zoomgamer807@gmail.com': 'zoomgik2341',
  'xateeeiun@gmail.com': 'awdawdasd1',
  'asngiun@gmail.com': 'awdasdasd1',
  'methas2448@gmail.com': 'methas2448',
  'zoom2564@gmail.com': '12341234',
  // test accounts - อาจจะมีรหัสผ่านต่างกัน
  'test@example.com': 'password12345',
  'premium@example.com': 'password54321'
}

async function autoFixAllPasswordMismatches() {
  console.log('🤖 ระบบแก้ไขรหัสผ่านอัตโนมัติ\n')
  console.log('🔍 ตรวจสอบและแก้ไข password mismatches ทั้งหมด...\n')

  let fixedCount = 0
  let errorCount = 0
  let skippedCount = 0

  for (const [email, correctPassword] of Object.entries(knownPasswords)) {
    console.log(`\n📧 ตรวจสอบ: ${email}`)
    
    try {
      // 1. ดึงข้อมูลจาก users table
      const { data: userData, error: userError } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (userError) {
        if (userError.code === 'PGRST116') {
          console.log('   ⚠️  ไม่พบใน users table - ข้าม')
          skippedCount++
          continue
        } else {
          console.log(`   ❌ Error: ${userError.message}`)
          errorCount++
          continue
        }
      }

      // 2. ตรวจสอบว่ารหัสผ่านใน database ตรงกับที่ควรจะเป็นหรือไม่
      if (userData.password === correctPassword) {
        console.log(`   ✅ รหัสผ่านถูกต้องแล้ว: ${userData.password}`)
        continue
      }

      // 3. ทดสอบ login ด้วยรหัสผ่านที่คาดหวัง
      const { error: testError } = await supabaseAdmin.auth.signInWithPassword({
        email: email,
        password: correctPassword
      })

      if (testError) {
        console.log(`   ❌ Login test failed: ${testError.message}`)
        errorCount++
        continue
      }

      // ออกจากระบบหลังทดสอบ
      await supabaseAdmin.auth.signOut()

      // 4. อัปเดตรหัสผ่านใน database
      console.log(`   🔧 แก้ไข: "${userData.password}" → "${correctPassword}"`)
      
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          password: correctPassword,
          updated_at: new Date().toISOString()
        })
        .eq('email', email)

      if (updateError) {
        console.log(`   ❌ Update failed: ${updateError.message}`)
        errorCount++
      } else {
        console.log(`   ✅ แก้ไขสำเร็จ!`)
        fixedCount++
      }

    } catch (error) {
      console.log(`   ❌ Unexpected error: ${error.message}`)
      errorCount++
    }
  }

  // สรุปผลลัพธ์
  console.log('\n' + '='.repeat(50))
  console.log('📊 สรุปผลการแก้ไข:')
  console.log(`✅ แก้ไขสำเร็จ: ${fixedCount} users`)
  console.log(`⚠️  ข้าม: ${skippedCount} users`)
  console.log(`❌ เกิดข้อผิดพลาด: ${errorCount} users`)
  console.log(`📧 ตรวจสอบทั้งหมด: ${Object.keys(knownPasswords).length} users`)

  if (fixedCount > 0) {
    console.log('\n🎉 ระบบแก้ไขอัตโนมัติทำงานสำเร็จ!')
    console.log('💡 ตอนนี้รหัสผ่านใน database ตรงกับที่ใช้งานได้จริงแล้ว')
  } else {
    console.log('\n✅ ทุกอย่างเรียบร้อยแล้ว - ไม่มีรหัสผ่านที่ต้องแก้ไข')
  }
}

// รันระบบแก้ไขอัตโนมัติ
autoFixAllPasswordMismatches()
