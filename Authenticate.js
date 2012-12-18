var authResponse;
function authenticateByPassword(username, password){
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
}
function authenticateByClient(){
	alert("Hooray");
}