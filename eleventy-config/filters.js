const { DateTime } = require('luxon');
const dateObj = (d, zone = 'utc') => {
	const date = d instanceof Date ? d : new Date(d);
	const dateTimeObj = DateTime.fromJSDate(date, { zone });
	const dstAdjustment = (dateTimeObj.isInDST ? 0 : 1);
	return dateTimeObj.plus({ hours: dstAdjustment });
};

module.exports.date = (date, format) => {
	return dateObj(date).toFormat(format);
}

module.exports.localizedDate = (date, format) => {
	return dateObj(date, 'America/Chicago').toFormat(format);
};

module.exports.htmlDateString = (date) => {
	return dateObj(date).toFormat('LLLL d, yyyy');
};

module.exports.humanDate = (date) => {
	return dateObj(date, 'America/Chicago').toFormat('LLL d, YYYY');
};

module.exports.humanTime = (date) => {
	return dateObj(date, 'America/Chicago').toFormat('h:mm a');
}

module.exports.machineTime = (date) => {
	return dateObj(date).toFormat('yyyy-LL-dd');
};

module.exports.weekFrom = (date) => {
	return dateObj(date).plus({ weeks: 1 }).toFormat('yyyy-LL-dd');
}

module.exports.RSSTimeFormat = (date) => {
	return dateObj(date).toISO();
};

module.exports.machineTimeISO = (date) => {
	return dateObj(date).toISO();
};

module.exports.trim = (str) => {
	// TODO: what is this?
	if (typeof str !== 'string' || (chr !== null && typeof chr !== 'string'))
		return str;
	if (chr === null) return str.trim;

	let result = str;
	if (str.startsWith(chr)) result = result.slice(chr.length);
	if (str.endsWith(chr)) result = result.slice(0, result.length - chr.length);
	return result;
};
