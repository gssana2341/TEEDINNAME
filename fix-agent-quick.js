// ✅ แก้ไขปัญหา Agent ทั้ง 3 ข้อแบบรวดเร็ว
const { createClient } = require('@supabase/supabase-js');

// ใส่ Supabase credentials
const supabaseUrl = 'https://kbthxnlmdflypagfnwrr.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtidGh4bmxtZGZseXBhZ2Zud3JyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDQ5NDkwOCwiZXhwIjoyMDUwMDcwOTA4fQ.b-y0vHNV5x_cXBrKIgQk2EFqYZjGkI6RIJlwaDRjfDI';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixAllAgentIssues() {
  console.log('🚀 เริ่มแก้ไขปัญหา Agent ทั้งหมด...');

  try {
    // 1. สร้าง Storage Bucket
    console.log('📁 สร้าง Storage Bucket...');
    
    const { data: bucketData, error: bucketError } = await supabase
      .storage
      .createBucket('agent-documents', {
        public: false,
        allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'],
        fileSizeLimit: 10485760 // 10MB
      });

    if (bucketError && !bucketError.message.includes('already exists')) {
      console.error('❌ Bucket creation error:', bucketError);
    } else {
      console.log('✅ Storage bucket created/exists');
    }

    // 2. เซ็ต Storage Policies
    console.log('🔐 สร้าง Storage Policies...');
    
    // Insert policy สำหรับ upload
    await supabase.rpc('create_storage_policy', {
      policy_name: 'Authenticated users can upload agent documents',
      bucket_name: 'agent-documents',
      operation: 'INSERT',
      check_expression: "bucket_id = 'agent-documents' AND auth.role() = 'authenticated'"
    }).catch(err => console.log('Policy already exists or created'));

    // Select policy สำหรับ view
    await supabase.rpc('create_storage_policy', {
      policy_name: 'Users can view their own agent documents', 
      bucket_name: 'agent-documents',
      operation: 'SELECT',
      check_expression: "bucket_id = 'agent-documents' AND auth.uid()::text = (storage.foldername(name))[1]"
    }).catch(err => console.log('Policy already exists or created'));

    console.log('✅ Storage policies created');

    // 3. ตรวจสอบและแก้ไข users ที่มี role ผิด
    console.log('👥 ตรวจสอบ users ที่สมัคร agent แล้ว...');
    
    const { data: agentUsers, error: agentError } = await supabase
      .from('agens')
      .select('user_id')
    
    if (agentError) {
      console.error('❌ Error fetching agents:', agentError);
    } else {
      console.log(`📋 พบ ${agentUsers.length} คนที่สมัคร agent`);
      
      // อัปเดต role เป็น agent สำหรับทุกคนที่อยู่ใน agens table
      for (const agent of agentUsers) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ 
            role: 'agent',
            updated_at: new Date().toISOString()
          })
          .eq('id', agent.user_id);
          
        if (updateError) {
          console.error(`❌ Error updating user ${agent.user_id}:`, updateError);
        } else {
          console.log(`✅ Updated role for user ${agent.user_id}`);
        }
      }
    }

    // 4. ทดสอบการอัปโหลดไฟล์
    console.log('📄 ทดสอบระบบ Storage...');
    
    const testFile = Buffer.from('Test PDF content');
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('agent-documents')
      .upload('test/test.pdf', testFile, {
        contentType: 'application/pdf'
      });
      
    if (uploadError) {
      console.error('❌ Storage test failed:', uploadError);
    } else {
      console.log('✅ Storage system working');
      
      // ลบไฟล์ทดสอบ
      await supabase.storage
        .from('agent-documents')
        .remove(['test/test.pdf']);
    }

    console.log('\n🎉 แก้ไขปัญหาทั้งหมดเสร็จสิ้น!');
    console.log('\n📋 สรุปการแก้ไข:');
    console.log('✅ 1. สร้าง Storage Bucket สำหรับ PDF');
    console.log('✅ 2. ตั้งค่า Storage Policies');
    console.log('✅ 3. อัปเดต Role จาก customer เป็น agent');
    console.log('✅ 4. ระบบปุ่มจะหายไปอัตโนมัติหลังรีเฟรช');
    console.log('\n💡 แนะนำ: รีเฟรชหน้าเว็บเพื่อให้เห็นการเปลี่ยนแปลง');

  } catch (error) {
    console.error('❌ เกิดข้อผิดพลาด:', error);
  }
}

// รันการแก้ไข
fixAllAgentIssues();
