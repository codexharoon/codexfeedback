import * as React from "react";

interface EmailTemplateProps {
  username: string;
  otp: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  username,
  otp,
}) => (
  <div>
    <h1>Welcome, {username}!</h1>
    <p>
      We are excited to have you on board. Please use the following OTP to
      complete your registration.
    </p>
    <p>
      Your OTP is: <b>{otp}</b>
    </p>
  </div>
);
