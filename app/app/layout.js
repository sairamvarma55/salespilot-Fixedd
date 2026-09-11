import './globals.css';

export const metadata = {
  title: 'SalesPilot AI',
  description: 'AI sales follow-up assistant',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
