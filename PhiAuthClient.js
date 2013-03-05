var phiAuthClient = {
	init: function(hostname){
		phiAuthClient.hostname = hostname;
	},
	requestToken: function(tokenRequestObject){
		var tokenRequestString = JSON.stringify(tokenRequestObject);
		jQuery.ajax({
			type: "POST",
			data: tokenRequestString,
			url: phiAuthClient.hostname + "/PhiAuth/rest/token",
			dataType: "JSON",
			contentType: "application/json"
		}).done(function(data,status,responseHandler){
			phiAuthClient.tokenResponse = data;
		}).fail(function(data,status,responseHandler){
			phiAuthClient.errorResponse = data;
		});
	},
	authenticateByPassword: function(username, password){
		if(username && password){
			var tokenRequestObject = {
					"grantType": "PASSWORD",
					"username": username,
					"password": password,
					"clientId": "MAXWELL_WEB_CLIENT"
				};
			phiAuthClient.requestToken(tokenRequestObject);
		}else{
			if(!username){
				console.log("Cannot authenticate due to missing username.");
			}else if(!password){
				console.log("Cannot authenticate due to missing password.");
			}
		}
	},
	authenticateByUWNetID: function(UWNETIDToken){
		if(UWNETIDToken){
			var tokenRequestObject = {
				"grantType": "ASSERTION",
				"assertionType": "UWNETID",
				"clientId": "MAXWELL_WEB_CLIENT",
				"assertion":{
	      			"assertionValue": UWNETIDToken
	  			}
			};
			phiAuthClient.requestToken(tokenRequestObject);
		}else{
			console.log("This method requires a valid login session from UW services");
		}
	},
	refreshToken: function(refreshToken){
		if(refreshToken){
			var tokenRequestObject = {
				"grantType": "REFRESH",
				"refreshToken": refreshToken
				};
			phiAuthClient.requestToken(tokenRequestObject);
		}else{
			console.log("The refresh grant requires a valid refresh token.");
		}
	}
};