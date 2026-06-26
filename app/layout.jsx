import './globals.css';

export const metadata = {
  title: 'Halwani FS CRM',
  description: 'Halwani Food Service CRM',
  manifest: '/manifest.json',
  themeColor: '#087a35'
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
