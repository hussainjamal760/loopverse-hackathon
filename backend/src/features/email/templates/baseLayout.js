/**
 * Base email HTML wrapper implementing ExamSlot brand guidelines
 * - Primary: Forest green #285742
 * - Canvas: Warm ivory #f7f5ef
 * - Ink: Deep slate #24352b
 */
function renderBaseLayout({ title, previewText, contentHtml }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || 'ExamSlot Notification'}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f7f5ef;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #24352b;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #f7f5ef;
      padding: 40px 16px;
    }
    .card {
      max-width: 580px;
      margin: 0 auto;
      background-color: #ffffff;
      border: 1px solid #dedcd1;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 16px rgba(36, 53, 43, 0.05);
    }
    .header {
      background-color: #285742;
      padding: 24px 32px;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.3px;
    }
    .content {
      padding: 32px;
      line-height: 1.6;
      font-size: 15px;
      color: #24352b;
    }
    .btn {
      display: inline-block;
      background-color: #285742;
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 500;
      padding: 12px 28px;
      border-radius: 10px;
      margin: 20px 0;
    }
    .footer {
      padding: 20px 32px;
      background-color: #f0eee6;
      font-size: 12px;
      color: #59645b;
      border-top: 1px solid #dedcd1;
      text-align: center;
    }
  </style>
</head>
<body>
  <div style="display:none;font-size:1px;color:#f7f5ef;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
    ${previewText || ''}
  </div>
  <table role="presentation" class="wrapper" width="100%" cellspacing="0" cellpadding="0">
    <tr>
      <td align="center">
        <div class="card">
          <div class="header">
            <h1>ExamSlot</h1>
          </div>
          <div class="content">
            ${contentHtml}
          </div>
          <div class="footer">
            <p style="margin: 0;">This is an automated system notification from ExamSlot.</p>
            <p style="margin: 4px 0 0;">Please do not reply directly to this email.</p>
          </div>
        </div>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

module.exports = {
  renderBaseLayout,
};
