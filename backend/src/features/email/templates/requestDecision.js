const { renderBaseLayout } = require('./baseLayout');

function renderRequestDecisionTemplate({ studentName, requestType, status, adminNote }) {
  const isApproved = status.toUpperCase() === 'APPROVED';
  const badgeColor = isApproved ? '#285742' : '#a3342f';
  const badgeBg = isApproved ? '#e7eee3' : '#faeae7';

  const contentHtml = `
    <h2 style="margin-top: 0; color: #285742; font-size: 18px;">Update on Your Change Request</h2>
    <p>Dear ${studentName || 'Student'},</p>
    <p>Your request for <strong>${requestType}</strong> has been reviewed by the administration:</p>
    <div style="background-color: ${badgeBg}; border: 1px solid ${badgeColor}; border-radius: 8px; padding: 16px; margin: 20px 0;">
      <p style="margin: 0; font-weight: 600; color: ${badgeColor};">Status: ${status.toUpperCase()}</p>
      ${adminNote ? `<p style="margin: 8px 0 0; color: #24352b; font-size: 14px;"><strong>Admin Note:</strong> ${adminNote}</p>` : ''}
    </div>
    <p>Please log in to your ExamSlot student portal to check your schedule or take any necessary actions.</p>
  `;

  return renderBaseLayout({
    title: `Change Request ${status.toUpperCase()}`,
    previewText: `Your request for ${requestType} has been ${status.toLowerCase()}.`,
    contentHtml,
  });
}

module.exports = {
  renderRequestDecisionTemplate,
};
