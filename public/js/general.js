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

    $('#username-holder').on('mouseover', function () {
        $('#dropdown-container').show();
    });
    $('#username-holder').on('mouseout', function () {
        //$('#dropdown-container').hide();
    });
	// $('#username-holder').click(function() {
	// 	window.location.href = "/view_events";
	// });



});

function accountLogin() {
    clearErr();
	var email = $('#modal-login input[name=user-email]').val();
	var pass = $('#modal-login input[name=user-pass]').val();

	var payload = {
		email: email,
		pass: pass.hashCode()
	};

	$.ajax({
        type: "POST",
		url: '/user_login',
		data: payload
	}).success(function(data) { //Reload page with stored info
		$.cookie('l', 'true', {expires: 7, path: '/'});
        replaceNavLogin(data[0].username);
		//window.location.href = '/'; //Will need to be changed if logging into other pages
	}).error(function (data) {
        if (data.status == 404) {
            addError('#modal-login input[name=user-email]', data.responseText);
        }
    });
}

function accountSignup() {
    clearErr();
	var fname= $('#modal-signup input[name=user-fname]').val();
	var lname= $('#modal-signup input[name=user-lname]').val();
	var email = $('#modal-signup input[name=user-email]').val();
	var pass1 = $('#modal-signup input[name=user-pass1]').val();
	var pass2 = $('#modal-signup input[name=user-pass2]').val();

	var infoPassed = "";
	if (pass1 != pass2) { //Do passwords match?
		infoPassed = "pass";
	}
    if (!validateEmail(email)) { //If email is not valid
        infoPassed = "email";
    }
	if (infoPassed == "") { //If info is good then send to server
		var payload = {
			userfname: fname,
			userlname: lname,
			useremail: email,
			pvalue: pass1.hashCode()
		};

		$.ajax({
            type: "POST",
			url: '/user_signup',
			data: payload
		}).success(function (data) {
			$.cookie('l', 'true', {expires: 7, path: '/'});
            replaceNavLogin(data[0].username);
		}).error (function (data) {
            console.log(data);
            if (data.status == 418) {
                addError("#modal-signup input[name=user-email]", data.responseText);
            }
        });
	} else {
		//Send some sort of alert
        if (infoPassed == "pass") {
            addError("#modal-signup input[name=user-pass1], #modal-signup input[name=user-pass2]", "Passwords do not match");
        } else if (infoPassed == "email") {
            addError("#modal-signup input[name=user-email]", "Email is not valid");
        }
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

function validateEmail(email) {
    var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    return re.test(email);
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

    //console.log('eventstartdate', startDate);

    var length    = endDate.getDate() - startDate.getDate();
    if (length < 0) {
        length = length * -1;
    }
    var startTime = eventData[0].EventStartTime.split(":"); //EventStartTime stored [hh, mm, ss]
    var endTime   = eventData[0].EventEndTime.split(":"); //EventEndTime stored [hh, mm, ss]
    var startMin  = parseInt(startTime[0]) * 60 + parseInt(startTime[1]); //Start time in minutes
    var endMin    = parseInt(endTime[0]) * 60 + parseInt(endTime[1]); //End time in minutes
    var duration  = endMin - startMin; //Difference between times in minutes
    //console.log(endMin - startMin);
    weekHeader(length, startDate); //Sets the days of the week

    var halfAdjustment = 0;
    if (parseInt(startTime[1]) == 30) { //
    	halfAdjustment = 1;
    }
    for (var i = 0 + halfAdjustment; i < (duration / 30) + halfAdjustment; i++) { //Break into 30 minute boxes
    	//console.log(i);
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
            var timeData = {
                startTime: hr + min,
                day: weekDay(startDate.getDay() + w),
                startDate: startDate.getFullYear() + '-' + (startDate.getMonth()  + 1) + '-' + (startDate.getDate() + w) //eventData[0].StartDate.split('T')[0]
            };

            //Create a table data object and check if it should be marked with names
            var $td = $('<td>').addClass('tableData').data("timeData", timeData);
            var currMeeting = 0; //Used for finding opacity vs max
            if (dateTimeMap) {
	            if (dateTimeMap.has(timeData.startDate)) { //If the date is used
	                var timeNameMap = dateTimeMap.get(timeData.startDate);
	                if (timeNameMap.has(timeData.startTime)) { //If a time is used
	                    var namesArr = timeNameMap.get(timeData.startTime);
	                    
	                    $td.data('names', timeNameMap.get(timeData.startTime));
                        $td.data("info", {
                            startTime: timeData.startTime,
                            day: timeData.day,
                            startDate: startDate.getDate() + w,
                            namesArr: namesArr,
                            maxUsers: maxUsers
                        });
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
    var days = ['Sun', 'Mon', 'Tues', 'Wed', 'Thurs', 'Fri', 'Sat'];
    return days[w];
}

function timeShowNames(event) {
    var elem = event.toElement;
    var namesArr = event.data.namesArr;
    var maxUsers = event.data.maxUsers;
    console.log(event.data);

    $(elem).addClass('time-hover');
    var elemPos = $(elem).position(); //Position of the element being hovered over
    var $div = $('<div>'); //The box that appears on hover
    $div.addClass('time-names-hover light-bg');//.css('display', 'none');
    $div.css('top', elemPos.top + $(elem).height() - 10 + 'px'); //Bottom of element
    $div.css('left', elemPos.left + $(elem).width() - 20 + 'px'); //Right of element

    $div.append('<div id="time-names-total">Available: ' + namesArr.length + '/' + maxUsers + '</div>'); //The current out of total number of participants
    for (var i = 0; i < namesArr.length; i++) {
        var $nameDiv = $('<div>').addClass('names-row');
        $nameDiv.text(namesArr[i]);
        $div.append($nameDiv);
    }

    $('#dataTable').append($div);
    //$($div).show("fast");
}

function timeHideNames (event) {
    $('.time-names-hover').remove();
    $(event.toElement).removeClass('time-hover');
}

function addError (element, message) {
    $(element).addClass('error-highlight');
    if (message) {
        $(element).before("<span class='error-text'>" + message + "</span>");
    }
}

function clearErr () {
    $('.error-text').remove();
    $('.error-highlight').removeClass('error-highlight');
}

function replaceNavLogin (username) {
    $('.login-button, .signup-button').remove();
    $('#navbar-collapse > .nav').append('<li><a id="username-holder" href="#">'+ username +'</a></li><div id="dropdown-container" class="light-bg"><ul><li><a href="/view_events">View events</a></li><li id="logout-button">Logout</li></ul></div>');

    $('#username-holder').on('mouseover', function () {
        $('#dropdown-container').show();
    });
    $('#username-holder').on('mouseout', function () {
        //$('#dropdown-container').hide();
    });
    $('#logout-button').click(accountLogout);

    $('#modal-signup, #modal-login').modal('hide');

}

function checkLogin() {
    var cookie = $.cookie('l');
    return cookie != null;
}
