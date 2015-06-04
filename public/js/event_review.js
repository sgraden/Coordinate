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
        //console.log(getParameterByName('e'));
        eventData = data;
        console.log('event data', eventData);
        createDateTimeMap();
        createTimes(eventData, dateTimeMap, maxUsers);
        bestTimes();
        $('.timeOption').click(function() {
            if ($(this).hasClass('light-bg')) {
                $(this).toggleClass('light-bg');
            } else {
                $('.timeOption').removeClass('light-bg');
                $(this).toggleClass('light-bg');
            }
        });
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

    $('#schedule-event').on('click', function() {
        alert('Event Scheduled. Participants will be notified');
        var info = $('div.time-option.light-bg').data('schedule-info');
        console.log(info);
        $('#event-set-date > b').html(info.day + " " + info.startDate + " starting at " + info.startTime);
    });

    $('#share-send').on('click', shareEvent);

});

/**
 * Loop through returned time data. Create a map of time to array of names.
 * @return {[type]} [description]
 */
function createDateTimeMap () {
    dateTimeMap = new Map(); //Key = start date Value = timeNameMap
    $.each(eventData, function(index, value) {
        var fullDate = value.StartDate.split('T')[0];
        var splitDate = fullDate.split('-'); //0=xxxx, 1=month, 2=day
        var dateObj = new Date(splitDate[0], parseInt(splitDate[1]) - 1, splitDate[2]); //Month is base 0

        //var dateObj = new Date(value.StartDate);
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
}

function shareEvent () {
    var emailsList = [];
    var inputs = $('input[name=share-email]');
    for(var i = 0; i < inputs.length; i++) {
        var email = $(inputs[i]).val();
        if (validateEmail(email)) {
            emailsList.push(email);
        }
    }

    $.ajax({ //Initial getting of event data in database
        type: "POST",
        url: '/share_event',
        data: {
            emails: emailsList,
            eventID: eventData[0].EventID
        }
    }).success(function (data){
        if (data.status == 200) {
            $('#modal-share').modal('hide');
            alert(data.responseText);
        }
    }).fail(function (data) {
        if (data.status == 500) {
            alert(data.responseText);
        }
    });
    //console.log(emailsList);
}


/*
<div class="col-xs-6 col-xs-offset-3 timeOption">
    <div class="col-xs-2">Tue 17</div>
    <div class="col-xs-10">
        <div class="col-xs-12">9:00AM TO 10:00AM</div>
        <div class="col-xs-12">All Participants Available</div>
    </div>
</div>
 */
function bestTimes() {
    var tableElements = $('td.tableData.orange-bg');
    //console.log(tableElements);
    var $bigContainer = $('#offered-times-container');
    for (var i = 0; i < 3; i++) {
        var elementInfo = $(tableElements[i]).data('info');
        var $timeOption  = $('<div>').addClass("col-xs-6 col-xs-offset-3 timeOption"); //The outer wrapper
        var $date        = $('<div>').addClass('col-xs-2'); //The top date element
        var $timeWrapper = $('<div>').addClass('col-xs-10'); //The inner wrapper for the times
        var $time        = $('<div>').addClass('col-xs-12'); //The time
        var $available   = $('<div>').addClass('col-xs-12'); //The number of people available

        $available.html("Available people: " + elementInfo.namesArr.length +"/"+ elementInfo.maxUsers);
        $time.html("Starting at " + elementInfo.startTime);
        $date.html(elementInfo.day + " " + elementInfo.startDate);

        $timeWrapper.append($time);
        $timeWrapper.append($available);
        $timeOption.append($date);
        $timeOption.append($timeWrapper);
        $($timeOption).data('schedule-info', elementInfo);
        //console.log($timeOption);

        $bigContainer.append($timeOption);
    }
}

function findMostAvailable(elementList) {

}

})();