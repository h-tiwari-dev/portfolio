import { Resend } from 'resend';

export async function onRequestPost(context: { request: Request }) {
  const { request } = context;

  try {
    const formData = await request.json();
    const { name, email, message } = formData;

    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'All fields are required' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const data = await resend.emails.send({
      from: 'Contact Form <onboarding@resend.dev>',
      to: 'h.tiwari.dev@gmail.com',
      subject: `New Message from ${name} via Portfolio`,
      replyTo: email,
      text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
    });

    return new Response(JSON.stringify({ success: true, data }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Email dispatch failed:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to dispatch message' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
