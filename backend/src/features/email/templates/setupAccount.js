const { renderBaseLayout } = require('./baseLayout');

function renderSetupAccountTemplate({ studentName, setupUrl, expiresInHours = 24 }) {
  const contentHtml = `
    <h2 style="margin-top: 0; color: #285742; font-size: 18px;">Welcome to ExamSlot, ${studentName || 'Student'}!</h2>
    <p>Your student account has been created. To select your exam slots and access your schedule, please set up your password.</p>
    <div style="text-align: center; margin: 28px 0;">
      <a href="${setupUrl}" class="btn">Set Up Your Account</a>
    </div>
    <p style="font-size: 13px; color: #59645b;">
      This link is valid for <strong>${expiresInHours} hours</strong> and can only be used once.
    </p>
    <p style="font-size: 12px; color: #59645b; word-break: break-all;">
      If the button above does not work, copy and paste the following link into your browser:<br/>
      <a href="${setupUrl}" style="color: #285742;">${setupUrl}</a>
    </p>
  `;

  return renderBaseLayout({
    title: 'Set up your ExamSlot account',
    previewText: 'Set your password to activate your ExamSlot account.',
    contentHtml,
  });
}

module.exports = {
  renderSetupAccountTemplate,
};
