export default function UnsubscribeSuccess() {
  return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"#f9fafb",fontFamily:"Arial,sans-serif"}}>
      <div style={{background:"#fff",borderRadius:"16px",padding:"48px",maxWidth:"480px",width:"100%",textAlign:"center",boxShadow:"0 4px 24px rgba(0,0,0,0.08)"}}>
        <div style={{fontSize:"56px",marginBottom:"16px"}}>✅</div>
        <h1 style={{color:"#111827",fontSize:"24px",fontWeight:"800",margin:"0 0 12px"}}>Unsubscribed Successfully</h1>
        <p style={{color:"#6B7280",fontSize:"15px",lineHeight:"1.6",margin:"0 0 24px"}}>You have been removed from our mailing list. You will no longer receive marketing emails.</p>
        <p style={{color:"#9CA3AF",fontSize:"13px",margin:"0"}}>Changed your mind? Contact us to resubscribe.</p>
      </div>
    </div>
  )
}