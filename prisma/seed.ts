import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcrypt";
import * as fs from "fs";

const prisma = new PrismaClient();

const seed = async () => {
    try {
        const newUser = await prisma.user.create({
            data: {
                email: process.env.ADMIN_EMAIL as string,
                password: bcrypt.hashSync(process.env.ADMIN_PASSWORD as string, 10),
                username: process.env.ADMIN_USERNAME as string,
                type: 'ADMIN'
            }
        })
        console.log(`Created new User ${JSON.stringify(newUser)}`)

        // TODO: Add all certifications
        // TODO: Add your resume
        const filesUploaded = await prisma.file.createMany({
            data: [
                {
                    name: 'Resume.pdf',
                    fileType: 'RESUME',
                    file: fs.readFileSync("/Users/harshtiwari/Downloads/Resume.pdf")
                },
                {
                    name: 'Data Structure And Algorithms specialization Certificate.pdf',
                    fileType: 'COURSE_WORK',
                    file: fs.readFileSync("/Users/harshtiwari/Downloads/Data Structure And Algorithms specialization Certificate.pdf")
                },
                {
                    name: 'Deep Learning specialization Certificate.pdf',
                    fileType: 'COURSE_WORK',
                    file: fs.readFileSync("/Users/harshtiwari/Downloads/Deep Learning specialization Certificate.pdf")
                },
            ]
        });

        console.log(`Files Uploaded successfully. ${filesUploaded.count}`)
    } catch (e) {
        console.log("Error: ", e)
    }
}

seed();