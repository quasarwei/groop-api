module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL:
    process.env.DATABASE_URL || 'postgresql://postgres@localhost/groop',
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    'postgresql://postgres@localhost/groop_test',
  JWT_SECRET: process.env.JWT_SECRET || 'ultimate_group_secret666',
  MAIL_PSWD: process.env.MAIL_PSWD || 'm',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '3h',
};
