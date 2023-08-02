import { navItems } from '@/constants/navItems';
import { Space_Mono } from '@next/font/google';
import Link from 'next/link';
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
        <div
          className={`
          w-screen flex-grow font-bold 
            flex justify-center pt-10 
              scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-black overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full
              `}
        >
          {children}
        </div>
        {/* <Footer/> */}
        <div className="fixed bottom-0 left-0 right-0 p-4 text-center">
          <div className="flex sm:space-x-2 xl:space-x-10 justify-center">
            {navItems.map((navItem) => (
              <Link
                href={navItem.url}
                key={navItem.url}
                className="text-blue-500 font-bold underline"
              >
                {navItem.name}
              </Link>
            ))}
          </div>
        </div>
      </body>
    </html>
  );
}
