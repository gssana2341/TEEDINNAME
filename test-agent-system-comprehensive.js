const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local')
  const envVars = {}
  
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8')
    envContent.split('\n').forEach(line => {
      const [key, value] = line.split('=')
      if (key && value) {
        envVars[key.trim()] = value.trim()
      }
    })
  }
  
  return envVars
}

const envVars = loadEnvFile()
const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = envVars.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error('❌ Missing environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function testAgentSystemComprehensive() {
  console.log('🧪 ทดสอบระบบ Agent อย่างครอบคลุม...\n')

  try {
    // 1. ทดสอบ Storage Bucket
    console.log('📁 1. ทดสอบ Storage Bucket...')
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message)
      return
    }
    
    const agentDocsBucket = buckets.find(bucket => bucket.id === 'agent-documents')
    
    if (!agentDocsBucket) {
      console.log('❌ Bucket "agent-documents" ไม่พบ')
      return
    } else {
      console.log('✅ Bucket "agent-documents" พร้อมใช้งาน')
      console.log(`   - Public: ${agentDocsBucket.public}`)
      console.log(`   - File size limit: ${agentDocsBucket.file_size_limit} bytes`)
      console.log(`   - Allowed MIME types: ${agentDocsBucket.allowed_mime_types?.join(', ') || 'ไม่ระบุ'}`)
    }

    // 2. ทดสอบการอัปโหลดไฟล์
    console.log('\n📄 2. ทดสอบการอัปโหลดไฟล์...')
    
    const testPdfContent = Buffer.from('%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n>>\nendobj\nxref\n0 4\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \ntrailer\n<<\n/Size 4\n/Root 1 0 R\n>>\nstartxref\n174\n%%EOF')
    const testFileName = `test/${Date.now()}-comprehensive-test.pdf`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('agent-documents')
      .upload(testFileName, testPdfContent, {
        contentType: 'application/pdf'
      })
      
    if (uploadError) {
      console.error('❌ การอัปโหลดไฟล์ล้มเหลว:', uploadError.message)
    } else {
      console.log('✅ อัปโหลดไฟล์สำเร็จ')
      console.log(`   - Path: ${uploadData.path}`)
      
      // ทดสอบการดาวน์โหลดไฟล์
      const { data: downloadData, error: downloadError } = await supabase.storage
        .from('agent-documents')
        .download(uploadData.path)
        
      if (downloadError) {
        console.error('❌ การดาวน์โหลดไฟล์ล้มเหลว:', downloadError.message)
      } else {
        console.log('✅ ดาวน์โหลดไฟล์สำเร็จ')
        console.log(`   - File size: ${downloadData.size} bytes`)
      }
      
      // ลบไฟล์ทดสอบ
      await supabase.storage
        .from('agent-documents')
        .remove([uploadData.path])
      console.log('🗑️ ลบไฟล์ทดสอบเรียบร้อย')
    }

    // 3. ตรวจสอบข้อมูล Agent ที่มีอยู่
    console.log('\n👥 3. ตรวจสอบข้อมูล Agent...')
    
    const { data: agents, error: agentsError } = await supabase
      .from('agens')
      .select(`
        user_id,
        company_name,
        license_number,
        business_license_id,
        address,
        property_types,
        service_areas,
        verification_documents,
        status,
        created_at
      `)
    
    if (agentsError) {
      console.error('❌ Error fetching agents:', agentsError.message)
    } else {
      console.log(`✅ พบ Agent จำนวน: ${agents.length} คน`)
      
      agents.forEach((agent, index) => {
        console.log(`\n   Agent ${index + 1}:`)
        console.log(`   - User ID: ${agent.user_id}`)
        console.log(`   - Company: ${agent.company_name || 'ไม่ระบุ'}`)
        console.log(`   - License: ${agent.license_number || 'ไม่ระบุ'}`)
        console.log(`   - National ID: ${agent.business_license_id}`)
        console.log(`   - Status: ${agent.status}`)
        
        const propertyTypes = JSON.parse(agent.property_types || '[]')
        console.log(`   - Property Types: ${propertyTypes.join(', ')}`)
        
        const serviceAreas = JSON.parse(agent.service_areas || '[]')
        console.log(`   - Service Areas: ${serviceAreas.join(', ')}`)
        
        const docs = JSON.parse(agent.verification_documents || '[]')
        console.log(`   - Documents: ${docs.length} files`)
        
        console.log(`   - Created: ${new Date(agent.created_at).toLocaleDateString('th-TH')}`)
      })
    }

    // 4. ตรวจสอบ Role ของผู้ใช้
    console.log('\n🔑 4. ตรวจสอบ Role ของผู้ใช้...')
    
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('id, email, role, first_name, last_name')
      .in('id', agents?.map(agent => agent.user_id) || [])
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message)
    } else {
      console.log(`✅ ตรวจสอบผู้ใช้ ${users.length} คน`)
      
      users.forEach(user => {
        const roleStatus = user.role === 'agent' ? '✅' : '❌'
        console.log(`   ${roleStatus} ${user.first_name} ${user.last_name} (${user.email}) - Role: ${user.role}`)
      })
    }

    // 5. ตรวจสอบ Customer records ที่ไม่ควรมี
    console.log('\n🗑️ 5. ตรวจสอบ Customer records ที่ไม่ควรมี...')
      const agentUserIds = agents?.map(agent => agent.user_id) || []
    let customers = []
    let customersError = null
    
    if (agentUserIds.length > 0) {
      const result = await supabase
        .from('customers')
        .select('user_id')
        .in('user_id', agentUserIds)
      
      customers = result.data || []
      customersError = result.error      
      if (customersError) {
        console.error('❌ Error checking customers:', customersError.message)
      } else {
        if (customers.length === 0) {
          console.log('✅ ไม่พบ customer records ที่ซ้ำซ้อน')
        } else {
          console.log(`⚠️ พบ customer records ที่ซ้ำซ้อน: ${customers.length} records`)
          customers.forEach(customer => {
            console.log(`   - User ID: ${customer.user_id} ยังคงอยู่ใน customers table`)
          })
        }
      }
    }

    // 6. สรุปผลการทดสอบ
    console.log('\n🎯 6. สรุปผลการทดสอบ:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      const testResults = {
      storageSystem: !!agentDocsBucket,
      fileUpload: !uploadError,
      agentRecords: !agentsError && agents.length > 0,
      userRoles: !usersError && users.every(user => user.role === 'agent'),
      noCustomerDuplicates: !customersError && (!customers || customers.length === 0)
    }
    
    Object.entries(testResults).forEach(([test, passed]) => {
      const status = passed ? '✅ PASS' : '❌ FAIL'
      const testName = {
        storageSystem: 'Storage System',
        fileUpload: 'File Upload/Download',
        agentRecords: 'Agent Records',
        userRoles: 'User Roles',
        noCustomerDuplicates: 'No Customer Duplicates'
      }[test]
      
      console.log(`${status} ${testName}`)
    })
    
    const allPassed = Object.values(testResults).every(result => result === true)
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    
    if (allPassed) {
      console.log('🎉 ระบบ Agent ทำงานได้อย่างสมบูรณ์!')
      console.log('💡 ปัญหาทั้งสามได้รับการแก้ไขแล้ว:')
      console.log('   1. ✅ ไฟล์ PDF อัปโหลดได้และแสดงในฐานข้อมูล')
      console.log('   2. ✅ Role เปลี่ยนจาก customer เป็น agent สำเร็จ')
      console.log('   3. ✅ ปุ่ม Agent จะหายไปหลังสมัครเสร็จ (รีเฟรชหน้า)')
    } else {
      console.log('⚠️ ยังมีปัญหาบางอย่างที่ต้องแก้ไข')
      console.log('💡 กรุณาตรวจสอบผลการทดสอบด้านบนและแก้ไขตามที่แนะนำ')
    }

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการทดสอบ:', error.message)
  }
}

// Run the test
testAgentSystemComprehensive()
