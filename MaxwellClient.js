var maxwellClient = {
	init: function(serviceUrl){
		this.serviceUrl = serviceUrl;
	},
	post: function(path, postObject, successCallback, failureObject){
		var jsonString = JSON.stringify(postObject);
		var uri = this.serviceUrl + path;
		jQuery.ajax({
			type: "POST",
			data: jsonString,
			url: uri,
			dataType: "json",
			contentType: "application/json"
		}).done(function(data, status, responseHandler){
			successCallback(data, responseHandler);
		}).fail(function(responseHandler, status, data){
			if(failureObject && typeof failureObject['failureCallback'] == "function"){
				failureCallback(data, responseHandler);
			}else{
				//If null or if it's not a function, do some default failure behavior
				failureCallback(responseHandler.responseText);
			}
			console.log(failureString + ' ' + responseHandler.responseText);
/*			if(failureObject){
				if(typeof failureObject['failureCallback'] == "function"){
					failureObject['failureCallback'];
				}
				if(typeof failureObject['failureString'] == "string"){
					alert(failureString);
					console.log(failureString + ' ' + responseHandler.responseText);
				}
			}*/
			//failureCallback(data, responseHandler);
		});
	},
	get: function(path, successCallback, failureObject){		
		$.getJSON(this.serviceUrl + path).done(function(data,status,responseHandler){
				successCallback(data, responseHandler);
		}).fail(function(responseHandler, status, data){
				if(failureObject){
					if(typeof failureObject['failureCallback'] == "function"){
						failureObject['failureCallback'];
					}
					if(typeof failureObject['failureString'] == "string"){
						alert(failureString);
						console.log(failureString + ' ' + responseHandler.responseText);
					}
				}
		});
	},
	getUsersByType: function(type,successCallback){
		var path = "/users";
		if(type){
			path += "?userType=" + type;
		}
		this.get(path, successCallback, {'failureString': 'Could not retrieve list of users.'});
		
		/*this.get(path, function(responseObject, responseHandler){
			successCallback(responseObject);
		}, function(responseObject, responseHandler){
			console.log(responseHandler.responseText);
			alert("Could not retrieve list of users. " + responseHandler.responseText);
		});*/
	},
	getAssociateClasses: function(successCallback){
		var path = "/associateClasses";
		
		this.get(path, successCallback, {'failureString': 'Could not retrieve list of associate class mappings.'});
		/*this.get(path, function(responseObject, responseHandler){
			successCallback(responseObject);
		}, function(responseObject, responseHandler){
			console.log(responseHandler.responseText);
			alert("Could not retrieve list of associate class mappings. " + responseHandler.responseText);
		});*/
	},
	getChapters: function(successCallback){
		var path = "/chapters";
		
		this.get(path, successCallback, {'failureString': 'Could not retrievelist of chapters.'});
		/*this.get(path, function(responseObject, responseHandler){
			successCallback(responseObject);
		}, function(responseObject, responseHandler){
			console.log(responseHandler.responseText);
			alert("Could not retrieve list of chapters. " + responseHandler.responseText);
		});*/
	},
	getUserTypes: function(successCallback){
		var path = "/users/userTypes";
		
		this.get(path, successCallback, {'failureString': 'Could not retrieve list of chapters.'});
		/*this.get(path, function(responseObject, responseHandler){
			successCallback(responseObject);
		}, function(responseObject, responseHandler){
			console.log(responseHandler.responseText);
			alert("Could not retrieve list of chapters. " + responseHandler.responseText);
		});*/
	},
	createEACMeeting: function(EACMeetingObject, successCallback){
		var path = "/EAC/meet-ups";
		
		this.post(path, EACMeetingObject, successCallback,this.defaultFailureBehavior('Could not create EAC Meeting'));
		//this.get(path, successCallback, {'failureString': 'Could not create EAC meeting.'});
		/*this.post(path,EACMeetingObject,function(responseObject,responseHandler){
			successCallback(responseObject);
		},function(responseObject,responseHandler){
			console.log(responseHandler.responseText);
			alert("Could not create EAC meeting. " + responseHandler.responseText);
		});*/
	},
	defaultFailureBehavior: function(failureString){
		alert(failureString);
	}

};
/*function MaxwellClient(serviceUrl){
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
};*/

/**
 * This is the genericized "GET" method.  To use it, define other methods that call this one and pass in success and failure handlers.
 * This is important because it provides the UI a layer of abstraction away from the messy HTTP stuff,
 * thus allowing for better separation of model, view, and controller.
 * @param path
 * @param successCallback
 * @param failureCallback
 */
 /*
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
};*/