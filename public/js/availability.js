"use strict";
(function() {

var isMouseDown = false;
var isHighlighted;
var preferredMode = true;

var eventData;

$(document).ready(function() {
    //reloadDisplay(); //Don't want to do this
    
    $.ajax({ //Initial getting of event data in database
        type: "POST",
        url: '/availability_info',
        data: {e:getParameterByName('e')}
    }).success(function(data){
        //console.log("response data: ", data[0]);
        eventData = data;
        console.log(eventData);
        createTimes(eventData);

        //btn for entering available
        $("#btn-available").click(function() {
            preferredMode = true;
        });
        //btn for not preferred
        $("#btn-not-preferred").click(function() {
            preferredMode = false;
        });

        $("#dataTable td")
            .mousedown(timeMouseDown)
            .mouseover(timeMouseOver);
    });

	$(document).mouseup(function () {
      	isMouseDown = false;
    });


    $("#availability-submit").click(function() {
        submitAvailability();
        //location.href = "testing.html";
    });

});

/*function reloadDisplay() {
    $.get('/availability?event_id=' + getParameterByName('event')).success(function(data){
        $('#availability-name').html(data[0].eventname);
        $('#availability-descr').html(data[0].eventdesc);
    });
}*/

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

function submitAvailability() {
    //var data = compileAvailability();
    //GRAB EVENT ID FROM HERE!!!!! WOOP WOOP
    $.ajax({
        type: 'POST',
        url: '/availability_submit',
        data: compileAvailability()
    }).success(function() {
        //redirect or do something
        window.location.replace('/event_review?e=' + eventData[0].EventUUID);
    });
}

function compileAvailability() {
    var compiledData = {
        elementData: []
    };
    /**
     * Grab preferred info
     * look at times and days
     * put into a preferred object
     * [id, startTime, startDate, day, preference]
     */
    $(".available").each(function(index) {
        var elem = $(this).data("timeData");
        var elemData = [eventData[0].EventID, elem.startTime, elem.startDate, elem.day, "preferred"];
        console.log(elemData);
        compiledData.elementData.push(elemData);
    });

    $(".not_preferred").each(function(index) {
        var elem = $(this).data("timeData");
        console.log(elem);
        var elemData = [eventData[0].EventID, elem.startTime, elem.startDate, elem.day, "not_preferred"];
        compiledData.elementData.push(elemData);
    });
    
    return compiledData;
}

//Still needs to create the days of the week based on provided data
/*function createTimes() {
    console.log(eventData);
    var startDate = new Date(eventData.EventStartDate);
    var endDate   = new Date(eventData.EventEndDate);
    var length    = endDate.getDate() - startDate.getDate();
    if (length < 0) {
        length = length * -1;
    }
    var startTime = eventData.EventStartTime.split(":"); //EventStartTime stored [hh, mm, ss]
    var endTime   = eventData.EventEndTime.split(":"); //EventEndTime stored [hh, mm, ss]
    var startx    = parseInt(startTime[0]) * 60 + parseInt(startTime[1]); //Start time in minutes
    var endx      = parseInt(endTime[0]) * 60 + parseInt(endTime[1]); //End time in minutes
    var duration  = endx - startx; //Difference between times in minutes
    
    weekHeader(length, startDate);
    
    for (var i = 0; i <= (duration / 30) - 1; i++) { //Break into 30 minute boxes
        var hr = Math.floor((i / 2) + parseInt(startTime[0]));
        var isAM = true;
        if (hr > 12) { //If it passes 12 then reset (AM/PM)
            hr = hr - 12;
            isAM = false;
        }
        if (hr < 10) { //If it is not a 2 digit then add a 0
            hr = "0" + hr; 
        }
        var min = (i % 2 == 0) ? ":00" : ":30"; //Alternate 30 minutes        
        var $tr = $('<tr>');
        $tr.append($('<td>').addClass('tblTime').html(hr + min));

        for (var w = 0; w <= length; w++) {
            var timeData = {
                time: hr + min,
                day: weekDay(startDate.getDay() + w),
                startDate: startDate.getFullYear() + '/' + (startDate.getMonth()  + 1) + '/' + (startDate.getDate() + w) 
            };
            var $td = $('<td>').addClass('tableData').data("timeData", timeData);
            $tr.append($td);
        }
        $('#dataTable').append($tr);
    }
}*/

/**
 * Generate the top header for the week. This is where
 * the names of the days of the week is stored with a 3-letter
 * String.
 * 
 * @param  {INT} length    How many days were selected
 * @param  {Date} startDate The starting date chosen by user in event_create
 */
/*function weekHeader(length, startDate) {
    //console.log(length);
    var $trHead = $('<tr>');
    $trHead.append('<th>');
    for (var i = 0; i <= length; i++) { //Loop for number of days
        var day;
        var currDay = i;
        if (i + startDate.getDay() > 6) { //If the day is > 6 loop back to week start
            currDay = i - 7;
        }
        day = weekDay(currDay + startDate.getDay());
        var $th = $('<th>').html(day.toUpperCase());
        $trHead.append($th);
    }
    $('#dataTable').append($trHead);
}*/

/**
 * Get the 3-letter weekday value based on an integer
 * @param  {int} w what day of the week you are looking at based on Date Object .getDay()
 * @return {String}   3-letter String of the weekday
 */
/*function weekDay(w) {
    if (w > 6) {
        w = w - 6;
    }
    var day;
    switch (w) {
        case 0:
            day = 'sun';
            break;
        case 1:
            day = 'mon';
            break;
        case 2:
            day = 'tue';
            break;
        case 3:
            day = 'wed';
            break;
        case 4:
            day = 'thu';
            break;
        case 5:
            day = 'fri';
            break;
        case 6:
            day = 'sat';
            break;
    }
    return day;
}*/

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
    console.log($(this).data("timeData"));

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