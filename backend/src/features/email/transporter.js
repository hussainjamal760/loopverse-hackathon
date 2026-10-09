const nodemailer = require('nodemailer');
const { getEmailConfig } = require('./config');

let transporterInstance = null;

/**
 * Initializes and returns the Nodemailer OAuth2 transporter.
 * Reuses the existing singleton instance.
 */
function getTransporter() {
  const config = getEmailConfig();

  if (!config.isConfigured) {
    throw new Error(
      'Email service is not configured. Provide GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN or EMAIL_USER and EMAIL_PASS.'
    );
  }

  if (!transporterInstance) {
    if (config.mode === 'app_password') {
      transporterInstance = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: config.user,
          pass: config.pass,
        },
      });
    } else {
      transporterInstance = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          type: 'OAuth2',
          user: config.user,
          clientId: config.clientId,
          clientSecret: config.clientSecret,
          refreshToken: config.refreshToken,
        },
      });
    }
  }

  return transporterInstance;
}

/**
 * Verifies the OAuth2 connection with Google's servers.
 * @returns {Promise<boolean>}
 */
async function verifyConnection() {
  const transporter = getTransporter();
  await transporter.verify();
  return true;
}

module.exports = {
  getTransporter,
  verifyConnection,
};
