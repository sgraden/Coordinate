"use strict";
(function() {

var isMouseDown = false;
var isHighlighted;
var preferredMode = true;

$(document).ready(function() {
    reloadDisplay(); //Don't want to do this

	$(document).mouseup(function () {
      	isMouseDown = false;
    });

    $("#availability-submit").click(function() {
        location.href = "testing.html";
    });

    //btn for entering available
    $("#btn-available").click(function() {
        preferredMode = true;
    });
    //btn for not preferred
    $("#btn-not-preferred").click(function() {
        preferredMode = false;
    });
    createTimes(12, 6);


  	$("#dataTable td")
  		.mousedown(function () {
	      	isMouseDown = true; //Set mousedown to true

            //Mousedown and not Times/Days
	      	if (!$(this).hasClass("tblTime")) {
                if (preferredMode) {
                    $(this).toggleClass("available").removeClass("not_preferred"); //Toggle available class
                } else {
                    $(this).toggleClass("not_preferred").removeClass("available"); //Toggle not_preferred class
                }
            }

	      	isHighlighted = ($(this).hasClass("available") || $(this).hasClass("not_preferred"));
	      	return false; // prevent text selection
    	})
    	.mouseover(function () {
            //console.log($(this));

            //Mousedown and not Times/Days
            if (isMouseDown && !$(this).hasClass("tblTime")) { 
                if (preferredMode) {
                    $(this).toggleClass("available", isHighlighted).removeClass("not_preferred"); //Toggle available class
                } else {
                    $(this).toggleClass("not_preferred", isHighlighted).removeClass("available"); //Toggle not_preferred class
                }
	      	}
            return false;
    	});

});

function reloadDisplay() {
    $.get('/availability?event_id=' + getParameterByName('event')).success(function(data){
        $('#availability-name').html(data[0].eventname);
        $('#availability-descr').html(data[0].eventdesc);
    });
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function pauseEvent(e){
    e.stopPropagation();
    e.preventDefault();
    return false;
}

function createTimes(length, startTime) {
    for (var i = 0; i < length; i++) {
        var $tr = $('<tr>');
        $tr.append($('<td>').addClass('tblTime').html((startTime + i) + ":00"));
        for (var w = 0; w < 5; w++) {
            $tr.append($('<td>'));
        }
        $('#dataTable').append($tr);
        //console.log($tr);
    }
}

})();