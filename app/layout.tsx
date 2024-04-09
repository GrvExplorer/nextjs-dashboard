import '@/app/ui/global.css'
import { inter, lusitana } from './ui/fonts';

export const metadata = {
  title: 'Acme',
  description: 'Acme landing page'
} 


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${lusitana.variable}`}>
      <head>
        <link rel='icon' href='/speedometer.png'></link>
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
