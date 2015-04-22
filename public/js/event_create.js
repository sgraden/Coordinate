"use strict";
(function() {

$(document).ready(function() {
	createMonthCal();
	$("#event-submit").click(function (e) {
		e.preventDefault();

		

		return false;
	});
});

function createMonthCal() {
	$('#month-calendar').fullCalendar({
		height: 600,
		selectable: true,
		selectHelper: true,
		select: function(start, end) {
			var check = $.fullCalendar.formatDate(start,'yyyy-MM-dd');
		    var today = $.fullCalendar.formatDate(new Date(),'yyyy-MM-dd');
		    if(check < today)
		    {
		        return null;
		    } else {
		        // Its a right date
		                // Do something
		    }
		},
		fixedWeekCount: false
	});
}

})();