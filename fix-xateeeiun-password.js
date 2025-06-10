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

async function fixXateeeiunPassword() {
  console.log('🔧 แก้ไขรหัสผ่านสำหรับ xateeeiun@gmail.com\n')

  const targetEmail = 'xateeeiun@gmail.com'
  const correctPassword = 'awdawdasd1'

  try {
    // 1. ตรวจสอบข้อมูลใน users table
    console.log('🔍 ตรวจสอบข้อมูลใน users table...')
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', targetEmail)
      .single()

    if (userError) {
      console.error('❌ ไม่พบข้อมูลใน users table:', userError.message)
      return
    }

    console.log('✅ พบข้อมูลใน users table:', {
      id: userData.id,
      email: userData.email,
      password_in_db: userData.password,
      role: userData.role
    })

    // 2. ทดสอบ login ด้วยรหัสผ่านปัจจุบันใน database
    console.log('\n🔐 ทดสอบ login ด้วยรหัสผ่านใน database...')
    const { data: testLogin1, error: testError1 } = await supabaseAdmin.auth.signInWithPassword({
      email: targetEmail,
      password: userData.password
    })

    if (testError1) {
      console.log(`❌ Login ด้วย "${userData.password}" ไม่ได้: ${testError1.message}`)
    } else {
      console.log(`✅ Login ด้วย "${userData.password}" ได้`)
      await supabaseAdmin.auth.signOut()
    }

    // 3. ทดสอบ login ด้วยรหัสผ่านที่ใช้งานได้จริง
    console.log('\n🔐 ทดสอบ login ด้วยรหัสผ่านที่ใช้งานได้จริง...')
    const { data: testLogin2, error: testError2 } = await supabaseAdmin.auth.signInWithPassword({
      email: targetEmail,
      password: correctPassword
    })

    if (testError2) {
      console.log(`❌ Login ด้วย "${correctPassword}" ไม่ได้: ${testError2.message}`)
    } else {
      console.log(`✅ Login ด้วย "${correctPassword}" ได้!`)
      await supabaseAdmin.auth.signOut()
    }

    // 4. อัปเดตรหัสผ่านใน custom users table ให้ตรงกับที่ใช้งานได้จริง
    if (userData.password !== correctPassword) {
      console.log(`\n🔧 อัปเดตรหัสผ่านใน users table จาก "${userData.password}" เป็น "${correctPassword}"...`)
      
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          password: correctPassword,
          updated_at: new Date().toISOString()
        })
        .eq('email', targetEmail)

      if (updateError) {
        console.error('❌ ไม่สามารถอัปเดตรหัสผ่านได้:', updateError.message)
      } else {
        console.log('✅ อัปเดตรหัสผ่านใน users table สำเร็จ!')
        
        // ตรวจสอบการอัปเดต
        const { data: verifyData, error: verifyError } = await supabaseAdmin
          .from('users')
          .select('password, updated_at')
          .eq('email', targetEmail)
          .single()

        if (verifyData) {
          console.log('📋 ข้อมูลหลังอัปเดต:', {
            password: verifyData.password,
            updated_at: verifyData.updated_at
          })
        }
      }
    } else {
      console.log('✅ รหัสผ่านใน database ตรงกับที่ใช้งานได้แล้ว')
    }

    // 5. ทดสอบ login ครั้งสุดท้าย
    console.log('\n🎯 ทดสอบ login ครั้งสุดท้าย...')
    const { data: finalTest, error: finalError } = await supabaseAdmin.auth.signInWithPassword({
      email: targetEmail,
      password: correctPassword
    })

    if (finalError) {
      console.log(`❌ ทดสอบครั้งสุดท้ายไม่สำเร็จ: ${finalError.message}`)
    } else {
      console.log('🎉 ทดสอบครั้งสุดท้ายสำเร็จ!')
      await supabaseAdmin.auth.signOut()
    }

    console.log('\n📋 สรุป:')
    console.log(`✅ อีเมล: ${targetEmail}`)
    console.log(`✅ รหัสผ่านที่ใช้งานได้: ${correctPassword}`)
    console.log('✅ ข้อมูลใน database ได้ถูกปรับให้ตรงกันแล้ว')

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error.message)
  }
}

// รันการแก้ไข
fixXateeeiunPassword()
