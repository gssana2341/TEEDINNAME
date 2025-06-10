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

// ฟังก์ชันลบผู้ใช้อย่างสมบูรณ์
async function deleteUserCompletely(userEmail) {
  console.log(`🗑️  กำลังลบผู้ใช้: ${userEmail}`)
  
  try {
    // 1. ค้นหาข้อมูลผู้ใช้
    const { data: publicUser } = await supabase
      .from('users')
      .select('*')
      .eq('email', userEmail)
      .single()

    if (!publicUser) {
      console.log(`   ❌ ไม่พบผู้ใช้ในฐานข้อมูล`)
      return false
    }

    const userId = publicUser.id
    console.log(`   📋 User ID: ${userId}`)

    // 2. ลบข้อมูลที่เกี่ยวข้องทั้งหมดก่อน
    console.log(`   🔧 ลบข้อมูลที่เกี่ยวข้อง...`)

    // ลบจากตาราง properties (ถ้าเป็น agent)
    const { error: propertiesError } = await supabase
      .from('properties')
      .delete()
      .eq('agent_id', userId)
    
    if (propertiesError && !propertiesError.message.includes('No rows')) {
      console.log(`   ⚠️  Properties: ${propertiesError.message}`)
    } else {
      console.log(`   ✅ ลบ properties สำเร็จ`)
    }

    // ลบจากตาราง agents (ถ้าเป็น agent)
    const { error: agentsError } = await supabase
      .from('agents')
      .delete()
      .eq('user_id', userId)
    
    if (agentsError && !agentsError.message.includes('No rows')) {
      console.log(`   ⚠️  Agents: ${agentsError.message}`)
    } else {
      console.log(`   ✅ ลบ agents สำเร็จ`)
    }

    // ลบจากตาราง admins (ถ้าเป็น admin)
    const { error: adminsError } = await supabase
      .from('admins')
      .delete()
      .eq('user_id', userId)
    
    if (adminsError && !adminsError.message.includes('No rows')) {
      console.log(`   ⚠️  Admins: ${adminsError.message}`)
    } else {
      console.log(`   ✅ ลบ admins สำเร็จ`)
    }

    // ลบจากตาราง customers (ถ้าเป็น customer)
    const { error: customersError } = await supabase
      .from('customers')
      .delete()
      .eq('user_id', userId)
    
    if (customersError && !customersError.message.includes('No rows')) {
      console.log(`   ⚠️  Customers: ${customersError.message}`)
    } else {
      console.log(`   ✅ ลบ customers สำเร็จ`)
    }

    // ลบจากตาราง profiles
    const { error: profilesError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId)
    
    if (profilesError && !profilesError.message.includes('No rows')) {
      console.log(`   ⚠️  Profiles: ${profilesError.message}`)
    } else {
      console.log(`   ✅ ลบ profiles สำเร็จ`)
    }

    // 3. ลบจาก public.users
    const { error: usersError } = await supabase
      .from('users')
      .delete()
      .eq('email', userEmail)

    if (usersError) {
      console.log(`   ❌ ไม่สามารถลบจาก users table: ${usersError.message}`)
      return false
    } else {
      console.log(`   ✅ ลบจาก users table สำเร็จ`)
    }

    // 4. ลบจาก auth.users
    const { data: authUsers } = await supabase.auth.admin.listUsers()
    const authUser = authUsers.users.find(u => u.email === userEmail)
    
    if (authUser) {
      const { error: authError } = await supabase.auth.admin.deleteUser(authUser.id)
      
      if (authError) {
        console.log(`   ❌ ไม่สามารถลบจาก auth: ${authError.message}`)
        return false
      } else {
        console.log(`   ✅ ลบจาก auth สำเร็จ`)
      }
    } else {
      console.log(`   ⚠️  ไม่พบใน auth.users`)
    }

    console.log(`   🎉 ลบผู้ใช้ ${userEmail} สำเร็จ!`)
    return true

  } catch (error) {
    console.log(`   ❌ เกิดข้อผิดพลาด: ${error.message}`)
    return false
  }
}

// ฟังก์ชันสร้างการลบแบบปลอดภัย API
async function createSafeDeleteFunction() {
  console.log('🔧 สร้างฟังก์ชันการลบแบบปลอดภัย...\n')

  const deleteUserFunction = `
CREATE OR REPLACE FUNCTION delete_user_completely(user_email TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
    auth_user_id UUID;
BEGIN
    -- หา user_id จาก email
    SELECT id INTO target_user_id 
    FROM users 
    WHERE email = user_email;
    
    IF target_user_id IS NULL THEN
        RAISE NOTICE 'User not found: %', user_email;
        RETURN FALSE;
    END IF;
    
    -- ลบข้อมูลที่เกี่ยวข้องทั้งหมด
    DELETE FROM properties WHERE agent_id = target_user_id;
    DELETE FROM agents WHERE user_id = target_user_id;
    DELETE FROM admins WHERE user_id = target_user_id;
    DELETE FROM customers WHERE user_id = target_user_id;
    DELETE FROM profiles WHERE user_id = target_user_id;
    
    -- ลบจาก users table
    DELETE FROM users WHERE id = target_user_id;
    
    RAISE NOTICE 'User % deleted successfully', user_email;
    RETURN TRUE;
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error deleting user %: %', user_email, SQLERRM;
        RETURN FALSE;
END;
$$;
`

  try {
    const { error } = await supabase.rpc('exec_sql', { sql: deleteUserFunction })
    
    if (error) {
      console.log('❌ ไม่สามารถสร้างฟังก์ชันได้:', error.message)
      
      // ลองวิธีอื่น - execute โดยตรง
      const { error: directError } = await supabase
        .from('users')
        .select('count')
        .limit(0) // ไม่ดึงข้อมูล แต่ต้องการ connection

      console.log('🔧 กำลังสร้างฟังก์ชันด้วยวิธีอื่น...')
      
    } else {
      console.log('✅ สร้างฟังก์ชันการลบแบบปลอดภัยสำเร็จ')
    }
  } catch (error) {
    console.log('⚠️  ไม่สามารถสร้างฟังก์ชันได้:', error.message)
  }
}

async function demonstrateUserDeletion() {
  console.log('🎯 การสาธิตการลบผู้ใช้อย่างปลอดภัย\n')
  
  // แสดงผู้ใช้ปัจจุบัน
  const { data: currentUsers } = await supabase.from('users').select('email, role')
  console.log('📋 ผู้ใช้ปัจจุบัน:')
  currentUsers.forEach((user, index) => {
    console.log(`   ${index + 1}. ${user.email} (${user.role})`)
  })
  
  console.log('\n💡 วิธีการใช้งาน:')
  console.log('1. เรียกใช้ฟังก์ชัน: deleteUserCompletely("email@example.com")')
  console.log('2. ฟังก์ชันจะลบข้อมูลทั้งหมดที่เกี่ยวข้องก่อน')
  console.log('3. จากนั้นลบจาก users table และ auth.users')
  console.log('4. ผู้ใช้จะไม่สามารถเข้าสู่ระบบได้อีก')
  
  console.log('\n⚠️  ข้อควรระวัง:')
  console.log('- การลบเป็นการถาวร ไม่สามารถย้อนกลับได้')
  console.log('- ข้อมูล properties ที่สร้างโดยผู้ใช้จะถูกลบด้วย')
  console.log('- ควรสำรองข้อมูลก่อนลบ')
}

// รันการสาธิต
demonstrateUserDeletion()

// Export ฟังก์ชันสำหรับใช้งาน
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { deleteUserCompletely }
}
