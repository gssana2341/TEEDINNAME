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

async function checkAllUsers() {
  console.log('🔍 ตรวจสอบผู้ใช้ทั้งหมดในระบบ...\n')
  
  try {
    // 1. ดึงข้อมูลจาก auth.users
    console.log('📋 ข้อมูลจาก auth.users:')
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }

    console.log(`พบผู้ใช้ใน auth.users: ${authUsers.users.length} คน`)
    authUsers.users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (ID: ${user.id}) - สร้างเมื่อ: ${new Date(user.created_at).toLocaleString('th-TH')}`)
      if (user.email_confirmed_at) {
        console.log(`   ✅ ยืนยันอีเมลแล้วเมื่อ: ${new Date(user.email_confirmed_at).toLocaleString('th-TH')}`)
      } else {
        console.log(`   ❌ ยังไม่ยืนยันอีเมล`)
      }
    })

    console.log('\n📋 ข้อมูลจาก public.users:')
    
    // 2. ดึงข้อมูลจาก public.users
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (publicError) {
      console.error('❌ Error fetching public users:', publicError)
      return
    }

    console.log(`พบผู้ใช้ใน public.users: ${publicUsers.length} คน`)
    publicUsers.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (ID: ${user.id})`)
      console.log(`   - ชื่อ: ${user.first_name || 'ไม่ระบุ'} ${user.last_name || ''}`)
      console.log(`   - เบอร์โทร: ${user.phone || 'ไม่ระบุ'}`)
      console.log(`   - รหัสผ่าน: ${user.password || 'ไม่ระบุ'}`)
      console.log(`   - บทบาท: ${user.role || 'ไม่ระบุ'}`)
      console.log(`   - สร้างเมื่อ: ${new Date(user.created_at).toLocaleString('th-TH')}`)
    })

    console.log('\n🔍 การเปรียบเทียบข้อมูล:')
    
    // 3. เปรียบเทียบข้อมูล
    const authEmails = new Set(authUsers.users.map(u => u.email))
    const publicEmails = new Set(publicUsers.map(u => u.email))
    
    // หาผู้ใช้ที่อยู่ใน auth แต่ไม่อยู่ใน public
    const onlyInAuth = [...authEmails].filter(email => !publicEmails.has(email))
    if (onlyInAuth.length > 0) {
      console.log('⚠️  ผู้ใช้ที่อยู่ใน auth.users แต่ไม่อยู่ใน public.users:')
      onlyInAuth.forEach(email => console.log(`   - ${email}`))
    }

    // หาผู้ใช้ที่อยู่ใน public แต่ไม่อยู่ใน auth
    const onlyInPublic = [...publicEmails].filter(email => !authEmails.has(email))
    if (onlyInPublic.length > 0) {
      console.log('⚠️  ผู้ใช้ที่อยู่ใน public.users แต่ไม่อยู่ใน auth.users:')
      onlyInPublic.forEach(email => console.log(`   - ${email}`))
    }

    if (onlyInAuth.length === 0 && onlyInPublic.length === 0) {
      console.log('✅ ข้อมูลผู้ใช้ใน auth.users และ public.users ตรงกัน')
    }

    console.log('\n🔐 ทดสอบการเข้าสู่ระบบ:')
    
    // 4. ทดสอบการเข้าสู่ระบบสำหรับผู้ใช้ที่ไม่ใช่ test accounts
    const testEmails = ['test@example.com', 'premium@example.com']
    const realUsers = publicUsers.filter(user => !testEmails.includes(user.email))
    
    for (const user of realUsers) {
      if (user.password && user.password !== 'supabase_managed') {
        console.log(`\n🧪 ทดสอบ: ${user.email}`)
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: user.email,
            password: user.password
          })

          if (signInError) {
            console.log(`   ❌ เข้าสู่ระบบไม่ได้: ${signInError.message}`)
            
            // ลองทดสอบรหัสผ่านทางเลือก
            const alternativePasswords = [
              'awdasdasd1',  // รหัสผ่านที่แก้ไขแล้ว
              'awdawdasd1',  // รหัสผ่านทางเลือก
              'password123',
              '123456'
            ]
            
            for (const altPassword of alternativePasswords) {
              try {
                const { data: altData, error: altError } = await supabase.auth.signInWithPassword({
                  email: user.email,
                  password: altPassword
                })
                
                if (!altError && altData.user) {
                  console.log(`   ✅ เข้าสู่ระบบได้ด้วยรหัสผ่าน: ${altPassword}`)
                  console.log(`   ⚠️  รหัสผ่านในฐานข้อมูล (${user.password}) ไม่ตรงกับรหัสผ่านจริง (${altPassword})`)
                  break
                }
              } catch (e) {
                // ไม่ต้องแสดงข้อผิดพลาด
              }
            }
          } else if (signInData.user) {
            console.log(`   ✅ เข้าสู่ระบบได้: รหัสผ่าน ${user.password} ใช้งานได้`)
          }

          // ออกจากระบบ
          await supabase.auth.signOut()
          
        } catch (error) {
          console.log(`   ❌ เกิดข้อผิดพลาด: ${error.message}`)
        }
      } else {
        console.log(`\n⚠️  ${user.email}: ไม่มีรหัสผ่านในฐานข้อมูล`)
      }
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการตรวจสอบ:', error)
  }
}

checkAllUsers()
