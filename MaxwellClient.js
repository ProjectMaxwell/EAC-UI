function MaxwellClient(serviceUrl){
	this.serviceUrl = serviceUrl;
}

MaxwellClient.prototype.post = function(path, postObject, successCallback, failureCallback){
	var jsonString = JSON.stringify(postObject);
	var uri = this.serviceUrl + path;
	jQuery.ajax({
		type: "POST",
		data: jsonString,
		url: uri,
		dataType: "json",
		contentType: "application/json"
	}).done(function(data,status,responseHandler){
		successCallback(data,responseHandler);
	}).fail(function(responseHandler,status,data){
			failureCallback(data,responseHandler);
	});
};

/**
 * This is the genericized "GET" method.  To use it, define other methods that call this one and pass in success and failure handlers.
 * This is important because it provides the UI a layer of abstraction away from the messy HTTP stuff,
 * thus allowing for better separation of model, view, and controller.
 * @param path
 * @param successCallback
 * @param failureCallback
 */
MaxwellClient.prototype.get = function(path, successCallback,failureCallback){
	var uri = this.serviceUrl + path;
	
	$.getJSON(uri).done(function(data,status,responseHandler){
			successCallback(data, responseHandler);
	}).fail(function(responseHandler,status,data){
			failureCallback(data,responseHandler);
	});
};

MaxwellClient.prototype.getUsersByType = function(type,successCallback){
	var path = "/users";
	if(type != null){
		path += "?userType=" + type;
	}
	
	this.get(path, function(responseObject, responseHandler){
		successCallback(responseObject);
	}, function(responseObject, responseHandler){
		console.log(responseHandler.responseText);
		alert("Could not retrieve list of users. " + responseHandler.responseText);
	});
};

MaxwellClient.prototype.getAssociateClasses = function(successCallback){
	var path = "/associateClasses";
	
	this.get(path, function(responseObject, responseHandler){
		successCallback(responseObject);
	}, function(responseObject, responseHandler){
		console.log(responseHandler.responseText);
		alert("Could not retrieve list of associate class mappings. " + responseHandler.responseText);
	});
};

MaxwellClient.prototype.getChapters = function(successCallback){
	var path = "/chapters";
	
	this.get(path, function(responseObject, responseHandler){
		successCallback(responseObject);
	}, function(responseObject, responseHandler){
		console.log(responseHandler.responseText);
		alert("Could not retrieve list of chapters. " + responseHandler.responseText);
	});
};

MaxwellClient.prototype.getUserTypes = function(successCallback){
	var path = "/users/userTypes";
	
	this.get(path, function(responseObject, responseHandler){
		successCallback(responseObject);
	}, function(responseObject, responseHandler){
		console.log(responseHandler.responseText);
		alert("Could not retrieve list of chapters. " + responseHandler.responseText);
	});
};

MaxwellClient.prototype.createEACMeeting = function(EACMeetingObject, successCallback){
	var path = "/EAC/meet-ups";
	
	this.post(path,EACMeetingObject,function(responseObject,responseHandler){
		successCallback(responseObject);
	},function(responseObject,responseHandler){
		console.log(responseHandler.responseText);
		alert("Could not create EAC meeting. " + responseHandler.responseText);
	});
};