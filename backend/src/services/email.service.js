const axios = require("axios");
// const sgMail = require("@sendgrid/mail");

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async ({ to, subject, html }) => {
  try {
    /*
    // === SendGrid Implementation (Kept as requested) ===
    const msg = {
      to,
      from: process.env.EMAIL_FROM,
      subject,
      html,
    };

    await sgMail.send(msg);
    */

    // === Brevo Implementation ===
    const data = {
      sender: { 
        email: process.env.EMAIL_FROM, 
        name: process.env.EMAIL_FROM_NAME || 'FleetIQ' 
      },
      to: [{ email: to }],
      subject: subject,
      htmlContent: html,
    };

    const config = {
      method: 'post',
      url: 'https://api.brevo.com/v3/smtp/email',
      headers: { 
        'accept': 'application/json', 
        'api-key': process.env.BREVO_API_KEY, 
        'content-type': 'application/json'
      },
      data: data
    };

    await axios.request(config);

    console.log("✅ Email sent successfully via Brevo");
  } catch (error) {
    console.error(
      "❌ Email Error:",
      error.response?.data || error.message
    );
  }
};

module.exports = { sendEmail };