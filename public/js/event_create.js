"use strict";
(function() {

var startDate, endDate;

$(document).ready(function() {
	createMonthCal();
	$("#event-submit").click(function (e) {
		e.preventDefault();

		//Data pulled from the input fields (include startDate/endDate from global)
		var name = $('input[name="event-name"]').val();
		var descr = $('textarea[name="event-descr"]').val();
		var startTime = $('input[name="event-time-from"]').val();
		var endTime = $('input[name="event-time-to"]').val();
		var eventLength = $('select[name="event-length"]').val();
		var notifyNum = 0;
		if ($('input[name="notify-participant"]').is(':checked')) {
			notifyNum = $('select[name="notify-num-participants"]').val();
		}
		var notifyDays = 0;
		if ($('input[name="notify-after"]').is(':checked')) {
			notifyDays = $('select[name="notify-num-after"]').val();
		}
		var notifyEach = $('input[name="notify-each"]').is(':checked') ? 1 : 0;
		
		//Payload to send to the server to insert to DB
		var payload = {
			name: 		name,
			descr: 		descr,
			startDate: 	startDate,
			endDate: 	endDate,
			startTime: 	startTime,
			endTime: 	endTime,
			eventLength: eventLength,
			notifyNum: 	notifyNum,
			notifyDays: notifyDays,
			notifyEach: notifyEach,
			uuid: guid()
		};

		$.ajax({
			type: "POST",
			url: '/event_create',
			data: payload
		}).success(function(data){
			console.log(data);
			location.href=data;
		});


		return false;
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

//Creates the FullPAge.js calendar
function createMonthCal() {
	$('#month-calendar').fullCalendar({
		height: 600,
		selectable: true,
		selectHelper: true,
		select: function(start, end) {
			end.add(-1, 'day');
			startDate = start.format();
			endDate = end.format();
			//var check = $.fullCalendar.formatRange(start, end, 'MMMM D, YYYY');
		    // var today = $.formatDate(new Date(),'yyyy-MM-dd');
		    // if(check < today)
		    // {
		    //     return null;
		    // } else {
		        // Its a right date
		                // Do something
		        //console.log(check);
		    // }
		},
		fixedWeekCount: false
	});
}

})();