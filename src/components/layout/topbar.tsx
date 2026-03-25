import { createClient } from '@/lib/supabase/server'

export default async function Topbar({ title }: { title: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() ?? 'HQ'

  const fullName = user?.user_metadata?.full_name ?? user?.email ?? ''
  const avatarUrl = user?.user_metadata?.avatar_url ?? null

  return (
    <header style={{
      height: '60px',
      background: '#ffffff',
      borderBottom: '1px solid #e4e4e7',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <h1 style={{
        fontSize: '15px',
        fontWeight: 500,
        color: '#09090b',
      }}>{title}</h1>

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        background: '#f4f4f5',
        border: '1px solid #e4e4e7',
        borderRadius: '40px',
        padding: '4px 14px 4px 4px',
      }}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={fullName}
            width={30}
            height={30}
            style={{
              borderRadius: '50%',
              flexShrink: 0,
              objectFit: 'cover',
            }}
          />
        ) : (
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '11px',
            fontWeight: 600,
            color: 'white',
            flexShrink: 0,
          }}>{initials}</div>
        )}
        <span style={{
          fontSize: '13px',
          color: '#52525b',
        }}>{fullName}</span>
      </div>
    </header>
  )
}