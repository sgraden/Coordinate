"use strict";

(function() {
var eventData; //Array of time objects from Database
var dateTimeMap; //Key = start date Value = timeNameMap
var maxUsers = 0;

$(document).ready(function() {
    
    $.ajax({ //Initial getting of event data in database
        type: "POST",
        url: '/review_info',
        data: {e:getParameterByName('e')}
    }).success(function(data){
        eventData = data;
        console.log('event data', eventData);
        createDateTimeMap();
        createTimes(eventData, dateTimeMap, maxUsers);
    });

    $('#share-cancel').on('click', function() {
        $('.share-email').remove();
        $('#share-add-btn').click();
    });
    $('#share-url').val(window.location.href);
    $('#share-add-btn').on('click', function() {
        var $emailForm = $('<div class="share-email"><input class="form-control" type="email" name="share-email" placeholder="email" required="" title=""></div>');
        $emailForm.insertBefore('#share-add-holder');
    });

    $('#send-invite').on('click', function() {
        $('#modal-share').modal('show', function() {
            $('#share-url').focus();
            $('#share-url').select();
        });

    });

    $('.timeOption').click(function() {
        if ($(this).hasClass('light-bg')) {
            $(this).toggleClass('light-bg');
        } else {
            $('.timeOption').removeClass('light-bg');
            $(this).toggleClass('light-bg');
        }
    });

});

/**
 * Loop through returned time data. Create a map of time to array of names.
 * @return {[type]} [description]
 */
function createDateTimeMap () {
    dateTimeMap = new Map(); //Key = start date Value = timeNameMap
    $.each(eventData, function(index, value) {
        var dateObj = new Date(value.StartDate);
        var date = dateObj.getFullYear() + '-' + (dateObj.getMonth() + 1) + '-' + dateObj.getDate(); //Needs to match the createTime timeDate.startDate
        var rawTime = value.StartTime.split(':'); //split 02:00:00
        var time = rawTime[0] + ":" + rawTime[1]; //Convert to 11:00
        if (dateTimeMap.has(date)) { //If the date is already in
            var timeNameMap = dateTimeMap.get(date); //Map Key = time (hh:mm) Value = Array of names
            if (timeNameMap.has(time)) { //already contains time, add new name to list.
                if (time != undefined) { //Had an undefined variable. Skipping it
                    var arr = timeNameMap.get(time);
                    arr.push(value.UserFName + " " + value.UserLName);
                    timeNameMap.set(time, arr);
                }
            } else { //Time doesn't exist yet, create new list
                timeNameMap.set(time, [value.UserFName + " " + value.UserLName]);
            }
            dateTimeMap.set(date, timeNameMap); //Set the value at 'date' to the new map
        } else { //Add the date
            dateTimeMap.set(date, new Map().set(time, [value.UserFName + " " + value.UserLName]));
        }
        var currUsers = dateTimeMap.get(date).get(time).length;
        //console.log(currUsers);
        if (maxUsers < currUsers) {
            maxUsers = currUsers;
        }
    });
    //findMaxUsers();
}

function findMaxUsers () {
    /*var max = 0;
    $.each(dateTimeMap, function (index, dateVal) {
        $.each(dateVal.values(), function (index, timeVal) {

        });
    });
    return max;*/
}

/*function createTimes() {
    var EventStartDate = new Date(eventData[0].EventStartDate);
    var endDate   = new Date(eventData[0].EventEndDate);
    var length    = endDate.getDate() - EventStartDate.getDate();
    if (length < 0) {
        length = length * -1;
    }
    var startTime = eventData[0].EventStartTime.split(":"); //EventStartTime stored [hh, mm, ss]
    var endTime   = eventData[0].EventEndTime.split(":"); //EventEndTime stored [hh, mm, ss]
    var startx    = parseInt(startTime[0]) * 60 + parseInt(startTime[1]); //Start time in minutes
    var endx      = parseInt(endTime[0]) * 60 + parseInt(endTime[1]); //End time in minutes
    var duration  = endx - startx; //Difference between times in minutes
    
    weekHeader(length, EventStartDate); //Sets the days of the week
    
    for (var i = 0; i <= (duration / 30); i++) { //Break into 30 minute boxes
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
        //var AMorPM = (isAM) ? " AM" : " PM";       
        var $tr = $('<tr>');
        $tr.append($('<td>').addClass('tblTime').html(hr + min));

        for (var w = 0; w < length; w++) {
            var timeData = {
                startTime: hr + min,
                day: weekDay(EventStartDate.getDay() + w),
                startDate: EventStartDate.getFullYear() + '-' + (EventStartDate.getMonth()  + 1) + '-' + (EventStartDate.getDate() + w) //eventData[0].StartDate.split('T')[0]
            };

            //Create a table data object and check if it should be marked with names
            var $td = $('<td>').addClass('tableData').data("timeData", timeData);
            var currMeeting = 0; //Used for finding opacity vs max
            if (dateTimeMap.has(timeData.startDate)) { //If the date is used
                var timeNameMap = dateTimeMap.get(timeData.startDate);
                if (timeNameMap.has(timeData.startTime)) { //If a time is used
                    var namesArr = timeNameMap.get(timeData.startTime);
                    currMeeting = namesArr.length;
                    if (maxMeeting < namesArr.length) {
                        maxMeeting = namesArr.length;
                    }
                    $td.data('names', timeNameMap.get(timeData.startTime));
                    $td.addClass('dark-bg'); //Add the color class to the TD element
                    $td.on('mouseover', { //On mouse over
                        namesArr: namesArr
                    }, timeShowNames);
                    $td.on('mouseout', timeHideNames); //On mouse out
                }
            }
            $td.css('opacity', currMeeting / maxMeeting);
            $tr.append($td);
        }
        $('#dataTable').append($tr);
    }
}*/

/*function timeShowNames(event) { //Currently not showing multiple names
    var elem = event.toElement;
    var namesArr = event.data.namesArr;

    $(elem).addClass('time-hover');
    var elemPos = $(elem).position();
    var $div = $('<div>');
    $div.addClass('time-names-hover light-bg');//.css('display', 'none');
    $div.css('top', elemPos.top + $(elem).height() - 10+ 'px'); //Bottom of element
    $div.css('left', elemPos.left + $(elem).width() - 20 + 'px'); //Right of element

    $div.append('<div>Available: ' + namesArr.length + '/' + maxMeeting + '</div>');
    for (var i = 0; i < namesArr.length; i++) {
        var $nameDiv = $('<div>').addClass('names-row');
        $nameDiv.text(namesArr[i]);
        $div.append($nameDiv);
    }

    $('#dataTable').append($div);
    //$($div).show("fast");
}

function timeHideNames(event) {
    $('.time-names-hover').remove();
    $(event.toElement).removeClass('time-hover');
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
        w = 0;
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
})();