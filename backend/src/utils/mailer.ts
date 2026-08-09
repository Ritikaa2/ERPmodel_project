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

export const sendOTPEmail = async (
  toEmail: string,
  otpCode: string,
  userName: string = 'User'
) => {
  // ==============================
  // EmailJS OTP Email
  // ==============================
  if (
    ENV.EMAILJS.SERVICE_ID &&
    ENV.EMAILJS.TEMPLATE_ID &&
    ENV.EMAILJS.PUBLIC_KEY
  ) {
    try {
      const response = await fetch(
        'https://api.emailjs.com/api/v1.0/email/send',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            service_id: ENV.EMAILJS.SERVICE_ID,
            template_id: ENV.EMAILJS.TEMPLATE_ID,
            user_id: ENV.EMAILJS.PUBLIC_KEY,
            accessToken: ENV.EMAILJS.PRIVATE_KEY || undefined,

            template_params: {
              // EmailJS template variables
              to_email: toEmail,
              to_name: userName,

              // IMPORTANT:
              // EmailJS template uses {{otp}}
              otp: otpCode,

              // EmailJS template uses {{expiry}}
              expiry: '15',

              app_name: 'Mini ERP Portal',
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          `EmailJS responded with ${response.status}: ${errorText}`
        );
      }

      console.log(`EmailJS OTP dispatched to ${toEmail}`);

      return true;
    } catch (err: any) {
      console.warn(
        `EmailJS OTP notice (${err.message}). Trying SMTP fallback.`
      );
    }
  }

  // ==============================
  // SMTP / Nodemailer Fallback
  // ==============================

  const mailOptions = {
    from: ENV.SMTP.FROM,
    to: toEmail,
    subject: `${otpCode} is your Mini ERP Password Reset Code`,

    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Mini ERP Portal - Password Reset</title>
        </head>

        <body
          style="
            margin: 0;
            padding: 20px;
            background-color: #f8fafc;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          "
        >

          <div
            style="
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border: 1px solid #e2e8f0;
              border-radius: 16px;
              overflow: hidden;
            "
          >

            <!-- Header -->
            <div
              style="
                padding: 25px;
                background-color: #4f46e5;
                color: #ffffff;
              "
            >
              <div
                style="
                  font-size: 22px;
                  font-weight: 700;
                "
              >
                Mini ERP Portal
              </div>

              <div
                style="
                  margin-top: 5px;
                  font-size: 12px;
                  opacity: 0.9;
                "
              >
                Smart Enterprise Operations
              </div>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">

              <div
                style="
                  text-align: center;
                  font-size: 40px;
                  margin-bottom: 10px;
                "
              >
                🔐
              </div>

              <h2
                style="
                  margin: 0 0 15px;
                  text-align: center;
                  color: #0f172a;
                "
              >
                Password Reset Request
              </h2>

              <p
                style="
                  font-size: 14px;
                  line-height: 1.6;
                  color: #475569;
                "
              >
                Hello ${userName},
              </p>

              <p
                style="
                  font-size: 14px;
                  line-height: 1.6;
                  color: #475569;
                "
              >
                We received a request to reset your password for your
                <strong style="color: #4f46e5;">
                  Mini ERP Portal
                </strong>
                account.
              </p>

              <p
                style="
                  font-size: 14px;
                  line-height: 1.6;
                  color: #475569;
                "
              >
                Use the following 6-digit verification code to continue:
              </p>

              <!-- OTP -->
              <div
                style="
                  text-align: center;
                  margin: 30px 0;
                  padding: 25px;
                  background-color: #eef2ff;
                  border: 1px solid #c7d2fe;
                  border-radius: 12px;
                "
              >

                <div
                  style="
                    font-size: 11px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                    color: #64748b;
                    margin-bottom: 12px;
                  "
                >
                  Your Verification Code
                </div>

                <div
                  style="
                    font-family: monospace;
                    font-size: 32px;
                    font-weight: 900;
                    letter-spacing: 8px;
                    color: #4f46e5;
                  "
                >
                  ${otpCode}
                </div>

                <div
                  style="
                    margin-top: 12px;
                    font-size: 12px;
                    color: #64748b;
                  "
                >
                  This OTP is valid for 15 minutes.
                </div>

              </div>

              <!-- Security Notice -->
              <div
                style="
                  padding: 16px;
                  background-color: #f8fafc;
                  border: 1px solid #e2e8f0;
                  border-radius: 10px;
                "
              >

                <div
                  style="
                    font-size: 13px;
                    font-weight: 700;
                    color: #334155;
                    margin-bottom: 8px;
                  "
                >
                  🔒 Security Notice
                </div>

                <div
                  style="
                    font-size: 12px;
                    line-height: 1.6;
                    color: #64748b;
                  "
                >
                  Never share this verification code with anyone.
                  Mini ERP Portal support will never ask for your OTP
                  or password.
                </div>

              </div>

              <p
                style="
                  margin-top: 20px;
                  font-size: 12px;
                  line-height: 1.6;
                  color: #94a3b8;
                "
              >
                If you did not request a password reset, you can safely
                ignore this email.
              </p>

            </div>

            <!-- Footer -->
            <div
              style="
                padding: 20px;
                text-align: center;
                border-top: 1px solid #f1f5f9;
                background-color: #ffffff;
              "
            >

              <div
                style="
                  font-size: 13px;
                  font-weight: 700;
                  color: #4f46e5;
                "
              >
                Mini ERP Portal
              </div>

              <div
                style="
                  margin-top: 5px;
                  font-size: 11px;
                  color: #94a3b8;
                "
              >
                Smart Business Management · CRM · Inventory · Sales
              </div>

              <div
                style="
                  margin-top: 10px;
                  font-size: 10px;
                  color: #cbd5e1;
                "
              >
                This is an automated email. Please do not reply directly
                to this message.
              </div>

            </div>

          </div>

        </body>
      </html>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);

    console.log(
      `Nodemailer OTP dispatched to ${toEmail}: ${info.messageId}`
    );

    return true;
  } catch (err: any) {
    console.warn(
      `Nodemailer SMTP Notice (${err.message}). Local fallback active for testing.`
    );

    console.log(
      `📩 [LOCAL DEV OTP DISPATCH] To: ${toEmail} | OTP Code: ${otpCode}`
    );

    return false;
  }
};
