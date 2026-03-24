'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/api')) {
      setTimeout(() => router.push('/app/dashboard'), 2000)
    }
  }, [])

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Arial',background:'#f9fafb'}}>
      <div style={{fontSize:'64px',marginBottom:'16px'}}>&#128237;</div>
      <h1 style={{color:'#111827',margin:'0 0 8px'}}>Page not found</h1>
      <p style={{color:'#6B7280',margin:'0 0 24px'}}>Redirecting to dashboard...</p>
      <a href="/app/dashboard" style={{background:'#1E40AF',color:'#fff',padding:'12px 24px',borderRadius:'8px',textDecoration:'none',fontWeight:'700'}}>Go to Dashboard</a>
    </div>
  )
}
