import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
export async function sendEmail({ to, subject, code }) {
  if (!to) throw new Error("Recipient email is required");

  const htmlTemplate = `
    <div style="font-family: Arial, sans-serif; text-align: center; padding: 30px; background: #f7f7f7;">
      <img src="https://example.com/logo.png" alt="Logo" width="100" style="margin-bottom: 20px;" />
      <h2 style="color: #4CAF50;">Your OTP Code</h2>
      <p>Use the following One-Time Password (OTP) to complete your action:</p>
      <div style="font-size: 28px; font-weight: bold; margin: 20px 0; background: #e0f7fa; padding: 15px; border-radius: 8px;">
        ${code}
      </div>
      <p style="color: #888;">This code is valid for 10 minutes.</p>
      <a href="https://yourwebsite.com" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4CAF50; color: #fff; text-decoration: none; border-radius: 5px;">
        Go to App
      </a>
    </div>
  `;

  const { error } = await resend.emails.send({
    from: "Your App <onboarding@resend.dev>",
    to,
    subject,
    html: htmlTemplate,
  });

  if (error) {
    console.error("Resend Error Details:", error);
    throw new Error(error.message);
  }

  return true;
}