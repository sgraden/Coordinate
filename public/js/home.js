"use strict";
(function() {

$(document).ready(function() {
	console.log(window.location.hostname);
	
	$("#home-create").click(function() {
		window.location.assign(window.location.hostname + "/event_create");
	});
});


})();