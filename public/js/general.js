"use strict";
(function() {
	$(document).ready(function() {
		$('#login-button').click(function() {
			$('#modal-login').modal('show');	
		});
		$('#signup-button').click(function() {
			$('#modal-signup').modal('show');
		});

		$('#login-submit').click(accountLogin);
		$('#signup-submit').click(accountSignup);
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
		).success(function(data) {
			$('#username').html(data);
			//new EJS({url: 'partials/head.ejs'}).update('username_holder');
			$('#modal-login').modal('hide');
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
				fname: fname,
				lname: lname,
				email: email.hashCode(),
				pass: pass.hashCode()
			};

			$.post(
				'/user_signup',
				payload
			).success(function(data) {
				$('#username').html(data);
				$('#modal-signup').modal('hide');
			});
		} else {
			//Send some sort of alert
		}
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

