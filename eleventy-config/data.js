const Schedule = require('./lib/schedule');

module.exports.environment = (process.env.ENVIRONMENT ?? 'development');
module.exports.projectRoot = (process.env.ENVIRONMENT !== 'production' ? '/' : '/made/whats-on-mpb-radio/');
module.exports.musicLink = (process.env.ENVIRONMENT !== 'production' ? '/music/' : '/made/whats-on-mpb-radio/music/');
