import 'dotenv/config'
import nodemailer from 'nodemailer'

// Local development: Gmail through nodemailer (used when BREVO_API_KEY is not set).
// Deployed on Render: Brevo HTTPS API (used when BREVO_API_KEY is set).

let gmailTransporter = null

const getGmailTransporter = () => {
  if (!gmailTransporter) {
    gmailTransporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD,
      },
    })
  }
  return gmailTransporter
}

const sendEmail = async ({ to, subject, html }) => {
  if (process.env.BREVO_API_KEY) {
    const response = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Complaint Management System',
          email: process.env.EMAIL_FROM,
        },
        to: [{ email: to }],
        subject,
        htmlContent: html,
      }),
    })

    if (!response.ok) {
      throw new Error(
        `Email failed: ${response.status} ${await response.text()}`
      )
    }
    return
  }

  await getGmailTransporter().sendMail({
    from: `"Complaint Management System" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  })
}

export const sendVerificationEmail = async (to, verificationUrl) => {
  await sendEmail({
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