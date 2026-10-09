const express = require('express');
const { verifyEmailService, sendMail } = require('./email.service');
const { getEmailConfig } = require('./config');

const router = express.Router();

/**
 * GET /api/email/status
 * Check configuration status and verify Google OAuth2 credentials
 */
router.get('/status', async (req, res) => {
  try {
    const config = getEmailConfig();
    if (!config.isConfigured) {
      return res.status(500).json({
        success: false,
        message: 'Email service missing environment variables',
        missing: config.missingKeys,
      });
    }

    await verifyEmailService();
    return res.json({
      success: true,
      message: 'Gmail OAuth2 authentication verified successfully',
      sender: config.user,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to verify Gmail OAuth2 connection',
      error: error.message,
    });
  }
});

/**
 * POST /api/email/test
 * Send a test email to verify end-to-end delivery
 */
router.post('/test', async (req, res) => {
  const { to } = req.body;

  if (!to) {
    return res.status(400).json({
      success: false,
      message: 'Recipient email address ("to") is required',
    });
  }

  try {
    const result = await sendMail({
      to,
      subject: 'ExamSlot Email Service Test',
      html: `
        <div style="font-family: sans-serif; padding: 20px; background-color: #f7f5ef; color: #24352b; border-radius: 8px;">
          <h2 style="color: #285742;">Gmail OAuth2 Setup Successful</h2>
          <p>This email confirms that your Gmail API OAuth2 integration with ExamSlot is operational.</p>
          <p style="font-size: 12px; color: #59645b;">Sent at: ${new Date().toISOString()}</p>
        </div>
      `,
    });

    return res.json({
      success: true,
      message: `Test email sent successfully to ${to}`,
      messageId: result.messageId,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message,
    });
  }
});

module.exports = router;
