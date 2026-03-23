'use client'
export default function Error({ reset }: { reset: () => void }) {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100vh',fontFamily:'Arial',background:'#f9fafb'}}>
      <div style={{fontSize:'64px',marginBottom:'16px'}}>&#9888;&#65039;</div>
      <h1 style={{color:'#111827',margin:'0 0 8px'}}>Something went wrong</h1>
      <p style={{color:'#6B7280',margin:'0 0 24px'}}>An error occurred. Please try again.</p>
      <button onClick={reset} style={{background:'#1E40AF',color:'#fff',padding:'12px 24px',borderRadius:'8px',border:'none',fontWeight:'700',cursor:'pointer'}}>Try Again</button>
    </div>
  )
}
