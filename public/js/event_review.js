"use strict";
(function() {

var eventData;

$(document).ready(function() {
    
    $.ajax({ //Initial getting of event data in database
        type: "POST",
        url: '/review_info',
        data: {e:getParameterByName('e')}
    }).success(function(data){
        //console.log("response data: ", data[0]);
        eventData = data;
        createTimes();
        matchTimes();
    });

    $('.timeOption').click(function() {
        if ($(this).hasClass('light-bg')) {
            $(this).toggleClass('light-bg');
        } else {
            $('.timeOption').removeClass('light-bg');
            $(this).toggleClass('light-bg');
        }
        
    })

});

function matchTimes() {

}

function createTimes() {
    console.log(eventData);
    var startDate = new Date(eventData[0].EventStartDate);
    var endDate   = new Date(eventData[0].EventEndDate);
    var length    = endDate.getDate() - startDate.getDate();
    if (length < 0) {
        length = length * -1;
    }
    var startTime = eventData[0].EventStartTime.split(":"); //EventStartTime stored [hh, mm, ss]
    var endTime   = eventData[0].EventEndTime.split(":"); //EventEndTime stored [hh, mm, ss]
    var startx    = parseInt(startTime[0]) * 60 + parseInt(startTime[1]); //Start time in minutes
    var endx      = parseInt(endTime[0]) * 60 + parseInt(endTime[1]); //End time in minutes
    var duration  = endx - startx; //Difference between times in minutes
    
    weekHeader(length, startDate);
    
    for (var i = 1; i <= (duration / 30) + 1; i++) { //Break into 30 minute boxes
        var hr = Math.floor((i / 2) + parseInt(startTime[0]));
        if (hr > 12) {
            hr = hr - 12;
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
}

/**
 * Generate the top header for the week. This is where
 * the names of the days of the week is stored with a 3-letter
 * String.
 * 
 * @param  {INT} length    How many days were selected
 * @param  {Date} startDate The starting date chosen by user in event_create
 */
function weekHeader(length, startDate) {
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
}

/**
 * Get the 3-letter weekday value based on an integer
 * @param  {int} w what day of the week you are looking at based on Date Object .getDay()
 * @return {String}   3-letter String of the weekday
 */
function weekDay(w) {
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
}

})();