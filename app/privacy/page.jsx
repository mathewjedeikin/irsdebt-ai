export const metadata = { title: "Privacy • IRS Debt AI" };

export default function Privacy() {
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>IRSdebtAI Privacy Policy</h2>
      <p><strong>Effective Date:</strong> October 14, 2025</p>

      <h3>Overview</h3>
      <p>
        IRSdebtAI (“we,” “our,” “us”) provides educational tools that help users better understand IRS notices
        and options for resolving tax debt. IRSdebtAI is not legal or tax advice. This Policy explains how the
        <em> iOS app </em> and the <em> irsdebt.ai </em> website handle information.
      </p>

      <h3>Scope</h3>
      <ul>
        <li><strong>IRSdebtAI iOS app (TestFlight / App Store):</strong> Designed to run without account creation and without server-side storage of personal data by us.</li>
        <li><strong>irsdebt.ai website:</strong> A marketing and informational site that may use basic analytics and a chat interface.</li>
      </ul>

      <h3>Information We Do Not Intend to Collect</h3>
      <ul>
        <li>No account creation is required.</li>
        <li>We do not request Social Security numbers or IRS / Login.gov credentials. <strong>Please do not enter them.</strong></li>
        <li>We do not sell personal data.</li>
      </ul>

      <h3>App (iOS) Data Handling</h3>
      <ul>
        <li><strong>Local use:</strong> App features (including viewing guidance and generating PDFs) are designed to operate without sending your content to our servers.</li>
        <li><strong>Documents:</strong> Any PDF you generate is created on-device; saving or sharing is your choice.</li>
        <li><strong>System services:</strong> The app may rely on Apple frameworks (e.g., WebKit, PDFKit, secure networking for HTTPS). These frameworks follow Apple’s platform policies.</li>
      </ul>

      <h3>Website Data Handling</h3>
      <ul>
        <li><strong>Chat content:</strong> If you use the website chat, your prompts may be sent to our model provider (e.g., OpenAI) solely to generate responses. Avoid sharing highly sensitive information.</li>
        <li><strong>Analytics:</strong> We may use basic, privacy-respecting analytics to understand site performance and improve content. We do not create user profiles for advertising.</li>
        <li><strong>Cookies:</strong> The site may use minimal cookies necessary for functionality or analytics.</li>
      </ul>

      <h3>Your Choices</h3>
      <ul>
        <li><strong>Do not enter sensitive data:</strong> Please refrain from providing SSNs, full tax returns, or account credentials.</li>
        <li><strong>Data deletion:</strong> If you contact us, we will assist with reasonable deletion requests for information you directly provided to us.</li>
      </ul>

      <h3>Children’s Privacy</h3>
      <p>
        IRSdebtAI is not directed to children under 13, and we do not knowingly collect personal information from children.
      </p>

      <h3>Third-Party Services</h3>
      <ul>
        <li>Apple frameworks (e.g., WebKit, PDFKit, networking for HTTPS).</li>
        <li>Model/AI provider for website chat (e.g., OpenAI) used to process prompts and return responses.</li>
      </ul>

      <h3>Security</h3>
      <p>
        We use reasonable safeguards appropriate to our products and the limited data we process. No method of transmission
        or storage is completely secure.
      </p>

      <h3>Changes to This Policy</h3>
      <p>
        We may update this Policy from time to time. The “Effective Date” above indicates the most recent version.
      </p>

      <h3>Contact Us</h3>
      <p>
        Questions or requests? Email us at <a href="mailto:hello@irsdebt.ai">hello@irsdebt.ai</a>.
      </p>
    </div>
  );
}
