"use strict";
(function() {

$(document).ready(function() {
	//console.log(window.location.hostname);
	checkLogin();
	$("#home-create, #home-info-cover").click(function() {
		//checkLogin();
		if (checkLogin()) {
			window.location.assign("/event_create");
		} else {
			$('#modal-loginalert').modal('show');
		}
	});

});


})();