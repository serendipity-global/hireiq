import Sidebar from '@/components/layout/sidebar'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f8f8f9',
    }}>
      <Sidebar />
      <div style={{
        marginLeft: '260px',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        background: '#f8f8f9',
      }}>
        {children}
      </div>
    </div>
  )
}