import 'dotenv/config'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
})

export const sendVerificationEmail = async (
  to,
  verificationUrl
) => {
  await transporter.sendMail({
    from: `"Complaint Management System" <${process.env.EMAIL_USER}>`,
    to,
    subject: 'Verify your email address',
    html: `
      <h2>Welcome to Complaint Management System</h2>

      <p>Thank you for registering.</p>

      <p>
        Please click the button below to verify your
        email address:
      </p>

      <p>
        <a
          href="${verificationUrl}"
          style="
            display: inline-block;
            padding: 10px 20px;
            background-color: #2563eb;
            color: white;
            text-decoration: none;
            border-radius: 5px;
          "
        >
          Verify Email
        </a>
      </p>

      <p>
        This verification link will expire after
        24 hours.
      </p>

      <p>
        If you did not create this account, you can
        ignore this email.
      </p>
    `,
  })
}