export const metadata = { title: "Privacy • IRS Debt AI" };

export default function Privacy(){
  return (
    <div className="card">
      <h2 style={{marginTop:0}}>Privacy Policy</h2>
      <p>We care about your privacy. This website provides general information and a chat assistant to help you understand IRS notices and options. It is not legal or tax advice.</p>
      <ul>
        <li><b>No SSNs or IRS/Login.gov credentials:</b> Please don’t share them here.</li>
        <li><b>Chat content:</b> We may process chat messages to generate helpful responses. Avoid sharing highly sensitive information.</li>
        <li><b>Third‑party services:</b> Our AI responses are provided by OpenAI. Do not enter classified or regulated data.</li>
        <li><b>Cookies/analytics:</b> We may use basic analytics to improve the site experience.</li>
        <li><b>Data deletion:</b> If you contact us, we’ll assist with reasonable deletion requests.</li>
      </ul>
      <p>If you have questions about privacy, contact us at: <a href="mailto:hello@irsdebt.ai">hello@irsdebt.ai</a>.</p>
    </div>
  );
}
