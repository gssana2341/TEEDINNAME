// Test script สำหรับทดสอบการลบ user อย่างสมบูรณ์
// ใช้งาน: node test-delete-user.js

const testDeleteUser = async (userEmail) => {
  console.log(`🗑️ กำลังทดสอบการลบ user: ${userEmail}`)
  
  try {
    const response = await fetch('http://localhost:3000/api/user?email=' + encodeURIComponent(userEmail), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // ต้อง login ด้วย admin account ก่อน
      }
    })

    const result = await response.json()
    
    if (response.ok) {
      console.log('✅ ลบ user สำเร็จ:', result.message)
      console.log('👤 User ที่ถูกลบ:', result.deletedUser)
    } else {
      console.log('❌ เกิดข้อผิดพลาด:', result.error)
    }
    
  } catch (error) {
    console.log('❌ Network error:', error.message)
  }
}

// ตัวอย่างการใช้งาน
console.log('📋 วิธีใช้งาน API Delete User:')
console.log('1. เข้าสู่ระบบด้วย admin account')
console.log('2. ไปหน้า User Management')
console.log('3. กดปุ่ม Delete ข้าง user ที่ต้องการลบ')
console.log('4. ระบบจะลบข้อมูลทั้งหมดที่เกี่ยวข้อง')

console.log('\n🔐 Admin accounts ที่สามารถลบ user ได้:')
console.log('- gassana2341@gmail.com (admin)')

// เรียกฟังก์ชันทดสอบ (เปลี่ยน email ตามต้องการ)
// testDeleteUser('test@example.com')
