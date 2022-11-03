const { DateTime } = require('luxon');

class Schedule {
	constructor(url) {
		this.baseUrl = url;
		this.datetimes = this.#calculateTimeSpans();
		
		this.schedule = this.#fetchSchedule(this.datetimes.spanStart, this.datetimes.spanEnd)
			.then(this.#padSchedule)
			.then(this.#cleanup)
			.then(this.#organize)
			.then(this.#structure);

		return this.schedule;
	}

	#getDate = (date = Date.now()) => {
		return DateTime.fromJSDate(new Date(date), { zone: 'America/Chicago' });
	};

	#calculateTimeSpans = () => {
		const today = this.#getDate();
		const spanStart = today.startOf('week');
		const spanEnd = today.endOf('week');
		const paddingStart = spanEnd.plus({ days: 1 });
		const paddingEnd = paddingStart.endOf('week');
		const backfillLength = Math.floor(today.diff(spanStart, 'days').toObject().days);
		const backfillEnd = spanEnd.plus({ days: (backfillLength - 1) });
		
		return {
			today,
			spanStart,
			spanEnd,
			paddingStart,
			paddingEnd,
			backfillEnd,
		};
	};

	#fetchSchedule = (startSpan, endSpan) => {
		return fetch(`${this.baseUrl}?date=${startSpan.toFormat('yyyy-LL-dd')},${endSpan.toFormat('yyyy-LL-dd')}&format=json`).then(response => {
			if (!response.ok) throw Error('network error');
			return response.json();
		}).then(json => {
			return json.onThisWeek
		});
	};

	#cleanup = (schedule) => {
		const cleanedUpSchedule = schedule.map(show => {
			// remove past broadcasts from the schedule because they aren't relevant
			// and anything more than n-days out from the end of the current week (the backfill)
			const showStart = this.#getDate(show.start_utc);
			const showEnd = this.#getDate(show.end_utc);

			if (showEnd > this.datetimes.today && showStart < this.datetimes.backfillEnd) {
				return show;
			}
		}).filter(item => item !== undefined);

		return cleanedUpSchedule;
	};

	#padSchedule = (schedule) => {
		// if there are fewer than seven days in the reduced schedule,
		// pad the schedule to make 7 days

		return this.#fetchSchedule(this.datetimes.paddingStart, this.datetimes.paddingEnd)
			.then(paddedSchedule => {
				return [...schedule, ...paddedSchedule ];
			});
	};

	#organize = (schedule) => {
		const organizedSchedule = {};

		schedule.forEach((listing, i) => {
			const date = listing.date;
			const nextListing = schedule[(i+1)];
			const prevListing = schedule[(i-1)];

			if (organizedSchedule[date] === undefined) organizedSchedule[date] = [];

			// a show that airs over midnight will shoe up on both days' listings,
			// but the first day will show it as ending at 11 with the second day
			// showing it starting at 11. this syncs their fields and lets them
			// stay in both days' listings.
			if (nextListing !== undefined) {
				if (listing.program_id === nextListing.program_id) {
					listing.end_utc = nextListing.end_utc;
				}
			}

			if (prevListing !== undefined) {
				if (listing.program_id === prevListing.program_id) {
					listing.start_utc = prevListing.start_utc;
				}
			}

			organizedSchedule[date].push(listing);
		});

		return organizedSchedule;
	};

	#structure = (schedule) => {
		const keys = Object.keys(schedule);
		const today = [ ...schedule[keys[0]] ]
		const onTheAir = today.shift();
		const upNext = [
			today.shift(),
			today.shift(),
			today.shift(),
		].filter(item => item !== undefined);
		const laterToday = [...today];
		const thisWeek = {};

		keys.forEach((key, i) => {
			if (i > 0) {
				thisWeek[key] = schedule[key];
			}
		});

		return {
			onTheAir,
			upNext,
			laterToday,
			thisWeek,
		};
	};
}

module.exports = Schedule;
