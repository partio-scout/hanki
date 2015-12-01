/**
 * New Relic agent configuration.
 *
 * Confugration is actually read from env variables, but this file is required for New Relic
 * to function.
 *
 * See: https://docs.newrelic.com/docs/agents/nodejs-agent/installation-configuration/nodejs-agent-configuration
 */
exports.config = {
  app_name: ['HANKI / Dev'],
  license_key: '',
  logging: {
    level: 'info',
  },
};
