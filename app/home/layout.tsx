import { navItems } from '@/constants/navItems';
import Link from 'next/link';

export default async function HomeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div>
            <div
                className={`
          w-screen flex-grow font-bold 
            flex justify-center pt-10 
              scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-black overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full
              `}
            >
                {
                    Number.parseInt(process.env.LOOKING_FOR_WORK ?? "0") === 1 ?
                        <div className="fixed top-0 left-0 right-0 bg-red-800 text-white font-bold text-center">
                            I'm looking for work. Give me money!
                        </div> : <></>
                }
                {children}
            </div>
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
        </div>
    );
}