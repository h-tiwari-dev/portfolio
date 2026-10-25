import localFont from 'next/font/local';
import Link from 'next/link';
import { navItems } from '@/constants/navItems';
import { SectionProvider } from '@/contexts/SectionContext';

import './globals.css';

const jetbrainsMono = localFont({
  src: './fonts/jetbrains-mono-normal-100-800.woff2',
  weight: '100 800',
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

const spaceGrotesk = localFont({
  src: './fonts/space-grotesk-normal-300-700.woff2',
  weight: '300 700',
  variable: '--font-space-grotesk',
  display: 'swap',
});

const cormorant = localFont({
  src: [
    { path: './fonts/cormorant-normal-400.woff2', weight: '400', style: 'normal' },
    { path: './fonts/cormorant-normal-400.woff2', weight: '500', style: 'normal' },
    { path: './fonts/cormorant-italic-400.woff2', weight: '400', style: 'italic' },
    { path: './fonts/cormorant-italic-400.woff2', weight: '500', style: 'italic' },
  ],
  variable: '--font-butler',
  display: 'swap',
});

import CustomCursor from '@/components/common/CustomCursor';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head />
      <body
        className={`min-h-screen bg-background overflow-x-hidden font-sans antialiased text-white ${jetbrainsMono.variable} ${spaceGrotesk.variable} ${cormorant.variable}`}
      >
        {Number.parseInt(process.env.LOOKING_FOR_WORK ?? '0') === 1 ? (
          <div className="fixed top-0 left-0 right-0 bg-red-800 text-white font-bold text-center z-50">
            I&apos;m looking for work. Give me money!
          </div>
        ) : (
          <></>
        )}

        <SectionProvider>{children}</SectionProvider>
        <CustomCursor />
      </body>
    </html>
  );
}
