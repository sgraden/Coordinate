"use strict";
(function() {
	var eventList;

$(document).ready(function() {
	//console.log(window.location.hostname);
	if (checkLogin()) {
		/*$.ajax({
			type: "POST",
			url: '/view_events'
		}).success(function(data){
			eventList = data[0];
			console.log(eventList);
			buildEventList();
			//console.log(data);
			//window.location.replace(data);
		});*/
		$('#view-events .view-events-element').click(function () {
			var uuid = $(this).data('uuid');
			window.location.href = '/event_review?e=' + uuid;
		});

		$('#view-events-created-button').on('click', function () {
			//$(this).toggleClass('clicked');
			$('.view-events-selector').toggleClass('clicked');

			$('#view-events-created').show();
			$('#view-events-participated').hide();
		});
		$('#view-events-participated-button').on('click', function () {
			$('.view-events-selector').toggleClass('clicked');

			$('#view-events-created').hide();
			$('#view-events-participated').show();
		});
	} else { //Handle not logged in

	}
});

/*function buildEventList() {
	$.each(eventList, function(index, value) {
		var $element = $('div').addClass('view-events-element col-xs-10 col-xs-offset-1');
		var $row = $('div').addClass('row');
		var $eventTitle = $('div').html(value.EventName);
		
		$row.append($eventTitle);
		$element.append($row);
		$('#view-events-content').append($element);
	});
}*/

})();