const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // true = SSL
  auth: {
    user: process.env.EMAIL_USER, // your Gmail
    pass: process.env.EMAIL_PASS, // your App Password
  },
});

// Verify transporter at startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Nodemailer transporter verification failed:", error);
  } else {
    console.log("✅ Nodemailer transporter is ready to send emails");
  }
});

async function sendMail(receiverEmail, subject, body) {
  const effectiveSenderName = process.env.SENDER_NAME || "TaskManager";

  try {
    const info = await transporter.sendMail({
      from: `${effectiveSenderName} <${process.env.EMAIL_USER}>`,
      to: receiverEmail,
      subject,
      html: body,
    });

    console.log("✅ Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw error;
  }
}

module.exports = { sendMail };
