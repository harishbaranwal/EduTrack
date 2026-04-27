import { verficationOtpEmail } from "./emailTemplates.js";
import { sendEmail } from "./sendEmail.js";

export async function sendVerificationCode(verificationCode, email) {
  try {
    const message = verficationOtpEmail(verificationCode);

    const result = await sendEmail({
      email: email,
      subject: "Verification Code for Smart System",
      message,
    });

    return {
      success: true,
      message: "Verification code sent successfully to email.",
    };
  } catch (error) {throw new Error("Failed to send verification code. Please try again.");
  }
}