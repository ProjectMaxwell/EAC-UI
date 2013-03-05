var phiAuthClient = {
	init: function(hostname){
		phiAuthClient.hostname = hostname;
	},
	authenticateByPassword: function(username, password){
		var alertString = "";
		if(username && password){
			var allData = {
					"grantType": "PASSWORD",
					"username": username,
					"password": password,
					"clientId": "MAXWELL_WEB_CLIENT"
				};
			allData = JSON.stringify(allData);
			jQuery.ajax({
				type: "POST",
				data: allData,
				url: phiAuthClient.hostname + "/PhiAuth/rest/token",
				dataType: "JSON",
				contentType: "application/json"
			}).done(function(data,status,responseHandler){
				phiAuthClient.tokenResponse = data;
			}).fail(function(data,status,responseHandler){
				alertString = JSON.stringify(responseHandler.responseText);
			});
		}else{
			if(!username){
				alertString = "Enter a username. ";
			}
			if(!password){
				if(alertString != ""){
					alertString += " Also, you";
				}else{
					alertString = "You";
				}
				alertString += " are missing a password";
			}
			alert(alertString);
		}
	}
/*	function authenticateByClient(){
		alert("Hooray");
	}
	function authenticateByUWNetID(UWNETIDToken){
		var alertString = "";
		if(UWNETIDToken){
			var allData = {
				"grantType": "ASSERTION",
				"assertionType": "UWNETID",
				"clientId": "MAXWELL_WEB_CLIENT",
				"assertion":{
	      			"assertionValue": UWNETIDToken
	  			}
			};
			allData = JSON.stringify(allData);
			jQuery.ajax({
				type: "POST",
				data: allData,
				url: "http://evergreenalumniclub.com:7080/PhiAuth/rest/token",
				dataType: "JSON",
				contentType: "application/json",
				success: function(response){
					authResponse = response;
					alertString = response;
					return response;
				},
				error: function(){
					alertString = JSON.stringify(response.responseText);
				},
				complete: function(){
					alert(alertString);
				}
			})
		}else{
			alertString = "This method requires a valid login to UW services";
		}
		alert(alertString);
	}
	function authenticateByRefresh(refreshToken){
		var alertString = "";
		if(refreshToken){
			var allData = {
				"grantType": "REFRESH",
				"refreshToken": refreshToken
				};
			allData = JSON.stringify(allData);
			jQuery.ajax({
				type: "POST",
				data: allData,
				url: "http://evergreenalumniclub.com:7080/PhiAuth/rest/token",
				dataType: "JSON",
				contentType: "application/json",
				success: function(response){
					alertString = response;
					authResponse = response;
				},
				error: function(response){
					alertString = JSON.stringify(response.responseText);
				},
				complete: function(){
					alert(alertString);
				}
			})
		}else{
			alert("You have not yet logged in");
		}
	}*/
}