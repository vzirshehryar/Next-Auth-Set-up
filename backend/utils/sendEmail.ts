import nodeMailer from "nodemailer";
import { parsedEnv } from "../env";

export const sendEmail = async (email: string, subject: string, text: string) => {
  try {
    const transporter = nodeMailer.createTransport({
      service: "gmail", // Use the Gmail service
      auth: {
        user: parsedEnv.ADMIN_GMAIL, // Your Gmail address
        pass: parsedEnv.ADMIN_PASSWORD, // App password (not your Gmail password)
      },
    });
    await transporter.sendMail({
      from: `"your app" <${parsedEnv.ADMIN_GMAIL}>`,
      to: email,
      subject: subject,
      text: text,
      html: `<b style="margin: 30px 10px;">${text}</b>`,
    });
    console.log("Email sent successfully");
    return;
  } catch (err) {
    console.log(err);
  }
};
