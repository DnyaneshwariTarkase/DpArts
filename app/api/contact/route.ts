import nodemailer from "nodemailer";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();

    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // 
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,    // ✅ Gmail-safe
      replyTo: email,                  // 🟢 User 
      to: process.env.EMAIL_USER,
      subject: `Contact Form Message from ${name}`,
      text: message,
    });

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email sending error:", error);
    return NextResponse.json({ error: "Email not sent" }, { status: 500 });
  }
}
