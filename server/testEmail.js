import Mailgun from "mailgun.js";
import FormData from "form-data";
import dotenv from "dotenv";

dotenv.config();

const mailgun = new Mailgun(FormData);

const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY,
});

const sendTestEmail = async () => {
  try {
    const response = await mg.messages.create(process.env.MAILGUN_DOMAIN, {
      from: `VirtualTour <mailgun@${process.env.MAILGUN_DOMAIN}>`,
      to: ["muluneshyilma4@gmail.com"],
      subject: "Mailgun Email Test",
      text: "Success! Your Node.js application is sending emails through Mailgun.",
      html: `
          <h2>Mailgun Email Test</h2>
          <p>Success! Your Node.js application is sending emails through Mailgun.</p>
          <p>If you received this message, your email integration is working.</p>
        `,
    });

    console.log("✅ Email sent successfully!");
  } catch (error) {
    console.error("❌ Failed to send email:");
    console.error(error.message);
    if (error.details) {
      console.error("Details:", error.details);
    }
  }
};

sendTestEmail();
