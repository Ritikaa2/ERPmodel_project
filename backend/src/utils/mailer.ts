import nodemailer from 'nodemailer';
import { ENV } from '../config/env';

export const transporter = nodemailer.createTransport({
  host: ENV.SMTP.HOST,
  port: ENV.SMTP.PORT,
  secure: ENV.SMTP.PORT === 465,
  auth: {
    user: ENV.SMTP.USER,
    pass: ENV.SMTP.PASS,
  },
});

export const sendOTPEmail = async (toEmail: string, otpCode: string, userName: string = 'User') => {
  if (ENV.EMAILJS.SERVICE_ID && ENV.EMAILJS.TEMPLATE_ID && ENV.EMAILJS.PUBLIC_KEY) {
    try {
      const response = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: ENV.EMAILJS.SERVICE_ID,
          template_id: ENV.EMAILJS.TEMPLATE_ID,
          user_id: ENV.EMAILJS.PUBLIC_KEY,
          accessToken: ENV.EMAILJS.PRIVATE_KEY || undefined,
          template_params: {
            to_email: toEmail,
            to_name: userName,
            otp_code: otpCode,
            passcode: otpCode,
            app_name: 'Mini ERP Portal',
            expires_in: '15 minutes',
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`EmailJS responded with ${response.status}`);
      }

      console.log(`EmailJS OTP dispatched to ${toEmail}`);
      return true;
    } catch (err: any) {
      console.warn(`EmailJS OTP notice (${err.message}). Trying SMTP fallback.`);
    }
  }

  const mailOptions = {
    from: ENV.SMTP.FROM,
    to: toEmail,
    subject: `${otpCode} is your Mini ERP Password Reset Code`,
    html: `
      <div font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #4f46e5; margin: 0; font-size: 24px; font-weight: 800;">Mini ERP Portal</h1>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Smart Enterprise Operations</p>
        </div>
        <div style="padding: 20px; background-color: #f8fafc; border-radius: 12px; margin-bottom: 20px;">
          <h2 style="font-size: 16px; color: #1e293b; margin-top: 0;">Password Reset Request</h2>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">Hello ${userName},</p>
          <p style="font-size: 14px; color: #475569; line-height: 1.5;">We received a request to reset your password. Use the following 6-digit OTP code to complete your password reset:</p>
          
          <div style="text-align: center; margin: 25px 0;">
            <span style="font-family: monospace; font-size: 32px; font-weight: 900; letter-spacing: 8px; color: #4f46e5; background-color: #eef2ff; padding: 12px 24px; border-radius: 10px; border: 1px border #c7d2fe; display: inline-block;">
              ${otpCode}
            </span>
          </div>

          <p style="font-size: 12px; color: #94a3b8; text-align: center;">This OTP code is valid for 15 minutes. If you did not request a password reset, please ignore this email.</p>
        </div>
        <div style="text-align: center; font-size: 11px; color: #94a3b8; border-top: 1px solid #f1f5f9; pt: 15px;">
          © 2026 Mini ERP Portal • SSL Encrypted Security
        </div>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️ Nodemailer OTP dispatched to ${toEmail}: ${info.messageId}`);
    return true;
  } catch (err: any) {
    console.warn(`⚠️ Nodemailer SMTP Notice (${err.message}). Local fallback active for testing.`);
    console.log(`📩 [LOCAL DEV OTP DISPATCH] To: ${toEmail} | OTP Code: ${otpCode}`);
    return false;
  }
};
