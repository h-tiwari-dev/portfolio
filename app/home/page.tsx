import DownloadFile from '@/components/common/downloadFile';
import handleDownload from '@/components/common/downloadFile';
import { PrismaClient } from '@prisma/client';
import { log } from 'console';
import Image from 'next/image';

export async function getResume() {
    const prisma = new PrismaClient()
    const resume = await prisma.file.findFirst({
        where: {
            fileType: 'RESUME'
        }
    })
    return {
        resume,
    }
}

async function getCourseWork() {
    const prisma = new PrismaClient()
    const courseWork = await prisma.file.findMany({
        where: {
            fileType: 'COURSE_WORK'
        }
    })

    return {
        courseWork
    }
}
export default async function Home() {
    const resume = await getResume();
    const courseWork = await getCourseWork();

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
                    Hi, I'm A Full Stack Software Engineer Working At A Fintech Startup
                    Castler. I Primarily Work With Technologies Like Mongo DB, Node JS,
                    Typescript, React Js, Angular Js, Nest Js, Java. I've Experience In
                    Creating Fintech Products That Can Scale To Thousands Of Requests Per
                    Seconds.
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
                        {
                            resume.resume?.file ? <div className='flex flex-row justify-between'>
                                <p className='text-md'>Resume:</p>
                                <DownloadFile file={resume.resume?.file as Buffer} fileName={resume.resume?.name as string} />
                            </div> : <></>
                        }
                        {
                            courseWork.courseWork ? <div className='flex flex-col w-full'>
                                <p className='text-md'>Course Work:-</p>
                                <ul className='mx-10 justify-end w-full'>
                                    {
                                        courseWork.courseWork.map(course => {
                                            return (
                                                <li key={course.id} >
                                                    <DownloadFile file={course.file as Buffer} fileName={course.name as string} />
                                                </li>
                                            );
                                        })
                                    }
                                </ul>
                            </div> : <></>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
}
