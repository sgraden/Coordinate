"use strict";

//http://capcoordinate.herokuapp.com/event_review?e=0cd9216b-a183-417b-f149-b561b80f6258

var maxMeeting = 0; //Maximum number of people available at one time

$(document).ready(function() {
	//ejs.render(str);

	//Login/signup buttons to show modal
	$('.login-button').click(function() {
		$('#modal-login').modal('show');	
	});
	$('.signup-button').click(function() {
		$('#modal-signup').modal('show');
	});

	//login/signup form submission buttons
	$('#login-submit').click(accountLogin);
	$('#signup-submit').click(accountSignup);

	//Logout button in nav bar
	$('#logout-button').click(accountLogout);

	$('.modal-cancel').click(function() {
		$('#user-login')[0].reset();
		$('#user-signup')[0].reset();
	});



});

function accountLogin() {
	var email = $('#modal-login input[name=user-email]').val();
	var pass = $('#modal-login input[name=user-pass]').val();

	var payload = {
		email: email.hashCode(),
		pass: pass.hashCode()
	};

	$.post(
		'/user_login',
		payload
	).success(function(data) { //Reload page with stored info
		$.cookie('l', 'true', {expires: 7, path: '/'});
		window.location.href = '/';
	});
}

function accountSignup() {
	var fname= $('#modal-signup input[name=user-fname]').val();
	var lname= $('#modal-signup input[name=user-lname]').val();
	var email = $('#modal-signup input[name=user-email]').val();
	var pass1 = $('#modal-signup input[name=user-pass1]').val();
	var pass2 = $('#modal-signup input[name=user-pass2]').val();

	var infoPassed = true;

	if (pass1 != pass2) { //Do passwords match?
		infoPassed = false;
	} 
	//Is email valid?
	//character lengths/values?

	if (infoPassed) { //If info is good then send to server
		var payload = {
			userfname: fname,
			userlname: lname,
			useremail: email.hashCode(),
			pvalue: pass1.hashCode()
		};

		$.post(
			'/user_signup',
			payload
		).success(function(data) {
			//$('#username').html(data);
			$.cookie('l', 'true', {expires: 7, path: '/'});
			window.location.href = '/';
			//$('#modal-signup').modal('hide');

		});
	} else {
		//Send some sort of alert
	}
}

function accountLogout() {
	$.post(
		'/user_logout'
	).success(function(data) {
		console.log(data);
		if (data == 's') {
			$.removeCookie('l');
			location.replace('/');
		}
	});
}

//Generate Hashcode
//Use "hello".hashCode();
String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

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

function checkLogin() {
	var cookie = $.cookie('l');
	console.log(cookie);
	return cookie != null;
}


function createTimes(eventData, dateTimeMap, maxUsers) {
	console.log("general eventData", eventData);

	var fullDate; //Used to store string of the full date from the server date
	var splitDate; //Used to store array of YEAR/MONTH/DAY
    //Start Date - Strip the server date time of any info and create date object purely based on the days
	fullDate = eventData[0].EventStartDate.split('T')[0];
	splitDate = fullDate.split('-'); //0=xxxx, 1=month, 2=day
    var startDate = new Date(splitDate[0], parseInt(splitDate[1]) - 1, splitDate[2]); //Month is base 0
    //End Date - Strip the server date time of any info and create date object purely based on the days
    fullDate = eventData[0].EventEndDate.split('T')[0];
    splitDate = fullDate.split('-'); //0=xxxx, 1=month, 2=day
    var endDate   = new Date(splitDate[0], parseInt(splitDate[1]) - 1, splitDate[2]);

    console.log('eventstartdate', startDate);

    var length    = endDate.getDate() - startDate.getDate();
    if (length < 0) {
        length = length * -1;
    }
    var startTime = eventData[0].EventStartTime.split(":"); //EventStartTime stored [hh, mm, ss]
    var endTime   = eventData[0].EventEndTime.split(":"); //EventEndTime stored [hh, mm, ss]
    var startMin  = parseInt(startTime[0]) * 60 + parseInt(startTime[1]); //Start time in minutes
    var endMin    = parseInt(endTime[0]) * 60 + parseInt(endTime[1]); //End time in minutes
    var duration  = endMin - startMin; //Difference between times in minutes

    weekHeader(length, startDate); //Sets the days of the week

    for (var i = 1; i < (duration / 30); i++) { //Break into 30 minute boxes
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

        for (var w = 0; w <= length; w++) {
        	console.log('eventstartdate date', startDate.getDate() + w);

            var timeData = {
                startTime: hr + min,
                day: weekDay(startDate.getDay() + w),
                startDate: startDate.getFullYear() + '-' + (startDate.getMonth()  + 1) + '-' + (startDate.getDate() + w) //eventData[0].StartDate.split('T')[0]
            };
            console.log(timeData);
            //Create a table data object and check if it should be marked with names
            var $td = $('<td>').addClass('tableData').data("timeData", timeData);
            var currMeeting = 0; //Used for finding opacity vs max
            if (dateTimeMap) {
	            if (dateTimeMap.has(timeData.startDate)) { //If the date is used
	                var timeNameMap = dateTimeMap.get(timeData.startDate);
	                if (timeNameMap.has(timeData.startTime)) { //If a time is used
	                    var namesArr = timeNameMap.get(timeData.startTime);
	                    
	                    $td.data('names', timeNameMap.get(timeData.startTime));
	                    $td.on('mouseover', { //On mouse over
	                        namesArr: namesArr,
	                        maxUsers: maxUsers
	                    }, timeShowNames);
	                    $td.on('mouseout', timeHideNames); //On mouse out
	                    
	                    currMeeting = namesArr.length;
	                    /*if (maxMeeting < currMeeting) {
	                        maxMeeting = currMeeting;
	                    }*/
	                    if (currMeeting == maxUsers) {
	                    	$td.addClass('orange-bg');
	                    } else {
	                    	$td.addClass('dark-bg'); //Add the color class to the TD element
	                    }
	                }
	            }
	            $td.css('opacity', currMeeting / maxUsers);
	        }
            $tr.append($td);
        }
        $('#dataTable').append($tr);
    }
    //return maxMeeting;
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
    	var startDay = startDate.getDay();
        var day;
        var currDay = i; //current day in the week.
        if (i + startDay > 6) { //If the day is > 6 loop back to week start
            currDay = i - 7;
        }
        day = weekDay(currDay + startDay); //The three letter day
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
}

function timeShowNames(event) { //Currently not showing multiple names
    var elem = event.toElement;
    var namesArr = event.data.namesArr;
    var maxUsers = event.data.maxUsers;

    $(elem).addClass('time-hover');
    var elemPos = $(elem).position();
    var $div = $('<div>');
    $div.addClass('time-names-hover light-bg');//.css('display', 'none');
    $div.css('top', elemPos.top + $(elem).height() - 10+ 'px'); //Bottom of element
    $div.css('left', elemPos.left + $(elem).width() - 20 + 'px'); //Right of element

    $div.append('<div id="time-names-total">Available: ' + namesArr.length + '/' + maxUsers + '</div>');
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
}
