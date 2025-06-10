// sync-existing-users.js
// Script to sync existing users between Supabase Auth and custom tables

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key for admin operations

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function syncExistingUsers() {
  console.log('🔄 Starting sync of existing users...')
  
  try {
    // Get all users from auth.users (requires service role)
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers()
    
    if (authError) {
      console.error('❌ Error fetching auth users:', authError.message)
      return
    }

    console.log(`📊 Found ${authUsers.users.length} users in auth.users`)

    // Get all users from custom users table
    const { data: customUsers, error: customError } = await supabase
      .from('users')
      .select('*')

    if (customError) {
      console.error('❌ Error fetching custom users:', customError.message)
      return
    }

    console.log(`📊 Found ${customUsers.length} users in custom users table`)

    // Sync each auth user to custom tables
    for (const authUser of authUsers.users) {
      await syncSingleUser(authUser, customUsers)
    }

    // Check for orphaned users in custom table
    await checkOrphanedUsers(authUsers.users, customUsers)

    console.log('✅ Sync completed successfully!')

  } catch (error) {
    console.error('❌ Sync failed:', error.message)
  }
}

async function syncSingleUser(authUser, customUsers) {
  const existingUser = customUsers.find(u => u.id === authUser.id || u.email === authUser.email)
  
  if (!existingUser) {
    // Create user in custom table
    console.log(`📝 Creating user: ${authUser.email}`)
    
    const userData = {
      id: authUser.id,
      email: authUser.email,
      role: authUser.user_metadata?.role || 'customer',
      first_name: authUser.user_metadata?.first_name || '',
      last_name: authUser.user_metadata?.last_name || '',
      phone: authUser.user_metadata?.phone || '',
      created_at: authUser.created_at,
      updated_at: new Date().toISOString()
    }

    const { error: insertError } = await supabase
      .from('users')
      .insert(userData)

    if (insertError) {
      console.error(`❌ Failed to create user ${authUser.email}:`, insertError.message)
    } else {
      console.log(`✅ Created user: ${authUser.email}`)
    }    // Also create role-specific record
    const userRole = authUser.user_metadata?.role || 'customer'
    
    if (userRole === 'customer') {
      const customerData = {
        user_id: authUser.id,
        full_name: `${authUser.user_metadata?.first_name || ''} ${authUser.user_metadata?.last_name || ''}`.trim(),
        created_at: authUser.created_at
      }

      const { error: customerError } = await supabase
        .from('customers')
        .insert(customerData)

      if (customerError && !customerError.message.includes('duplicate')) {
        console.error(`⚠️ Failed to create customer record for ${authUser.email}:`, customerError.message)
      }
    } else if (userRole === 'agent') {
      const agentData = {
        user_id: authUser.id,
        company_name: '',
        business_license_id: '',
        address: ''
      }

      const { error: agentError } = await supabase
        .from('agens')
        .insert(agentData)

      if (agentError && !agentError.message.includes('duplicate')) {
        console.error(`⚠️ Failed to create agent record for ${authUser.email}:`, agentError.message)
      }
    } else if (userRole === 'admin') {
      const adminData = {
        user_id: authUser.id,
        username: authUser.email,
        admin_password: 'change_me_' + Math.random().toString(36).substring(7)
      }

      const { error: adminError } = await supabase
        .from('admins')
        .insert(adminData)

      if (adminError && !adminError.message.includes('duplicate')) {
        console.error(`⚠️ Failed to create admin record for ${authUser.email}:`, adminError.message)
      }
    }

  } else if (existingUser.id !== authUser.id) {
    // Update user ID if it doesn't match
    console.log(`🔄 Updating user ID for: ${authUser.email}`)
    
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        id: authUser.id,
        updated_at: new Date().toISOString()
      })
      .eq('email', authUser.email)

    if (updateError) {
      console.error(`❌ Failed to update user ${authUser.email}:`, updateError.message)
    } else {
      console.log(`✅ Updated user ID: ${authUser.email}`)
    }
  } else {
    console.log(`✅ User already synced: ${authUser.email}`)
  }
}

async function checkOrphanedUsers(authUsers, customUsers) {
  console.log('🔍 Checking for orphaned users...')
  
  const authUserIds = new Set(authUsers.map(u => u.id))
  const orphanedUsers = customUsers.filter(u => !authUserIds.has(u.id))
  
  if (orphanedUsers.length > 0) {
    console.log(`⚠️ Found ${orphanedUsers.length} orphaned users in custom table:`)
    orphanedUsers.forEach(user => {
      console.log(`   - ${user.email} (ID: ${user.id})`)
    })
    console.log('   These users exist in custom table but not in auth.users')
  } else {
    console.log('✅ No orphaned users found')
  }
}

// Run the sync
syncExistingUsers()
