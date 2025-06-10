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

async function finalLoginTest() {
  console.log('🧪 การทดสอบครั้งสุดท้าย - เข้าสู่ระบบผู้ใช้ทุกคน\n')

  // รายการผู้ใช้ที่ไม่ใช่ test accounts พร้อมรหัสผ่านที่อัปเดตแล้ว
  const realUsers = [
    { email: 'xateee@gmail.com', password: 'awdawdasd1' },
    { email: 'bkknm121@gmail.com', password: 'awdawdasd1' },
    { email: '9methas@gmail.com', password: 'methas2448' },
    { email: 'methasphoynxk@gmail.com', password: 'Methas2448' },
    { email: 'gassana2341@gmail.com', password: 'admin123' }, // รหัสผ่านใหม่
    { email: 'zoomgamer807@gmail.com', password: 'zoomgik2341' },
    { email: 'xateeeiun@gmail.com', password: 'awdawdasd1' },
    { email: 'asngiun@gmail.com', password: 'awdasdasd1' },
    { email: 'methas2448@gmail.com', password: 'methas2448' },
    { email: 'zoom2564@gmail.com', password: '12341234' }
  ]

  let successCount = 0
  let failCount = 0

  for (const user of realUsers) {
    console.log(`🔐 ทดสอบ: ${user.email}`)
    
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      })

      if (signInError) {
        console.log(`   ❌ เข้าสู่ระบบไม่ได้: ${signInError.message}`)
        failCount++
      } else if (signInData.user) {
        console.log(`   ✅ เข้าสู่ระบบสำเร็จ`)
        successCount++
        await supabase.auth.signOut() // ออกจากระบบ
      }

    } catch (error) {
      console.log(`   ❌ เกิดข้อผิดพลาด: ${error.message}`)
      failCount++
    }
  }

  console.log(`\n📊 สรุปผลการทดสอบ:`)
  console.log(`✅ เข้าสู่ระบบได้: ${successCount} คน`)
  console.log(`❌ เข้าสู่ระบบไม่ได้: ${failCount} คน`)
  console.log(`📈 อัตราความสำเร็จ: ${((successCount / (successCount + failCount)) * 100).toFixed(1)}%`)

  if (failCount === 0) {
    console.log('\n🎉 ยอดเยี่ยม! ผู้ใช้ทุกคนสามารถเข้าสู่ระบบได้แล้ว!')
  } else {
    console.log('\n⚠️  ยังมีผู้ใช้บางคนที่เข้าสู่ระบบไม่ได้')
  }

  console.log('\n📝 รหัสผ่านที่ใช้งานได้ในปัจจุบัน:')
  for (const user of realUsers) {
    console.log(`   ${user.email}: ${user.password}`)
  }
}

finalLoginTest()
