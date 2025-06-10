'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from '@/components/ui/alert-dialog'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Trash2, Search, RefreshCw, Users, UserCheck, UserX } from 'lucide-react'
import { toast } from 'sonner'

interface User {
  id: string
  email: string
  role: 'admin' | 'agent' | 'customer'
  first_name: string
  last_name: string
  phone: string
  created_at: string
  updated_at: string
}

const roleLabels = {
  admin: { label: 'ผู้ดูแลระบบ', color: 'bg-red-100 text-red-800' },
  agent: { label: 'เอเจนท์', color: 'bg-blue-100 text-blue-800' },
  customer: { label: 'ลูกค้า', color: 'bg-green-100 text-green-800' }
}

export default function UsersManagement() {
  const { user: authUser, session } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    agents: 0,
    customers: 0
  })

  // ดึงข้อมูลผู้ใช้ทั้งหมด
  const fetchUsers = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching users:', error)
        toast.error('ไม่สามารถดึงข้อมูลผู้ใช้ได้')
        return
      }

      setUsers(data || [])
      
      // คำนวณสถิติ
      const newStats = {
        total: data?.length || 0,
        admins: data?.filter(u => u.role === 'admin').length || 0,
        agents: data?.filter(u => u.role === 'agent').length || 0,
        customers: data?.filter(u => u.role === 'customer').length || 0
      }
      setStats(newStats)

    } catch (error) {
      console.error('Error:', error)
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูล')
    } finally {
      setLoading(false)
    }
  }

  // กรองข้อมูลผู้ใช้
  useEffect(() => {
    let filtered = users

    // กรองตามคำค้นหา
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchLower) ||
        user.first_name?.toLowerCase().includes(searchLower) ||
        user.last_name?.toLowerCase().includes(searchLower) ||
        user.phone?.includes(searchTerm)
      )
    }

    // กรองตาม role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }, [users, searchTerm, roleFilter])

  // ลบผู้ใช้
  const deleteUser = async (userEmail: string) => {
    if (!session?.access_token) {
      toast.error('ไม่พบ token การยืนยันตัวตน')
      return
    }

    try {
      const response = await fetch(`/api/user?email=${encodeURIComponent(userEmail)}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'ไม่สามารถลบผู้ใช้ได้')
      }

      toast.success('ลบผู้ใช้สำเร็จ')
      
      // รีเฟรชข้อมูล
      await fetchUsers()

    } catch (error: any) {
      console.error('Delete user error:', error)
      toast.error(error.message || 'เกิดข้อผิดพลาดในการลบผู้ใช้')
    }
  }

  // ตรวจสอบสิทธิ์
  useEffect(() => {
    fetchUsers()
  }, [])

  // ตรวจสอบว่าเป็น admin หรือไม่
  if (!authUser) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-500">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">จัดการผู้ใช้งาน</h1>
          <p className="text-gray-600 mt-1">จัดการและควบคุมผู้ใช้งานในระบบ</p>
        </div>
        <Button onClick={fetchUsers} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          รีเฟรช
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">ผู้ใช้ทั้งหมด</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="w-8 h-8 text-red-600" />
              <div>
                <p className="text-sm text-gray-600">ผู้ดูแลระบบ</p>
                <p className="text-2xl font-bold">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserX className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">เอเจนท์</p>
                <p className="text-2xl font-bold">{stats.agents}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">ลูกค้า</p>
                <p className="text-2xl font-bold">{stats.customers}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="ค้นหาด้วยอีเมล ชื่อ หรือเบอร์โทร..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="กรองตาม Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="admin">ผู้ดูแลระบบ</SelectItem>
                  <SelectItem value="agent">เอเจนท์</SelectItem>
                  <SelectItem value="customer">ลูกค้า</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            รายชื่อผู้ใช้งาน 
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({filteredUsers.length} รายการ)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2">กำลังโหลด...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">ไม่พบข้อมูลผู้ใช้</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>อีเมล</TableHead>
                    <TableHead>ชื่อ-นามสกุล</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>เบอร์โทร</TableHead>
                    <TableHead>วันที่สมัคร</TableHead>
                    <TableHead className="text-center">การจัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">{user.email}</TableCell>
                      <TableCell>
                        {user.first_name || user.last_name 
                          ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                          : '-'
                        }
                      </TableCell>
                      <TableCell>
                        <Badge className={roleLabels[user.role].color}>
                          {roleLabels[user.role].label}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.phone || '-'}</TableCell>
                      <TableCell>
                        {new Date(user.created_at).toLocaleDateString('th-TH')}
                      </TableCell>
                      <TableCell className="text-center">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={user.email === authUser?.email}
                              className="flex items-center gap-1"
                            >
                              <Trash2 className="w-4 h-4" />
                              ลบ
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>ยืนยันการลบผู้ใช้</AlertDialogTitle>
                              <AlertDialogDescription>
                                คุณแน่ใจหรือไม่ที่จะลบผู้ใช้ <strong>{user.email}</strong>?
                                <br /><br />
                                การกระทำนี้จะลบข้อมูลทั้งหมดที่เกี่ยวข้อง รวมถึง:
                                <ul className="list-disc list-inside mt-2 space-y-1">
                                  <li>ข้อมูลผู้ใช้ในระบบ</li>
                                  <li>บัญชี Authentication</li>
                                  <li>ข้อมูลที่เกี่ยวข้องทั้งหมด (properties, profile ฯลฯ)</li>
                                </ul>
                                <br />
                                <strong className="text-red-600">⚠️ การกระทำนี้ไม่สามารถย้อนกลับได้!</strong>
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>ยกเลิก</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteUser(user.email)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                ลบผู้ใช้
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
