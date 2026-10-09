import { EmailOutbox } from '@/server/models';

interface SendSetupEmailParams {
  userId: string;
  to: string;
  studentName: string;
  setupUrl: string;
  expiresInHours?: number;
}

interface SendDecisionEmailParams {
  userId: string;
  to: string;
  studentName: string;
  requestType: string;
  decision: 'APPROVED' | 'REJECTED';
  remark?: string;
}

function getEmailTransporter() {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodemailer = require('../../../../backend/node_modules/nodemailer');
    const user = process.env.EMAIL_USER || 'hjamal9865@gmail.com';
    const pass = process.env.EMAIL_PASS;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
    const emailFrom = process.env.EMAIL_FROM || `ExamSlot <${user}>`;

    // 1. Direct App Password Mode (Recommended & Easiest)
    if (user && pass) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user,
          pass,
        },
      });
      return { transporter, emailFrom };
    }

    // 2. OAuth2 Mode (Requires matching refresh token)
    if (clientId && clientSecret && refreshToken && refreshToken.trim().length > 0) {
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          type: 'OAuth2',
          user,
          clientId,
          clientSecret,
          refreshToken,
        },
      });
      return { transporter, emailFrom };
    }

    return null;
  } catch (err) {
    console.error('Failed to initialize nodemailer transporter:', err);
    return null;
  }
}

/**
 * Renders high-fidelity HTML email template matching ExamSlot design system
 */
function renderSetupEmailHtml(studentName: string, setupUrl: string, expiresInHours: number = 24): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #f7f5ef; margin: 0; padding: 24px; color: #24352b; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #dedcd1; padding: 32px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
    .header { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; border-bottom: 1px solid #eae7dd; padding-bottom: 16px; }
    .title { font-size: 20px; font-weight: 700; color: #0d402c; margin: 0; }
    .body { font-size: 14px; line-height: 1.6; color: #374151; }
    .btn-container { text-align: center; margin: 32px 0; }
    .btn { display: inline-block; background-color: #285742; color: #ffffff !important; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eae7dd; font-size: 12px; color: #6b7280; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="title">ExamSlot - Student Portal Activation</h1>
    </div>
    <div class="body">
      <p>Dear <strong>${studentName || 'Student'}</strong>,</p>
      <p>Your academic registration record has been successfully enrolled in the <strong>ExamSlot Examination Management System</strong> for the upcoming term.</p>
      <p>To access your exam planner, select your preferred campus exam branch, and schedule your date sheet, please activate your account and establish your portal password below:</p>
      <div class="btn-container">
        <a href="${setupUrl}" class="btn" target="_blank">Activate Account & Set Password</a>
      </div>
      <p style="font-size: 13px; color: #6b7280;">This activation link is cryptographically scoped, valid for <strong>${expiresInHours} hours</strong>, and single-use only.</p>
      <p style="font-size: 12px; color: #6b7280; word-break: break-all;">
        Direct URL: <a href="${setupUrl}" style="color: #285742;">${setupUrl}</a>
      </p>
    </div>
    <div class="footer">
      ExamSlot Academic Registrar • Virtual University Campus Management System
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Creates email outbox entry and attempts delivery via Gmail transporter
 */
export async function sendStudentSetupEmail({
  userId,
  to,
  studentName,
  setupUrl,
  expiresInHours = 24,
}: SendSetupEmailParams): Promise<{ sent: boolean; outboxId: string; error?: string }> {
  const outbox = await EmailOutbox.create({
    userId,
    template: 'STUDENT_SETUP_INVITE',
    relatedEntityId: setupUrl,
    status: 'PENDING',
    attempts: 0,
    nextAttemptAt: new Date(),
  });

  try {
    const config = getEmailTransporter();

    if (config) {
      const { transporter, emailFrom } = config;
      const html = renderSetupEmailHtml(studentName, setupUrl, expiresInHours);

      await transporter.sendMail({
        from: emailFrom,
        to,
        subject: 'Welcome to ExamSlot - Activate Your Student Account',
        html,
        text: `Welcome to ExamSlot, ${studentName}! Activate your account: ${setupUrl}`,
      });

      outbox.status = 'SENT';
      outbox.sentAt = new Date();
      outbox.attempts += 1;
      await outbox.save();

      return { sent: true, outboxId: outbox._id.toString() };
    } else {
      outbox.status = 'FAILED';
      outbox.sanitizedError = 'Missing email credentials (EMAIL_PASS or GOOGLE_REFRESH_TOKEN) in environment';
      await outbox.save();
      return { sent: false, outboxId: outbox._id.toString(), error: 'Email service unconfigured: Missing EMAIL_PASS or GOOGLE_REFRESH_TOKEN' };
    }
  } catch (err: any) {
    console.error('Failed to deliver setup email:', err.message);
    outbox.status = 'FAILED';
    outbox.attempts += 1;
    outbox.sanitizedError = err.message;
    await outbox.save();
    return { sent: false, outboxId: outbox._id.toString(), error: err.message };
  }
}

/**
 * Sends formal change request decision notification email
 */
export async function sendRequestDecisionEmailNotification({
  userId,
  to,
  studentName,
  requestType,
  decision,
  remark,
}: SendDecisionEmailParams): Promise<{ sent: boolean; outboxId: string; error?: string }> {
  const outbox = await EmailOutbox.create({
    userId,
    template: 'CHANGE_REQUEST_DECISION',
    relatedEntityId: `${requestType}_${decision}`,
    status: 'PENDING',
    attempts: 0,
    nextAttemptAt: new Date(),
  });

  try {
    const config = getEmailTransporter();

    if (config) {
      const { transporter, emailFrom } = config;
      const isApproved = decision === 'APPROVED';
      const typeLabel = requestType === 'BRANCH' ? 'Campus Branch Transfer' : 'Exam Date Sheet Reschedule';

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background-color: #f7f5ef; margin: 0; padding: 24px; color: #24352b; }
    .card { max-width: 560px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #dedcd1; padding: 32px; }
    .header { margin-bottom: 20px; border-bottom: 1px solid #eae7dd; padding-bottom: 14px; }
    .title { font-size: 18px; font-weight: 700; color: #0d402c; margin: 0; }
    .badge { display: inline-block; padding: 6px 14px; border-radius: 9999px; font-weight: 600; font-size: 12px; margin: 16px 0; }
    .badge-approved { background-color: #e7eee3; color: #285742; border: 1px solid #285742; }
    .badge-rejected { background-color: #faeae7; color: #a3342f; border: 1px solid #a3342f; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="title">ExamSlot - Formal Change Request Decision</h1>
    </div>
    <p>Dear <strong>${studentName || 'Student'}</strong>,</p>
    <p>Your academic request regarding <strong>${typeLabel}</strong> has been reviewed by the administration.</p>
    <div>
      <span class="badge ${isApproved ? 'badge-approved' : 'badge-rejected'}">
        Decision: ${decision}
      </span>
    </div>
    ${remark ? `<p style="font-size: 13px; color: #4b5563; background: #f7f5ef; padding: 12px; border-radius: 8px;"><strong>Registrar Remark:</strong> ${remark}</p>` : ''}
    <p style="font-size: 13px; color: #4b5563;">
      ${
        isApproved
          ? 'Your request has been approved and applied to your portal timetable.'
          : 'Your schedule commitments remain unchanged as originally finalized.'
      }
    </p>
    <p style="font-size: 12px; color: #6b7280; margin-top: 24px;">
      ExamSlot Academic Registrar • Virtual University Examination Management
    </p>
  </div>
</body>
</html>
      `;

      await transporter.sendMail({
        from: emailFrom,
        to,
        subject: `ExamSlot Request ${decision}: ${typeLabel}`,
        html,
        text: `Your ${typeLabel} request has been ${decision.toLowerCase()}.`,
      });

      outbox.status = 'SENT';
      outbox.sentAt = new Date();
      outbox.attempts += 1;
      await outbox.save();

      return { sent: true, outboxId: outbox._id.toString() };
    } else {
      outbox.status = 'FAILED';
      outbox.sanitizedError = 'Missing email credentials (EMAIL_PASS or GOOGLE_REFRESH_TOKEN) in environment';
      await outbox.save();
      return { sent: false, outboxId: outbox._id.toString(), error: 'Email service unconfigured: Missing EMAIL_PASS or GOOGLE_REFRESH_TOKEN' };
    }
  } catch (err: any) {
    console.error('Failed to deliver decision email:', err.message);
    outbox.status = 'FAILED';
    outbox.attempts += 1;
    outbox.sanitizedError = err.message;
    await outbox.save();
    return { sent: false, outboxId: outbox._id.toString(), error: err.message };
  }
}
