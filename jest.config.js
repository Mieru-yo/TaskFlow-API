process.env.MONGOMS_VERSION = '7';

module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js',
    '!src/db.js',
  ],
  testTimeout: 30000,
};
