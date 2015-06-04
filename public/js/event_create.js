"use strict";
(function() {

var startDate, endDate;

$(document).ready(function() {
	createMonthCal();
	$("#event-submit").click(function (e) {
		submitEvent(e);
	});
});

//Generates a uuid
function guid() {
	function s4() {
		return Math.floor((1 + Math.random()) * 0x10000)
 		.toString(16)
		.substring(1);
	}
	return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
		s4() + '-' + s4() + s4() + s4();
}

//Creates the FullPage.js calendar
function createMonthCal() {
	$('#month-calendar').fullCalendar({
		height: 600,
		selectable: true,
		selectHelper: true,
		select: function(start, end) {
			end.add(-1, 'day');
			startDate = start.format();
			endDate = end.format();
		},
		fixedWeekCount: false,
		unselectAuto: false
	});
}

function submitEvent(e) {
	e.preventDefault();
	clearErr();

	//Data pulled from the input fields (include startDate/endDate from global)
	var name = $('input[name="event-name"]').val();
	var descr = $('textarea[name="event-descr"]').val();
	var startTime = $('input[name="event-time-from"]').val();
	var endTime = $('input[name="event-time-to"]').val();
	var eventLength = $('select[name="event-length"]').val();
	eventLength = parseFloat(eventLength);
	console.log('event length', eventLength);

	var notifyNum = 0;
	if ($('input[name="notify-participant"]').is(':checked')) {
		notifyNum = $('input[name="notify-num-participants"]').val(); /*Needs validation*/
	}
	var notifyDays = 0;
	if ($('input[name="notify-after"]').is(':checked')) {
		notifyDays = $('select[name="notify-num-after"]').val();
	}
	var notifyEach = $('input[name="notify-each"]').is(':checked') ? 1 : 0;
	var generatedUUID = guid();

	var pass = true;
	var errID = ""; //ID of element to highlight
	if (startTime >= endTime) { //If the start time before end time
		pass = false;
		errID = 'input[name="event-time-from"], input[name="event-time-to"]';
	}
	if (startDate == undefined || startTime == undefined) {
		pass = false;
		errID = '#event-calendar > div';
	}
	if (name == "") {
		pass = false
		errID = 'input[name="event-name"]';
	}

	if (pass) {
		//Payload to send to the server to insert to DB
		var payload = {
			name: 		name,
			descr: 		descr,
			startDate: 	startDate,
			endDate: 	endDate,
			startTime: 	startTime,
			endTime: 	endTime,
			eventLength: eventLength, //Half hours not supported
			notifyNum: 	notifyNum,
			notifyDays: notifyDays,
			notifyEach: notifyEach,
			uuid: generatedUUID
		};
		$.ajax({
			type: "POST",
			url: '/event_create',
			data: payload
		}).success(function(data){
			//console.log(data);
			window.location.replace(data);
		});
	} else {
		$(errID).addClass('error-highlight');
		$(errID)[0].scrollIntoView( true );
	}

	return false;
}



})();