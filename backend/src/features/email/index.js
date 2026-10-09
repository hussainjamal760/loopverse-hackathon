const emailService = require('./email.service');
const emailRoutes = require('./email.routes');
const { getEmailConfig } = require('./config');

module.exports = {
  ...emailService,
  emailRoutes,
  getEmailConfig,
};
