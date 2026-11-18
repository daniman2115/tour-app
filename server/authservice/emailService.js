import nodemailer from "nodemailer";
import dotenv from "dotenv";
import FormData from "form-data";
import Mailgun from "mailgun.js";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // Only for development!
  },
});

export const sendVerificationCode = async (email, code) => {
  try {
    if (!process.env.EMAIL_USERNAME || !process.env.EMAIL_PASSWORD) {
      throw new Error("Email credentials not configured");
    }

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: email,
      subject: "Your Verification Code",
      html: `
                <h1>Your verification code</h1>
                <p>Enter this code in your app to verify your email:</p>
                <h2 style="font-size: 24px; letter-spacing: 2px;">${code}</h2>
                <p>This code will expire in 10 minutes.</p>
            `,
    };

    const info = await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

export const sendVerificationCodeMailgun = async (email, code) => {
  const mailgun = new Mailgun(FormData);
  const mg = mailgun.client({
    username: "api",
    key: process.env.MAILGUN_API_KEY,
    // When you have an EU-domain, you must specify the endpoint:
    // url: "https://api.eu.mailgun.net"
  });
  try {
    const data = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `Virtual Tour <mailgun@${process.env.MAILGUN_DOMAIN}>`,
      to: email,
      subject: "Verify Your Email",
      text: `Your verification code is ${code}.`,
      html: `
      <div style="font-family: Arial, sans-serif;">
        <h2>Email Verification</h2>
        <p>Use the following code to verify your email:</p>
        <h1>${code}</h1>
        <p>If you did not request this code, ignore this email.</p>
      </div>
    `,
    });
    return data;
  } catch (error) {
    console.error("Mailgun error:", error);
    throw error;
  }
};
