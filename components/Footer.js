export default function Footer(){
  return (
    <footer className="footer">
      <div className="container" style={{padding:0}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <div className="muted">© {new Date().getFullYear()} IRS Debt AI. Informational only — not legal or tax advice.</div>
          <div className="muted">Brand color: light green (emerald).</div>
        </div>
      </div>
    </footer>
  );
}
