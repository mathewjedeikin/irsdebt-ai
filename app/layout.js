import './globals.css';
import Header from '../components/Header';
import Footer from '../components/Footer';

export const metadata = {
  title: 'IRS Debt AI',
  description: 'Friendly, uplifting guidance for IRS notices, payment plans, levies, liens, OIC, and more.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main className="container">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
