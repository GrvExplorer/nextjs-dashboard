import '@/app/ui/global.css'
import { inter, lusitana } from './ui/fonts';
import { Metadata } from 'next';

export const metadata: Metadata = {
  
  title: {
    template: '%s | Acme Dashboard',
    default: 'Acme Dashboard'
  },
  description: 'The official Next.js Course Dashboard, built with App Router.',
  metadataBase: new URL('https://next-learn-dashboard.vercel.sh'),
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
