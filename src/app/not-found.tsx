export default function NotFound() {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Arial',background:'#f9fafb'}}>
      <div style={{fontSize:'64px',marginBottom:'16px'}}>&#128237;</div>
      <h1 style={{color:'#111827',margin:'0 0 8px'}}>Page not found</h1>
      <p style={{color:'#6B7280',margin:'0 0 24px'}}>The page you are looking for does not exist.</p>
      <a href="/app/dashboard" style={{background:'#1E40AF',color:'#fff',padding:'12px 24px',borderRadius:'8px',textDecoration:'none',fontWeight:'700'}}>Go to Dashboard</a>
    </div>
  )
}
