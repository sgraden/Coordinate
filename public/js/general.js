"use strict";
(function() {
	$(document).ready(function() {
		//ejs.render(str);

		$('#login-button').click(function() {
			$('#modal-login').modal('show');	
		});
		$('#signup-button').click(function() {
			$('#modal-signup').modal('show');
		});

		$('#login-submit').click(accountLogin);
		$('#signup-submit').click(accountSignup);

		$('#logout-button').click(accountLogout);
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
			//$('#username').html(data);
			//console.log(data[0].userfname);
			//$('#username-holder').html(data[0].userfname);
			//$('#modal-login').modal('hide');
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

})();

