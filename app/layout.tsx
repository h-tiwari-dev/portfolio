import { Space_Mono, Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from "@vercel/speed-insights/next"
import Link from 'next/link';
import { navItems } from '@/constants/navItems';
import GameOfLife from '@/components/common/gameOfLife';

import './globals.css';

const spaceMono = Space_Mono({
    weight: ['400', '700'],
    subsets: ['latin'],
    variable: '--font-space-mono',
});

const inter = Inter({
    subsets: ['latin'],
    variable: '--font-inter',
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
            <body className={`min-h-screen bg-background overflow-x-hidden font-sans antialiased text-white ${spaceMono.variable} ${inter.variable}`}>
                {
                    Number.parseInt(process.env.LOOKING_FOR_WORK ?? "0") === 1 ?
                        <div className="fixed top-0 left-0 right-0 bg-red-800 text-white font-bold text-center z-50">
                            I&apos;m looking for work. Give me money!
                        </div> : <></>
                }

                {children}
                <CustomCursor />
                <Analytics />
                <SpeedInsights />
            </body>
        </html>
    );
}
