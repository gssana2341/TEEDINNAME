import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const { propertyId } = await request.json()
    
    if (!propertyId) {
      return NextResponse.json(
        { error: 'Property ID is required' },
        { status: 400 }
      )
    }

    const supabase = createClient()
      // เรียกใช้ function เพื่ออัปเดต view count
    const { data, error } = await supabase.rpc('increment_view_count', {
      input_property_id: propertyId
    })

    if (error) {
      console.error('Error incrementing view count:', error)
      return NextResponse.json(
        { error: 'Failed to increment view count' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      newViewCount: data
    })

  } catch (error) {
    console.error('Error in track-view API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
