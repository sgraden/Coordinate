"use strict";
(function() {

var isMouseDown = false;
var isHighlighted;
var preferredMode = true;

$(document).ready(function() {
	$(document).mouseup(function () {
      	isMouseDown = false;
    });

    //btn for entering available
    $("#btn_available").click(function() {
        preferredMode = true;
    });
    //btn for not preferred
    $("#btn_not_preferred").click(function() {
        preferredMode = false;
    });
    createTimes(12, 6);


  	$("#dataTable td")
  		.mousedown(function () {
	      	isMouseDown = true; //Set mousedown to true

            //Mousedown and not Times/Days
	      	if (!$(this).hasClass("tblTime")) {
                if (preferredMode) {
                    $(this).toggleClass("available"); //Toggle available class
                } else {
                    $(this).toggleClass("not_preferred"); //Toggle not_preferred class
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
                    $(this).toggleClass("available", isHighlighted); //Toggle available class
                } else {
                    $(this).toggleClass("not_preferred", isHighlighted); //Toggle not_preferred class
                }
	      	}
            return false;
    	});

});

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
        console.log($tr);
    }
}

})();