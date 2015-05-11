"use strict";
(function() {

$(document).ready(function() {
	console.log(window.location.hostname);
	checkLogin();
	$("#home-create").click(function() {
		checkLogin();
		if (checkLogin()) {
			window.location.assign("/event_create");
		} else {
			$('#modal-loginalert').modal('show');
		}
	});

});


})();