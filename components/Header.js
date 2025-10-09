import Link from 'next/link';
export default function Header(){
  return (
    <div className="header">
      <div className="header-inner">
        <div className="logo">
          <img src="/logo.svg" alt="IRS Debt AI logo" width={120} height={40} />
          <span className="brand-tag">Together, we’ve got this</span>
        </div>
        <nav className="nav">
          <Link href="/">Chat</Link>
          <Link href="/assisted-submit">Assisted Submit</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </nav>
      </div>
    </div>
  );
}
