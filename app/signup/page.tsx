"use client";

import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data?.error ?? "Unable to create account.");
        return;
      }

      setVerificationSent(true);
    } catch {
      setError("Unable to create account right now. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function updateField(field: keyof typeof formData, value: string) {
    setFormData((current) => ({
      ...current,
      [field]: value,
    }));
  }

  return (
    <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-border/80 bg-card/90 shadow-lg">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">{verificationSent ? "Check your email" : "Create account"}</CardTitle>
          <CardDescription>
            {verificationSent
              ? `We sent a verification link to ${formData.email}. Confirm your address before signing in.`
              : "Set up your workspace and start managing interviews and question kits."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {verificationSent ? (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">The link is valid for 24 hours. Check your spam folder if it doesn’t arrive.</p>
              <Link
                href="/login"
                className="inline-flex h-8 w-full items-center justify-center rounded-[1rem] bg-[linear-gradient(135deg,#0ea5e9,#22d3ee)] px-2.5 text-sm font-medium text-primary-foreground shadow-[0_12px_22px_rgba(14,165,233,0.22)] transition-all hover:bg-[linear-gradient(135deg,#0ea5e9,#38bdf8)] focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                Go to sign in
              </Link>
              <Button type="button" variant="outline" className="w-full" onClick={() => setVerificationSent(false)}>Use a different email</Button>
            </div>
          ) : <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full name</Label>
              <Input
                id="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={(event) => updateField("name", event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-email">Email</Label>
              <Input
                id="signup-email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={(event) => updateField("email", event.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="signup-password">Password</Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={(event) => updateField("password", event.target.value)}
                  minLength={8}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-3 flex items-center text-muted-foreground transition-colors hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error ? (
              <p className="text-sm font-medium text-destructive">{error}</p>
            ) : null}

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Creating account..." : "Sign up"}
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              Continue with Google
            </Button>
          </form>}

          {!verificationSent ? <p className="mt-4 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
              Sign in
            </Link>
          </p> : null}
        </CardContent>
      </Card>
    </main>
  );
}
