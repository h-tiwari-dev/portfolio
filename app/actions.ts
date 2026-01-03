"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail(formData: { name: string; email: string; message: string }) {
    const { name, email, message } = formData;

    if (!name || !email || !message) {
        return { error: "All fields are required" };
    }

    try {
        const data = await resend.emails.send({
            from: "Contact Form <onboarding@resend.dev>",
            to: "h.tiwari.dev@gmail.com",
            subject: `New Message from ${name} via Portfolio`,
            replyTo: email,
            text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        });

        return { success: true, data };
    } catch (error) {
        console.error("Email dispatch failed:", error);
        return { error: "Failed to dispatch message buffer" };
    }
}
