import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const skillName = searchParams.get('skill')
    if (!skillName) return NextResponse.json({ error: 'Skill required' }, { status: 400 })

    const { data: session } = await supabase
      .from('war_room_sessions')
      .select('*')
      .eq('user_id', user.id)
      .eq('skill_name', skillName)
      .single()

    return NextResponse.json({ success: true, session })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { skillName, updates } = body
    if (!skillName) return NextResponse.json({ error: 'Skill required' }, { status: 400 })

    const { data: existing } = await supabase
      .from('war_room_sessions')
      .select('id')
      .eq('user_id', user.id)
      .eq('skill_name', skillName)
      .single()

    let result
    if (existing?.id) {
      result = await supabase
        .from('war_room_sessions')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select()
        .single()
    } else {
      result = await supabase
        .from('war_room_sessions')
        .insert({ user_id: user.id, skill_name: skillName, ...updates })
        .select()
        .single()
    }

    return NextResponse.json({ success: true, session: result.data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}