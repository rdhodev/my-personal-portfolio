import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { otp } = await req.json();
  const authSecret = process.env.AUTH_SECRET;

  if (!authSecret) {
    return NextResponse.json(
      { message: "Server misconfiguration." },
      { status: 500 }
    );
  }

  const otpCookie = req.cookies.get("admin_otp");

  if (!otpCookie?.value) {
    return NextResponse.json(
      { message: "Sesi OTP tidak ditemukan. Silakan login ulang." },
      { status: 401 }
    );
  }

  let payload: { otp: string; expiresAt: number; secret: string };

  try {
    payload = JSON.parse(Buffer.from(otpCookie.value, "base64").toString("utf-8"));
  } catch {
    return NextResponse.json(
      { message: "OTP tidak valid. Silakan login ulang." },
      { status: 401 }
    );
  }

  // Check secret integrity
  if (payload.secret !== authSecret) {
    return NextResponse.json(
      { message: "OTP tidak valid." },
      { status: 401 }
    );
  }

  // Check expiry
  if (Date.now() > payload.expiresAt) {
    return NextResponse.json(
      { message: "Kode OTP sudah kedaluwarsa. Silakan login ulang." },
      { status: 401 }
    );
  }

  // Check OTP match
  if (otp !== payload.otp) {
    return NextResponse.json(
      { message: "Kode OTP salah. Periksa email kamu." },
      { status: 401 }
    );
  }

  // OTP valid — create full session
  const sessionValue = Buffer.from(
    JSON.stringify({ secret: authSecret, ts: Date.now() })
  ).toString("base64");

  const response = NextResponse.json({ success: true }, { status: 200 });

  // Set long-lived session cookie
  response.cookies.set("admin_session", sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  // Clear OTP cookie
  response.cookies.set("admin_otp", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
