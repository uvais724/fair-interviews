import { createHash, randomBytes } from "node:crypto";
import { Resend } from "resend";

export const VERIFICATION_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;

export function createVerificationToken() {
  const token = randomBytes(32).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");

  return { token, tokenHash };
}

export function hashVerificationToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function sendVerificationEmail({
  email,
  name,
  token,
  origin,
}: {
  email: string;
  name: string;
  token: string;
  origin: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured.");

  const resend = new Resend(apiKey);
  const verificationUrl = new URL("/api/verify-email", origin);
  verificationUrl.searchParams.set("token", token);
  const from = process.env.RESEND_FROM_EMAIL ?? "Fair Interviews <onboarding@resend.dev>";

  const { error } = await resend.emails.send({
    from,
    to: email,
    subject: "Verify your Fair Interviews email",
    text: `Hi ${name},\n\nConfirm your email address by opening this link:\n${verificationUrl}\n\nThis link expires in 24 hours.`,
    html: `<p>Hi ${escapeHtml(name)},</p><p>Confirm your email address to finish creating your Fair Interviews account.</p><p><a href="${verificationUrl.toString()}">Verify email address</a></p><p>This link expires in 24 hours.</p>`,
  });

  if (error) throw new Error(`Resend error: ${error.message}`);
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[character]!);
}
