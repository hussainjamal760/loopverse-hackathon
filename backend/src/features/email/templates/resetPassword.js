const { renderBaseLayout } = require('./baseLayout');

function renderResetPasswordTemplate({ userName, resetUrl, expiresInMinutes = 60 }) {
  const contentHtml = `
    <h2 style="margin-top: 0; color: #285742; font-size: 18px;">Password Reset Request</h2>
    <p>Hello ${userName || 'there'},</p>
    <p>We received a request to reset the password for your ExamSlot account. Click the button below to choose a new password:</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <p style="font-size: 13px; color: #59645b;">
      For security reasons, this link will expire in <strong>${expiresInMinutes} minutes</strong> and can only be used once.
    </p>
    <p style="font-size: 13px; color: #59645b;">
      If you did not request this password reset, please ignore this email. Your password will remain unchanged.
    </p>
    <p style="font-size: 12px; color: #59645b; word-break: break-all;">
      Or copy and paste this URL into your browser:<br/>
      <a href="${resetUrl}" style="color: #285742;">${resetUrl}</a>
    </p>
  `;

  return renderBaseLayout({
    title: 'Reset your ExamSlot password',
    previewText: 'Reset the password for your ExamSlot account.',
    contentHtml,
  });
}

module.exports = {
  renderResetPasswordTemplate,
};
