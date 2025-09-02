const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter at startup to catch configuration issues
transporter.verify(function(error, success) {
  if (error) {
    console.error("Nodemailer transporter verification failed:", error);
  } else {
    console.log("Nodemailer transporter is ready to send emails");
  }
});


async function sendMail(receiverEmail, subject, body) {
  const effectiveSenderName = process.env.SenderName || "TaskManager";
  console.log("Sender Name:", effectiveSenderName);
  try {
    await transporter.sendMail({
      from:`${effectiveSenderName} <${process.env.EMAIL_USER}>`,
      to: receiverEmail,
      subject: subject,
      html: body,
    });

    console.log("Email sent successfully!");
  } catch (error) {
    console.error("Error sending email:", error);
  }
}

exports.sendMail = sendMail;