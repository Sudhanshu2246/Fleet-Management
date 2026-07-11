const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    const msg = {
      to,
      from: process.env.EMAIL_FROM,
      subject,
      html,
    };

    await sgMail.send(msg);

    console.log("✅ Email sent");
  } catch (error) {
    console.error(
      "❌ SendGrid Error:",
      error.response?.body || error.message
    );
  }
};

module.exports = { sendEmail };