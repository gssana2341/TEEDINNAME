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

async function syncAuthWithUsersTable() {
  console.log('🔄 ซิงค์ข้อมูลระหว่าง Auth table และ Users table...\n')

  try {
    // 1. ดึงข้อมูลจาก auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    if (authError) {
      console.error('❌ Error fetching auth users:', authError)
      return
    }

    console.log(`📋 พบผู้ใช้ใน auth.users: ${authUsers.users.length} คน`)

    // 2. ดึงข้อมูลจาก public.users
    const { data: publicUsers, error: publicError } = await supabase
      .from('users')
      .select('*')

    if (publicError) {
      console.error('❌ Error fetching public users:', publicError)
      return
    }

    console.log(`📋 พบผู้ใช้ใน public.users: ${publicUsers.length} คน\n`)

    // 3. หาผู้ใช้ที่อยู่ใน auth แต่ไม่อยู่ใน public.users
    const authEmails = new Set(authUsers.users.map(u => u.email))
    const publicEmails = new Set(publicUsers.map(u => u.email))
    
    const onlyInAuth = authUsers.users.filter(authUser => !publicEmails.has(authUser.email))
    const onlyInPublic = publicUsers.filter(publicUser => !authEmails.has(publicUser.email))

    console.log('🔍 การวิเคราะห์ความไม่ตรงกัน:')

    if (onlyInAuth.length > 0) {
      console.log(`\n⚠️  ผู้ใช้ที่อยู่ใน auth.users แต่ไม่อยู่ใน public.users (${onlyInAuth.length} คน):`)
      for (const user of onlyInAuth) {
        console.log(`   - ${user.email} (Auth ID: ${user.id})`)
        
        // ลบออกจาก auth.users เพื่อให้ซิงค์กัน
        console.log(`     🗑️  กำลังลบจาก auth.users...`)
        const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
        
        if (deleteError) {
          console.log(`     ❌ ไม่สามารถลบได้: ${deleteError.message}`)
        } else {
          console.log(`     ✅ ลบสำเร็จ`)
        }
      }
    }

    if (onlyInPublic.length > 0) {
      console.log(`\n⚠️  ผู้ใช้ที่อยู่ใน public.users แต่ไม่อยู่ใน auth.users (${onlyInPublic.length} คน):`)
      for (const user of onlyInPublic) {
        console.log(`   - ${user.email} (Public ID: ${user.id})`)
        
        // ลบออกจาก public.users เพื่อให้ซิงค์กัน
        console.log(`     🗑️  กำลังลบจาก public.users...`)
        const { error: deleteError } = await supabase
          .from('users')
          .delete()
          .eq('email', user.email)
          
        if (deleteError) {
          console.log(`     ❌ ไม่สามารถลบได้: ${deleteError.message}`)
        } else {
          console.log(`     ✅ ลบสำเร็จ`)
        }
      }
    }

    if (onlyInAuth.length === 0 && onlyInPublic.length === 0) {
      console.log('✅ ข้อมูลใน auth.users และ public.users ซิงค์กันแล้ว')
    }

    // 4. ตรวจสอบผู้ใช้ที่มี ID ไม่ตรงกัน
    console.log('\n🔍 ตรวจสอบ ID ที่ไม่ตรงกัน:')
    let mismatchCount = 0
    
    for (const authUser of authUsers.users) {
      if (publicEmails.has(authUser.email)) {
        const publicUser = publicUsers.find(u => u.email === authUser.email)
        if (publicUser && publicUser.id !== authUser.id) {
          console.log(`⚠️  ${authUser.email}: Auth ID (${authUser.id}) != Public ID (${publicUser.id})`)
          mismatchCount++
          
          // อัปเดต public.users ให้ใช้ ID เดียวกับ auth.users
          console.log(`   🔧 กำลังอัปเดต public.users ให้ใช้ Auth ID...`)
          const { error: updateError } = await supabase
            .from('users')
            .update({ id: authUser.id })
            .eq('email', authUser.email)
            
          if (updateError) {
            console.log(`   ❌ ไม่สามารถอัปเดตได้: ${updateError.message}`)
          } else {
            console.log(`   ✅ อัปเดตสำเร็จ`)
          }
        }
      }
    }

    if (mismatchCount === 0) {
      console.log('✅ ID ของผู้ใช้ทั้งหมดตรงกัน')
    }

    // 5. สรุปผลลัพธ์หลังการซิงค์
    console.log('\n📊 ตรวจสอบข้อมูลหลังการซิงค์:')
    
    const { data: updatedAuthUsers } = await supabase.auth.admin.listUsers()
    const { data: updatedPublicUsers } = await supabase.from('users').select('*')
    
    console.log(`   auth.users: ${updatedAuthUsers.users.length} คน`)
    console.log(`   public.users: ${updatedPublicUsers.length} คน`)
    
    if (updatedAuthUsers.users.length === updatedPublicUsers.length) {
      console.log('✅ จำนวนผู้ใช้ตรงกันแล้ว')
    } else {
      console.log('⚠️  จำนวนผู้ใช้ยังไม่ตรงกัน')
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error)
  }
}

syncAuthWithUsersTable()
