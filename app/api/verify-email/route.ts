import { NextResponse } from "next/server";

import { hashVerificationToken } from "@/lib/email-verification";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/login?verified=invalid", request.url));
  }

  const verification = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashVerificationToken(token) },
    include: { user: true },
  });

  if (!verification || verification.expiresAt <= new Date()) {
    return NextResponse.redirect(new URL("/login?verified=invalid", request.url));
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerifiedAt: new Date() },
    }),
    prisma.emailVerificationToken.delete({ where: { id: verification.id } }),
  ]);

  return NextResponse.redirect(new URL("/login?verified=success", request.url));
}
