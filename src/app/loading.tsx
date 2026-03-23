export default function Loading() {
  return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',background:'#f9fafb'}}>
      <div style={{textAlign:'center'}}>
        <svg style={{width:'40px',height:'40px',color:'#1E40AF',animation:'spin 1s linear infinite'}} fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle style={{opacity:0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path style={{opacity:0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <style>{`@keyframes spin { from { transform: rotate(0deg) } to { transform: rotate(360deg) } }`}</style>
        <p style={{color:'#6B7280',marginTop:'16px',fontFamily:'Arial'}}>Loading Fluxmail...</p>
      </div>
    </div>
  )
}
