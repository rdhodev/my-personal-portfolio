import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const authSecret = process.env.AUTH_SECRET;
  const adminEmailTo = process.env.ADMIN_EMAIL_TO;

  if (!adminEmail || !adminPassword || !authSecret || !adminEmailTo) {
    return NextResponse.json(
      { message: "Server misconfiguration. Contact administrator." },
      { status: 500 }
    );
  }

  if (email !== adminEmail || password !== adminPassword) {
    return NextResponse.json(
      { message: "Email atau password salah." },
      { status: 401 }
    );
  }

  // Generate 6-digit OTP
  const otp = generateOTP();
  const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

  // Sign the OTP payload
  const otpPayload = Buffer.from(
    JSON.stringify({ otp, expiresAt, secret: authSecret })
  ).toString("base64");

  // Send OTP email via Resend
  const { error } = await resend.emails.send({
    from: "Portfolio Admin <onboarding@resend.dev>",
    to: [adminEmailTo],
    subject: `Kode OTP Login Admin — ${otp}`,
    html: `
      <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f0f; border-radius: 16px; color: #e8e8e8;">
        <div style="text-align: center; margin-bottom: 24px;">
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; background: #3d6b4f; border-radius: 12px; margin-bottom: 12px;">
            <span style="font-size: 24px;">🔐</span>
          </div>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">Portfolio Admin</h1>
        </div>

        <p style="margin: 0 0 8px; color: #a0a0a0; font-size: 14px;">Kode verifikasi login kamu:</p>

        <div style="background: #1a1a1a; border: 1px solid #2a2a2a; border-radius: 12px; padding: 24px; text-align: center; margin: 16px 0;">
          <span style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #6abf7b; font-family: monospace;">${otp}</span>
        </div>

        <p style="margin: 0; color: #6b6b6b; font-size: 12px; text-align: center;">
          Kode ini berlaku selama <strong style="color: #a0a0a0;">5 menit</strong>.<br/>
          Jangan bagikan kode ini ke siapapun.
        </p>
      </div>
    `,
  });

  if (error) {
    console.error("Resend error:", error);
    return NextResponse.json(
      { message: "Gagal mengirim email OTP. Coba lagi." },
      { status: 500 }
    );
  }

  const response = NextResponse.json({ requireOtp: true }, { status: 200 });

  // Store OTP in a short-lived HTTP-only cookie
  response.cookies.set("admin_otp", otpPayload, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 5, // 5 minutes
    path: "/",
  });

  return response;
}
