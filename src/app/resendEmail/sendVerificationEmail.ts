import { EmailTemplate } from "./verificationEmailTemplate";
import { resend } from "./resend";
import { ApiResponse } from "../types/ApiResponse";

export const sendVerificationEmail = async (
  username: string,
  email: string,
  otp: string
): Promise<ApiResponse> => {
  try {
    const textContent = `Hi ${username},\n\nYour verification code is: ${otp}\n\nBest regards,\nCodexFeedback Team`;

    const { data, error } = await resend.emails.send({
      from: "no-reply@codexharoon.com",
      to: email,
      subject: "Verification Code -  CodexFeedback",
      text: textContent,
      react: EmailTemplate({ username, otp }),
    });

    if (error) {
      console.error("error sending email", error);
      return {
        success: false,
        message: "Error sending email",
      };
    }

    return {
      success: true,
      message: "Email sent successfully",
    };
  } catch (error) {
    console.error("error sending email", error);
    return {
      success: false,
      message: "Error sending email",
    };
  }
};
