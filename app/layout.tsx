import { Space_Mono } from '@next/font/google';
import { Analytics } from '@vercel/analytics/react';

import './globals.css';

const spaceMono = Space_Mono({
  weight: '400',
  subsets: ['latin'],
});
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/*
        <head /> will contain the components returned by the nearest parent
        head.tsx. Find out more at https://beta.nextjs.org/docs/api-reference/file-conventions/head
      */}
      <head />
      <body className={`min-h-screen bg-white ${spaceMono.className}`}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
