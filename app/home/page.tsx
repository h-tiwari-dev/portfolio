import DownloadFile from '@/components/common/downloadFile';
import GameOfLife from '@/components/common/gameOfLife';
import { fileNames } from '@/constants/files';
import Image from 'next/image';

export default async function Home() {
    return (
        <div>
            <div className="flex justify-center w-full">
                <div className="flex items-center">
                    <Image
                        className="w-24 h-24 rounded-full mr-4"
                        src={'/profile.jpeg'}
                        alt={'Profile Picture'}
                        width={'100'}
                        height={'100'}
                    />
                    <div className="flex flex-col">
                        <p className="text-3xl font-bold">Harsh Tiwari</p>
                        <p className="font-thin">Software Engineer</p>
                        <div className="flex flex-row space-x-2 mt-1">
                            <a href="mailto:h.tiwari.dev@gmail" target="_blank">
                                <Image
                                    src={'/gmail-icon.svg'}
                                    alt={'Github Icon'}
                                    width={'20'}
                                    height={'20'}
                                />
                            </a>
                            <a href="https://github.com/h-tiwari-dev" target="_blank">
                                <Image
                                    src={'/github-icon.svg'}
                                    alt={'Github Icon'}
                                    width={'20'}
                                    height={'20'}
                                />
                            </a>
                            <a
                                href="https://www.linkedin.com/in/tiwari-ai-harsh/"
                                target="_blank"
                            >
                                <Image
                                    src={'/linkedin-icon.svg'}
                                    alt={'Github Icon'}
                                    width={'20'}
                                    height={'20'}
                                />
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-lg mx-auto mt-10">
                <div className="w-full">
                    Hi, I am a Full Stack Software Engineer with over 2 years of professional experience. I primarily work with technologies such as MongoDB, Node.js, TypeScript, React.js, Angular.js, Nest.js, and PostgreSQL. I have experience in creating fintech products capable of scaling to thousands of requests per second.
                </div>
                <div className="mt-10">
                    <p className="text-xl">Technologies:-</p>
                    <div className="grid grid-cols-2 gap-4 mx-10">
                        <ul className="list-disc">
                            <li>Rust</li>
                            <li>Postgres</li>
                            <li>Next Js</li>
                        </ul>
                        <ul className="list-disc">
                            <li>Nest Js</li>
                            <li>Tailwind</li>
                            <li>Node Js</li>
                        </ul>
                    </div>
                    <p className="text-xl mt-5">Files:-</p>
                    <div className="flex flex-col mx-10">
                        <div className='flex flex-row justify-between'>
                            <p className='text-md'>Resume:</p>
                            <DownloadFile fileName={fileNames.resume} />
                        </div>
                        <div className='flex flex-col w-full'>
                            <p className='text-md'>Course Work:-</p>
                            <ul className='mx-10 justify-end w-full'>
                                <li key={fileNames.courseWork_DSA} >
                                    <DownloadFile fileName={fileNames.courseWork_DSA} />
                                </li>
                                <li key={fileNames.courseWork_DLS} >
                                    <DownloadFile fileName={fileNames.courseWork_DLS} />
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div className='mt-5'>
                    <GameOfLife height={90} width={32} />
                </div>
            </div>
        </div>
    );
}
