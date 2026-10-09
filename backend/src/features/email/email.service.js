const { getTransporter, verifyConnection } = require('./transporter');
const { getEmailConfig } = require('./config');
const { renderSetupAccountTemplate } = require('./templates/setupAccount');
const { renderResetPasswordTemplate } = require('./templates/resetPassword');
const { renderRequestDecisionTemplate } = require('./templates/requestDecision');

/**
 * Low-level email sender
 */
async function sendMail({ to, subject, html, text }) {
  const config = getEmailConfig();
  const transporter = getTransporter();

  const mailOptions = {
    from: config.from,
    to,
    subject,
    html,
    text: text || html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim(),
  };

  const info = await transporter.sendMail(mailOptions);
  return {
    success: true,
    messageId: info.messageId,
  };
}

/**
 * Sends student onboarding / setup link email
 */
async function sendAccountSetupEmail({ to, studentName, setupUrl, expiresInHours = 24 }) {
  const html = renderSetupAccountTemplate({
    studentName,
    setupUrl,
    expiresInHours,
  });

  return sendMail({
    to,
    subject: 'Welcome to ExamSlot - Set Up Your Account',
    html,
  });
}

/**
 * Sends password reset token email
 */
async function sendPasswordResetEmail({ to, userName, resetUrl, expiresInMinutes = 60 }) {
  const html = renderResetPasswordTemplate({
    userName,
    resetUrl,
    expiresInMinutes,
  });

  return sendMail({
    to,
    subject: 'ExamSlot - Password Reset Request',
    html,
  });
}

/**
 * Sends change request decision email
 */
async function sendRequestDecisionEmail({ to, studentName, requestType, status, adminNote }) {
  const html = renderRequestDecisionTemplate({
    studentName,
    requestType,
    status,
    adminNote,
  });

  return sendMail({
    to,
    subject: `ExamSlot - Request ${status.toUpperCase()}: ${requestType}`,
    html,
  });
}

module.exports = {
  sendMail,
  sendAccountSetupEmail,
  sendPasswordResetEmail,
  sendRequestDecisionEmail,
  verifyEmailService: verifyConnection,
};
