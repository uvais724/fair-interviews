import bcrypt from "bcryptjs";
import { createVerificationToken, sendVerificationEmail, VERIFICATION_TOKEN_TTL_MS } from "@/lib/email-verification";
import { NextResponse } from "next/server";

import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const name = String(payload?.name ?? "").trim();
    const email = String(payload?.email ?? "").trim().toLowerCase();
    const password = String(payload?.password ?? "");

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser?.emailVerifiedAt) {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = existingUser
      ? await prisma.user.update({
          where: { id: existingUser.id },
          data: { name, password: passwordHash },
        })
      : await prisma.user.create({
          data: { name, email, password: passwordHash },
        });
    const { token, tokenHash } = createVerificationToken();
    await prisma.emailVerificationToken.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        tokenHash,
        expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
      },
      update: {
        tokenHash,
        expiresAt: new Date(Date.now() + VERIFICATION_TOKEN_TTL_MS),
      },
    });

    try {
      await sendVerificationEmail({
        email,
        name,
        token,
        origin: new URL(request.url).origin,
      });
    } catch (error) {
      console.error("Verification email error:", error);
      return NextResponse.json(
        { error: "Unable to send a verification email right now. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { message: "Check your inbox for a verification link." },
      { status: existingUser ? 200 : 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Unable to create your account right now." },
      { status: 500 }
    );
  }
}
