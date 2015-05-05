"use strict";
(function() {

var isMouseDown = false;
var isHighlighted;
var preferredMode = true;

var eventData;

$(document).ready(function() {
    //reloadDisplay(); //Don't want to do this
    
    $.ajax({
        type: "POST",
        url: '/availability-info',
        data: {e:getParameterByName('e')}
    }).success(function(data){
        console.log("response data: ", data[0]);
        eventData = data[0];
        createTimes();
    });

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
    //createTimes(12, 6);

  	$("#dataTable td")
  		.mousedown(timeMouseDown)
    	.mouseover(timeMouseOver);

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

//Still needs to create the days of the week based on provided data
function createTimes() {
    var startTime = eventData.EventStartTime.split(":"); //EventStartTime stored [hh, mm, ss]
    var endTime   = eventData.EventEndTime.split(":"); //EventEndTime stored [hh, mm, ss]
    var startx    = parseInt(startTime[0]) * 60 + parseInt(startTime[1]); //Start time in minutes
    var endx      = parseInt(endTime[0]) * 60 + parseInt(endTime[1]); //End time in minutes
    var duration  = endx - startx; //Difference between times in minutes

    for (var i = 0; i <= (duration / 30); i++) { //Break into 30 minute boxes
        var hr = Math.floor((i / 2) + parseInt(startTime[0]));
        if (hr > 12) {
            hr = hr - 12;
        }
        var min = (i % 2 == 0) ? ":00" : ":30"; //Alternate 30 minutes        
        var $tr = $('<tr>');
        $tr.append($('<td>').addClass('tblTime').html(hr + min));

        for (var w = 0; w < 5; w++) {
            var timeData = {
                time: hr + min
            };
            switch (w) {
                case 0:
                    timeData.day = 'm';
                    break;
                case 1:
                    timeData.day = 't';
                    break;
                case 2:
                    timeData.day = 'w';
                    break;
                case 3:
                    timeData.day = 'th';
                    break;
                case 4:
                    timeData.day = 'f';
                    break;
            }
            var $td = $('<td>').data("timeData", timeData);
            $tr.append($td);
            console.log($td.data("timeData"));
        }

        $('#dataTable').append($tr);
    }
}

function timeMouseOver() {
    //Mousedown and not Times/Days
    if (isMouseDown && !$(this).hasClass("tblTime")) { 
        if (preferredMode) {
            $(this).toggleClass("available", isHighlighted).removeClass("not_preferred"); //Toggle available class
        } else {
            $(this).toggleClass("not_preferred", isHighlighted).removeClass("available"); //Toggle not_preferred class
        }
    }
    return false;
}

function timeMouseDown() {
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
}

})();