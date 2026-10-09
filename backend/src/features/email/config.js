require('dotenv').config();

function getEmailConfig() {

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  const user = process.env.EMAIL_USER || 'hjamal9865@gmail.com';
  const pass = process.env.EMAIL_PASS;
  const from = process.env.EMAIL_FROM || `ExamSlot <${user}>`;

  const hasAppPass = Boolean(user && pass);
  const hasOAuth = Boolean(clientId && clientSecret && refreshToken);

  return {
    mode: hasAppPass ? 'app_password' : (hasOAuth ? 'oauth2' : 'none'),
    clientId,
    clientSecret,
    refreshToken,
    user,
    pass,
    from,
    isConfigured: hasOAuth || hasAppPass,
  };
}

module.exports = {
  getEmailConfig,
};
