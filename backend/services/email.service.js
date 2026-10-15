const nodemailer = require("nodemailer");

// In-memory OTP store (production: use Redis with TTL)
// Format: { [email]: { otp, expiresAt, attempts } }
const otpStore = new Map();

/**
 * Generate a 6-digit OTP
 */
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Create a nodemailer transporter.
 * Uses Gmail if credentials are set, otherwise falls back to Ethereal for dev.
 */
async function createTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Ethereal fallback for development testing
  const testAccount = await nodemailer.createTestAccount();
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
  console.log(
    "📧 Email preview (Ethereal): Check https://ethereal.email — user:",
    testAccount.user
  );
  return transporter;
}

/**
 * Send OTP email to the specified address.
 * Returns { success: boolean, previewUrl?: string }
 */
async function sendOTPEmail(email, fullname, otp) {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"HireHub" <${process.env.EMAIL_USER || "noreply@hirehub.dev"}>`,
      to: email,
      subject: "Your HireHub Verification Code",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>HireHub OTP</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(79,70,229,0.10);">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:36px 40px;text-align:center;">
              <div style="display:inline-block;background:rgba(255,255,255,0.15);border-radius:14px;padding:10px 18px;margin-bottom:12px;">
                <span style="color:#fff;font-size:22px;font-weight:900;letter-spacing:-0.5px;">Hire<span style="color:#c4b5fd;">Hub</span></span>
              </div>
              <h1 style="color:#fff;margin:0;font-size:20px;font-weight:700;">Verify Your Email Address</h1>
              <p style="color:rgba(255,255,255,0.75);margin:8px 0 0;font-size:13px;">One step closer to your dream career</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <p style="margin:0 0 16px;color:#334155;font-size:15px;">Hi <strong>${fullname || "there"}</strong>,</p>
              <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.6;">
                Use the verification code below to complete your HireHub account setup. This code is valid for <strong>10 minutes</strong> and can only be used once.
              </p>

              <!-- OTP Box -->
              <div style="background:linear-gradient(135deg,#eef2ff,#ede9fe);border:2px solid #c7d2fe;border-radius:16px;padding:28px;text-align:center;margin:0 0 28px;">
                <p style="margin:0 0 6px;font-size:11px;font-weight:700;color:#6366f1;letter-spacing:2px;text-transform:uppercase;">Your Verification Code</p>
                <div style="font-size:48px;font-weight:900;letter-spacing:10px;color:#4f46e5;font-family:monospace;">${otp}</div>
                <p style="margin:8px 0 0;font-size:11px;color:#94a3b8;">Expires in 10 minutes</p>
              </div>

              <div style="background:#fef3c7;border:1px solid #fde68a;border-radius:12px;padding:14px 18px;margin-bottom:24px;">
                <p style="margin:0;font-size:12px;color:#92400e;">
                  ⚠️ <strong>Security Notice:</strong> Never share this code with anyone. HireHub will never ask for your OTP via phone or chat.
                </p>
              </div>

              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                If you didn't create a HireHub account, you can safely ignore this email. No account will be created without verification.
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:20px 40px;text-align:center;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:11px;color:#94a3b8;">
                © ${new Date().getFullYear()} HireHub · Built for developers and talent everywhere
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log("📧 OTP Email Preview URL:", previewUrl);
    }
    return { success: true, previewUrl: previewUrl || null };
  } catch (err) {
    console.error("Email send error:", err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Store OTP for a given email (replaces any existing OTP)
 */
function storeOTP(email, otp) {
  otpStore.set(email.toLowerCase(), {
    otp,
    expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutes
    attempts: 0,
  });
}

/**
 * Verify OTP for a given email.
 * Returns { valid: boolean, reason?: string }
 */
function verifyOTP(email, inputOtp) {
  const record = otpStore.get(email.toLowerCase());
  if (!record) {
    return { valid: false, reason: "No OTP found. Please request a new one." };
  }
  if (Date.now() > record.expiresAt) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, reason: "OTP has expired. Please request a new one." };
  }
  record.attempts += 1;
  if (record.attempts > 5) {
    otpStore.delete(email.toLowerCase());
    return { valid: false, reason: "Too many failed attempts. Please request a new OTP." };
  }
  if (record.otp !== inputOtp.toString().trim()) {
    return { valid: false, reason: "Incorrect verification code. Please try again." };
  }
  otpStore.delete(email.toLowerCase());
  return { valid: true };
}

/**
 * Delete stored OTP for an email (on successful registration)
 */
function clearOTP(email) {
  otpStore.delete(email.toLowerCase());
}

module.exports = {
  generateOTP,
  sendOTPEmail,
  storeOTP,
  verifyOTP,
  clearOTP,
};
