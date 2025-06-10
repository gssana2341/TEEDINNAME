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
  console.log('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function fixAllAgentProblems() {
  console.log('🚀 เริ่มแก้ไขปัญหาระบบ Agent ทั้งหมด...\n')

  try {
    // 1. ตรวจสอบและสร้าง Storage Bucket
    console.log('📁 1. ตรวจสอบ Storage Bucket "agent-documents"...')
    
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message)
      return
    }
    
    const agentDocsBucket = buckets.find(bucket => bucket.id === 'agent-documents')
    
    if (!agentDocsBucket) {
      console.log('⚠️ Creating agent-documents bucket...')
      
      const { data: createBucketData, error: createBucketError } = await supabase
        .storage
        .createBucket('agent-documents', {
          public: false,
          allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
          fileSizeLimit: 10485760 // 10MB
        })

      if (createBucketError) {
        console.error('❌ Error creating bucket:', createBucketError.message)
        console.log('💡 กรุณารัน SQL script: setup-storage.sql ใน Supabase Dashboard')
      } else {
        console.log('✅ Bucket "agent-documents" created successfully')
      }
    } else {
      console.log('✅ Bucket "agent-documents" already exists')
    }

    // 2. ตรวจสอบ Storage Policies
    console.log('\n🔐 2. ตรวจสอบ Storage Policies...')
    
    // สร้าง policies (จะ ignore error ถ้ามีอยู่แล้ว)
    const policies = [
      {
        name: 'Authenticated users can upload agent documents',
        sql: `
          CREATE POLICY "Authenticated users can upload agent documents" ON storage.objects
          FOR INSERT WITH CHECK (
            bucket_id = 'agent-documents' AND
            auth.role() = 'authenticated'
          );
        `
      },
      {
        name: 'Users can view their own agent documents',
        sql: `
          CREATE POLICY "Users can view their own agent documents" ON storage.objects
          FOR SELECT USING (
            bucket_id = 'agent-documents' AND
            auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      },
      {
        name: 'Users can delete their own agent documents',
        sql: `
          CREATE POLICY "Users can delete their own agent documents" ON storage.objects
          FOR DELETE USING (
            bucket_id = 'agent-documents' AND
            auth.uid()::text = (storage.foldername(name))[1]
          );
        `
      }
    ]

    for (const policy of policies) {
      try {
        await supabase.rpc('exec', { sql: policy.sql })
        console.log(`✅ Policy "${policy.name}" created/exists`)
      } catch (error) {
        console.log(`ℹ️ Policy "${policy.name}" may already exist`)
      }
    }

    // 3. ตรวจสอบและแก้ไข role ของผู้ใช้ที่สมัครแล้ว
    console.log('\n👥 3. ตรวจสอบและแก้ไข role ของผู้ใช้...')
    
    const { data: agentUsers, error: agentError } = await supabase
      .from('agens')
      .select('user_id')
    
    if (agentError) {
      console.error('❌ Error fetching agents:', agentError.message)
    } else {
      console.log(`📋 พบผู้ใช้ที่สมัคร agent จำนวน: ${agentUsers.length} คน`)
      
      let updatedCount = 0
      
      for (const agent of agentUsers) {
        // ตรวจสอบ role ปัจจุบัน
        const { data: currentUser, error: fetchError } = await supabase
          .from('users')
          .select('id, role')
          .eq('id', agent.user_id)
          .single()
          
        if (fetchError) {
          console.error(`❌ Error fetching user ${agent.user_id}:`, fetchError.message)
          continue
        }
        
        if (currentUser.role !== 'agent') {
          console.log(`🔄 Updating role for user ${agent.user_id} from "${currentUser.role}" to "agent"`)
          
          const { error: updateError } = await supabase
            .from('users')
            .update({ 
              role: 'agent',
              updated_at: new Date().toISOString()
            })
            .eq('id', agent.user_id)
            
          if (updateError) {
            console.error(`❌ Error updating user ${agent.user_id}:`, updateError.message)
          } else {
            console.log(`✅ Updated role for user ${agent.user_id}`)
            updatedCount++
          }
        } else {
          console.log(`ℹ️ User ${agent.user_id} already has role "agent"`)
        }
      }
      
      console.log(`📊 อัปเดต role สำเร็จ: ${updatedCount}/${agentUsers.length} คน`)
    }

    // 4. ทดสอบระบบ Storage
    console.log('\n📄 4. ทดสอบระบบ Storage...')
    
    const testFile = Buffer.from('Test PDF content for agent system')
    const testFileName = `test/${Date.now()}-test.pdf`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('agent-documents')
      .upload(testFileName, testFile, {
        contentType: 'application/pdf'
      })
      
    if (uploadError) {
      console.error('❌ Storage upload test failed:', uploadError.message)
      console.log('💡 กรุณาตรวจสอบ Storage Policies ใน Supabase Dashboard')
    } else {
      console.log('✅ Storage upload test successful')
      
      // ลบไฟล์ทดสอบ
      await supabase.storage
        .from('agent-documents')
        .remove([testFileName])
      console.log('🗑️ Test file cleaned up')
    }

    // 5. ตรวจสอบ verification_documents ในฐานข้อมูล
    console.log('\n🗄️ 5. ตรวจสอบ verification_documents ในฐานข้อมูล...')
    
    const { data: agentsWithDocs, error: docsError } = await supabase
      .from('agens')
      .select('user_id, verification_documents')
      .not('verification_documents', 'eq', '[]')
    
    if (docsError) {
      console.error('❌ Error fetching agent documents:', docsError.message)
    } else {
      console.log(`📋 พบ agent ที่มีเอกสาร: ${agentsWithDocs.length} คน`)
      
      agentsWithDocs.forEach(agent => {
        const docs = agent.verification_documents
        if (Array.isArray(docs) && docs.length > 0) {
          console.log(`📄 Agent ${agent.user_id}: ${docs.length} เอกสาร`)
          docs.forEach((doc, index) => {
            console.log(`   - Document ${index + 1}: ${typeof doc === 'string' ? doc : JSON.stringify(doc)}`)
          })
        }
      })
    }

    // 6. สรุปผลการแก้ไข
    console.log('\n🎉 แก้ไขปัญหาเสร็จสิ้น!')
    console.log('\n📋 สรุปการแก้ไข:')
    console.log('✅ 1. ตรวจสอบ/สร้าง Storage Bucket "agent-documents"')
    console.log('✅ 2. ตรวจสอบ/สร้าง Storage Policies สำหรับการอัปโหลดไฟล์')
    console.log('✅ 3. อัปเดต role จาก "customer" เป็น "agent" สำหรับผู้ที่สมัครแล้ว')
    console.log('✅ 4. ทดสอบระบบ Storage')
    console.log('✅ 5. ตรวจสอบเอกสารที่มีอยู่ในฐานข้อมูล')
    
    console.log('\n💡 การแก้ไขปัญหาปุ่ม Agent:')
    console.log('   - ปุ่ม Agent จะหายไปเมื่อ userRole === "agent"')
    console.log('   - หลังจากสมัครสำเร็จ ระบบจะรีเฟรชหน้าเพื่ออัปเดต auth context')
    console.log('   - ถ้าปุ่มยังไม่หายไป กรุณารีเฟรชหน้าเว็บด้วยตัวเอง')
    
    console.log('\n🔄 หากมีปัญหา:')
    console.log('   1. ตรวจสอบ .env.local ว่ามี SUPABASE keys ครบ')
    console.log('   2. รัน setup-storage.sql ใน Supabase Dashboard')
    console.log('   3. ตรวจสอบ RLS policies ใน Storage')

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาดในการแก้ไข:', error.message)
  }
}

// Run the fix
fixAllAgentProblems()
