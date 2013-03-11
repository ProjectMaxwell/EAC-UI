var phiAuthClient = {
	init: function(hostname){
		phiAuthClient.hostname = hostname;
	},
	requestToken: function(tokenRequestObject, successCallback, failureCallback){
		var tokenRequestString = JSON.stringify(tokenRequestObject);
		jQuery.ajax({
			type: "POST",
			data: tokenRequestString,
			url: phiAuthClient.hostname + "/PhiAuth/rest/token",
			dataType: "JSON",
			contentType: "application/json"
		}).done(function(data,status,responseHandler){
			phiAuthClient.tokenResponse = data;
			phiAuthClient.lastResponse = responseHandler;
			phiAuthClient.success = true;
			if(typeof successCallback == "function"){
				successCallback(data, status, responseHandler);
			}else{
				console.log("Token request succeeded, but no success function was provided.");
			}
		}).fail(function(responseHandler,status,errorThrown){
			var data = jQuery.parseJSON(responseHandler.responseText);
			phiAuthClient.errorResponse = data;
			phiAuthClient.lastResponse = responseHandler;
			phiAuthClient.success = false;
			if(typeof failureCallback == "function"){
				failureCallback(data,errorThrown,responseHandler);
			}else{
				console.log("Token request failed, and no failure function was provided.");
			}
		});
	},
	authenticateByPassword: function(username, password, successCallback, failureCallback){
		if(username && password){
			var tokenRequestObject = {
					"grantType": "PASSWORD",
					"username": username,
					"password": password,
					"clientId": "MAXWELL_WEB_CLIENT"
				};
			phiAuthClient.requestToken(tokenRequestObject, successCallback, failureCallback);
		}else{
			if(!username){
				console.log("Cannot authenticate due to missing username.");
			}else if(!password){
				console.log("Cannot authenticate due to missing password.");
			}
		}
	},
	authenticateByUWNetID: function(UWNETIDToken, successCallback, failureCallback){
		if(UWNETIDToken){
			var tokenRequestObject = {
				"grantType": "ASSERTION",
				"assertionType": "UWNETID",
				"clientId": "MAXWELL_WEB_CLIENT",
				"assertion":{
	      			"assertionValue": UWNETIDToken
	  			}
			};
			phiAuthClient.requestToken(tokenRequestObject, successCallback, failureCallback);
		}else{
			console.log("This method requires a valid login session from UW services");
		}
	},
	refreshToken: function(refreshToken, successCallback, failureCallback){
		if(refreshToken){
			var tokenRequestObject = {
				"grantType": "REFRESH",
				"clientId":"MAXWELL_WEB_CLIENT",
				"refreshToken": refreshToken
				};
			phiAuthClient.requestToken(tokenRequestObject, successCallback, failureCallback);
		}else{
			console.log("The refresh grant requires a valid refresh token.");
		}
	}
};