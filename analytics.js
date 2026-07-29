import Resend from "@auth/core/providers/resend";
import { Resend as ResendAPI } from "resend";

/* Password-reset emails: an 8-digit code sent via Resend.
   EMAIL_FROM env var controls the sender; until the domain is verified in
   Resend it falls back to their onboarding address (which can only deliver
   to the Resend account owner's email — fine for testing). */
export const ResendOTPPasswordReset = Resend({
  id: "resend-otp",
  apiKey: process.env.AUTH_RESEND_KEY,
  async generateVerificationToken() {
    const digits = crypto.getRandomValues(new Uint8Array(8));
    return Array.from(digits, (n) => String(n % 10)).join("");
  },
  async sendVerificationRequest({ identifier: email, provider, token }) {
    const resend = new ResendAPI(provider.apiKey);
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Grace Spring Water <onboarding@resend.dev>",
      to: [email],
      subject: "Reset your Grace Spring Water password",
      text:
        `Your Grace Spring password reset code is: ${token}\n\n` +
        `Enter this code on the sign-in page to choose a new password. ` +
        `If you didn't request this, you can safely ignore this email.`,
    });
    if (error) {
      console.error("Resend reset email failed:", JSON.stringify(error));
      throw new Error("Could not send the reset email.");
    }
  },
});
