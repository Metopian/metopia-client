function str2DateDiff(dateStr) {
	let time = new Date(dateStr)
	return getDateDiff(time.getTime())
}

function getDateDiff(dateTimeStamp, hideAgo?) {
	var minute = 1000 * 60;
	var hour = minute * 60;
	var day = hour * 24;
	var halfamonth = day * 15;
	var month = day * 30;
	var now = new Date().getTime();
	var diffValue = Math.abs(now - dateTimeStamp);
	if (diffValue < 0) { return; }
	var monthC = diffValue / month;
	var weekC = diffValue / (7 * day);
	var dayC = diffValue / day;
	var hourC = diffValue / hour;
	var minC = diffValue / minute;
	let result
	if (monthC >= 1) {
		result = "" + Math.floor(monthC) + " month" + (Math.floor(monthC) > 1 ? 's' : '') + (hideAgo ? "" : " ago");
	}
	else if (dayC >= 1) {
		result = "" + Math.floor(dayC) + " day" + (Math.floor(dayC) > 1 ? 's' : '') + (hideAgo ? "" : " ago");
	}
	else if (hourC >= 1) {
		result = "" + Math.floor(hourC) + " hour" + (Math.floor(hourC) > 1 ? 's' : '') + (hideAgo ? "" : " ago");
	}
	else if (minC > 1) {
		result = "" + Math.floor(minC) + " minutes" + (hideAgo ? "" : " ago");
	} else {
		result = "Now";
	}
	return result;
}



function dateIsClose(former, later) {
	var minute = 1000 * 60;
	var diffValue = later - former;
	return Math.abs(diffValue) < minute * 10
}

let getNextDay = (date) => {
	let nextDay = new Date()
	nextDay.setTime(date.getTime() + 24 * 60 * 60 * 1000)
	return nextDay
}

let getYesterday = (date) => {
	let nextDay = new Date()
	nextDay.setTime(date.getTime() - 24 * 60 * 60 * 1000)
	return nextDay
}

let addSecond = (date, second) => {
	let res = new Date()
	res.setTime(date.getTime() + second * 1000)
	return res
}

let getLastWeek = (date) => {
	if (!date)
		date = new Date()
	let lastWeek = new Date()
	lastWeek.setTime(date.getTime() - 7 * 24 * 60 * 60 * 1000)
	return lastWeek
}

let getWeekday = (date) => {
	return date.getDay()
}

let get7Days = () => {
	let array = []
	let date = new Date()
	array.push({
		server: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
		front: (date.getMonth() + 1) + "." + date.getDate(),
	})
	for (let i = 0; i < 6; i++) {
		date = getNextDay(date)
		array.push({
			server: date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
			front: (date.getMonth() + 1) + "." + date.getDate(),
		})
	}
	return array
}

let getLastMonthString = (date) => {
	let LastMonth = date ? date : new Date()
	LastMonth.setTime(date.getTime() - 30 * 24 * 60 * 60 * 1000)
	return LastMonth.getFullYear() + "-" + (LastMonth.getMonth() + 1) + "-" + LastMonth.getDate()
}

let getThisMonthRangeOnCalendar = (date) => {
	let firstDayOfMonth = date ? date : new Date()
	firstDayOfMonth.setDate(1)
	let lastDayOfMonth = date ? date : new Date();
	lastDayOfMonth = getYesterday(new Date(lastDayOfMonth.getFullYear(), lastDayOfMonth.getMonth() + 1, 1));
	let calFirstDay = new Date(firstDayOfMonth - (firstDayOfMonth.getDay() - 1) * 24 * 60 * 60 * 1000)
	let calLastDate = new Date(lastDayOfMonth.getTime() + (7 - lastDayOfMonth.getDay()) * 24 * 60 * 60 * 1000)
	return { begin: firstDayOfMonth, end: lastDayOfMonth }
}

let getFirstDayOfMonth = (date) => {
	let firstDayOfMonth = date ? date : new Date()
	firstDayOfMonth.setDate(1)
	firstDayOfMonth.setHours(0)
	firstDayOfMonth.setMinutes(0)
	firstDayOfMonth.setSeconds(0)
	firstDayOfMonth.setMilliseconds(0)
	return firstDayOfMonth
}


let getBeginOfDateString = (date) => {
	return date.getFullYear() + "-" + (date.getMonth() < 9 ? '0' : '') +
		(date.getMonth() + 1) + "-" + (date.getDate() < 10 ? '0' : '') + date.getDate() + " 00:00:00"
}

let getEndOfDateString = (date) => {
	return date.getFullYear() + "-" + (date.getMonth() < 9 ? '0' : '') +
		(date.getMonth() + 1) + "-" + (date.getDate() < 10 ? '0' : '') + date.getDate() + " 23:59:59"
}

let dateFormat = (fmt, date) => {
	let ret;
	const opt = {
		"Y+": date.getFullYear().toString(),
		"m+": (date.getMonth() + 1).toString(),
		"d+": date.getDate().toString(),
		"H+": date.getHours().toString(),
		"M+": date.getMinutes().toString(),
		"S+": date.getSeconds().toString()
	};
	for (let k in opt) {
		ret = new RegExp("(" + k + ")").exec(fmt);
		if (ret) {
			fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
		};
	};
	return fmt;
}
let getOnlyDateString = (date) => {
	return dateFormat("YYYY-mm-dd", date)
}

let toChineseDate = (dateString) => {
	let datepart = dateString.split(" ")[0]
	let result = datepart.split("-")[0] + '年' + datepart.split("-")[1] + '月' + datepart.split("-")[2] + '日'
	return result
}

let toSlashDate = (dateString) => {
	let datepart = dateString.split(" ")[0]
	let result = datepart.split("-")[0] + '/' + datepart.split("-")[1] + '/' + datepart.split("-")[2] + ''
	return result
}

let simpleIntOfDate = (time) => {
	let date = new Date()
	let year = date.getFullYear()
	let month = date.getMonth() + 1
	let day = date.getDate().toString()
	let result = year * 10000 + month * 100 + day
	return result
}

let simpleDate = (dateString) => {
	let datepart = dateString.split(" ")[0]
	let timepart = dateString.split(" ")[1]
	let month = datepart.split("-")[1]
	let day = datepart.split("-")[2]
	if (month[0] == 0)
		month = month[1]
	if (day[0] == 0)
		day = day[1]
	let result = month + '月' + day + '日 ' + timepart.split(":")[0] + ':' + timepart.split(":")[1]

	return result
}

let getImDateDisplay = (dateString) => {
	let d = new Date(dateString)
	let today = new Date()

	let year = d.getFullYear()
	let month = d.getMonth() + 1
	let day = d.getDate().toString()

	let todayyear = today.getFullYear()
	let todaymonth = today.getMonth() + 1
	let todayday = today.getDate().toString()

	if (day == todayday && month === todaymonth && year == todayyear) {
		return dateString.substring(11, 16)
	} else {
		return day + "." + month
	}
}


export const customFormat = (date, formatString) => {
	var YYYY, YY, MMMM, MMM, MM, M, DDDD, DDD, DD, D, hhhh, hhh, hh, h, mm, m, ss, s, ampm, AMPM, dMod, th;
	YY = ((YYYY = date.getFullYear()) + "").slice(-2);
	MM = (M = date.getMonth() + 1) < 10 ? ('0' + M) : M;
	MMM = (MMMM = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][M - 1]).substring(0, 3);
	DD = (D = date.getDate()) < 10 ? ('0' + D) : D;
	DDD = (DDDD = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][date.getDay()]).substring(0, 3);
	th = (D >= 10 && D <= 20) ? 'th' : ((dMod = D % 10) == 1) ? 'st' : (dMod == 2) ? 'nd' : (dMod == 3) ? 'rd' : 'th';
	formatString = formatString.replace("#YYYY#", YYYY).replace("#YY#", YY).replace("#MMMM#", MMMM).replace("#MMM#", MMM).replace("#MM#", MM).replace("#M#", M).replace("#DDDD#", DDDD).replace("#DDD#", DDD).replace("#DD#", DD).replace("#D#", D).replace("#th#", th);
	h = (hhh = date.getHours());
	if (h == 0) h = 24;
	// if (h > 12) h -= 12;
	hh = h < 10 ? ('0' + h) : h;
	hhhh = hhh < 10 ? ('0' + hhh) : hhh;
	AMPM = (ampm = hhh < 12 ? 'AM' : 'PM').toUpperCase();
	mm = (m = date.getMinutes()) < 10 ? ('0' + m) : m;
	ss = (s = date.getSeconds()) < 10 ? ('0' + s) : s;
	return formatString.replace("#hhhh#", hhhh).replace("#hhh#", hhh).replace("#hh#", hh).replace("#h#", h).replace("#mm#", mm).replace("#m#", m).replace("#ss#", ss).replace("#s#", s).replace("#ampm#", ampm).replace("#AMPM#", AMPM);

}

const longToString = (num) => {
	if (!num)
		return ''
	let date = new Date(num)
	return customFormat(date, "#YYYY#-#MM#-#DD# #hhhh#:#mm#:#ss#")
}
export {
	getYesterday, getLastWeek, simpleIntOfDate, getDateDiff, getThisMonthRangeOnCalendar, getBeginOfDateString,
	getEndOfDateString, getOnlyDateString, getFirstDayOfMonth, toChineseDate, simpleDate, toSlashDate, str2DateDiff,
	getImDateDisplay, longToString, dateIsClose, addSecond
}