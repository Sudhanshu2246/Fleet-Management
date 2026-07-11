require("dotenv").config();

const { sendEmail } = require("./services/email.service");

const run = async () => {
  await sendEmail({
    to: "sudhanshu2246@gmail.com",
    subject: "Test Email 🚀",
    html: "<h2>SendGrid is working ✅</h2>",
  });
};

run();