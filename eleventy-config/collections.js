const Schedule = require('./lib/schedule');

module.exports.talkSchedule = async () => {
	return new Schedule('https://api.composer.nprstations.org/v1/widget/5a67baa3e4b089a2b81dd57d/week');
};

module.exports.musicSchedule = async () => {
	return new Schedule('https://api.composer.nprstations.org/v1/widget/5a67bb13e4b00008a7fd83b6/week');
};
