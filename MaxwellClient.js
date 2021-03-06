var maxwellClient = {
	/**
	 * 
	 * @param serviceUrl - the url to root rest url (i.e. https://evergreenalumniclub.com/ProjectMaxwell/rest)
	 * @param accessToken - the token retrieved from a PhiAuth authentication call
	 */
	init: function(serviceUrl, accessToken){
		this.serviceUrl = serviceUrl;
		this.accessToken = accessToken;
		this.setInitialSystemVariables();
	},
	/**
	 * Sets initial system variables to be used in various functions.
	 */
	setInitialSystemVariables: function(){
		this.usersEndpoint = "/users";
		this.userByIdEndpoint = "/users/%s";
		this.associateClassesEndpoint = "/associateClasses";
		this.chaptersEndpoint = "/chapters";
		this.userTypesEndpoint = "/users/userTypes";
		this.eacMeetingsEndpoint = "/EAC/meet-ups";
		this.recruitInfoEndpoint = "/recruits/%s/recruitInfo";
		this.recruitContactEndpoint = "/recruitContact";
		this.recruitContactTypesEndpoint = "/recruitContact/recruitContactTypes";
		this.recruitEngagementLevelsEndpoint = "/recruits/recruitEngagementLevels";
		this.recruitCommentsEndpoint = "/recruits/%s/recruitComments";
		this.recruitSourcesEndpoint = "/recruits/recruitSources";
	},
	/**
	 * Set the access token to be used as authorization when making requests to the server
	 * @param accessToken - the token retrieved from a PhiAuth authentication call
	 */
	setAccessToken: function(accessToken){
		this.accessToken = accessToken;
	},
	defaultFailureBehavior: function(failureString){
		alert(failureString);
	},
	/**
	 * This is the genericized POST method. To use it, define other methods that call this one and pass in success and failure handlers.
	 * This is important because it provides the UI a layer of abstraction away from the messy HTTP stuff,
	 * thus allowing for better separation of model, view, and controller.
	 * @param path - The path from the REST uri root (i.e. /users/userTypes) of the endpoint you want to hit
	 * @param postObject - the actual object to be serialized into JSON and sent to the server
	 * @param successCallback - a function that will be triggered if the http status code on response indicates success
	 * @param failureCallback - a function that will be triggered if the http status code on response indicates failure
	 */
	post: function(path, postObject, successCallback, failureCallback){
		//Do we need to put an if-check on typeof = object here,
		//or is a === a.stringify in the case where a was already a string??
		var jsonString = JSON.stringify(postObject);
		var uri = this.serviceUrl + path;
		jQuery.ajax({
			type: "POST",
			data: jsonString,
			url: uri,
			dataType: "json",
			contentType: "application/json",
			beforeSend: function(request){
				if(maxwellClient.accessToken != null && maxwellClient.accessToken != undefined){
					request.setRequestHeader("Authorization", maxwellClient.accessToken);
				}
			}
		}).done(function(data, status, responseHandler){
			successCallback(data, responseHandler);
		}).fail(function(responseHandler, status, data){
			//Make sure object is non-null, and is a function
			if(typeof failureCallback == "function"){
				//Trigger the function
				failureCallback(data, responseHandler);
			}else{
				//If null or if it's not a function, do some default failure behavior
				maxwellClient.defaultFailureBehavior(responseHandler.responseText);
			}
			console.log(responseHandler.responseText);
		});
	},
	/**
	 * This is the genericized PUT method. To use it, define other methods that call this one and pass in success and failure handlers.
	 * This is important because it provides the UI a layer of abstraction away from the messy HTTP stuff,
	 * thus allowing for better separation of model, view, and controller.
	 * @param path - The path from the REST uri root (i.e. /users/{userId}/recruitInfo) of the endpoint you want to hit
	 * @param postObject - the actual object to be serialized into JSON and sent to the server
	 * @param successCallback - a function that will be triggered if the http status code on response indicates success
	 * @param failureCallback - a function that will be triggered if the http status code on response indicates failure
	 */
	put: function(path, putObject, successCallback, failureCallback){
		var jsonString = JSON.stringify(putObject);
		var uri = this.serviceUrl + path;
		jQuery.ajax({
			type: "PUT",
			data: jsonString,
			url: uri,
			dataType: "json",
			contentType: "application/json",
			beforeSend: function(request){
				if(maxwellClient.accessToken != null && maxwellClient.accessToken != undefined){
					request.setRequestHeader("Authorization", maxwellClient.accessToken);
				}
			}
		}).done(function(data, status, responseHandler){
			successCallback(data, responseHandler);
		}).fail(function(responseHandler, status, data){
			//Make sure object is non-null, and is a function
			if(typeof failureCallback == "function"){
				//Trigger the function
				failureCallback(data, responseHandler);
			}else{
				//If null or if it's not a function, do some default failure behavior
				maxwellClient.defaultFailureBehavior(responseHandler.responseText);
			}
			console.log(responseHandler.responseText);
		});
	},

	/**
	 * This is the genericized "GET" method.  To use it, define other methods that call this one and pass in success and failure handlers.
	 * This is important because it provides the UI a layer of abstraction away from the messy HTTP stuff,
	 * thus allowing for better separation of model, view, and controller.
	 * @param path
	 * @param successCallback
	 * @param failureCallback
	 */
	get: function(path, successCallback, failureCallback){		
/*		$.getJSON(this.serviceUrl + path).done(function(data,status,responseHandler){
				successCallback(data, responseHandler);
		})*/
		var uri = this.serviceUrl + path;
		$.ajax({
			type: "GET",
			dataType: "json",
			url: uri,
			beforeSend: function(request){
				if(maxwellClient.accessToken != null && maxwellClient.accessToken != undefined){
					request.setRequestHeader("Authorization", maxwellClient.accessToken);
				}
			}			
		}).done(function(data, status, responseHandler){
			successCallback(data, responseHandler);
		}).fail(function(responseHandler, status, data){
			//Make sure object is non-null, and is a function
			if(typeof failureCallback == "function"){
				//Trigger the function
				failureCallback(data, responseHandler);
			}else{
				//If null or if it's not a function, do some default failure behavior
				maxwellClient.defaultFailureBehavior(responseHandler.responseText);
			}
			console.log(responseHandler.responseText);
		});
	},
	getUsersByType: function(type,successCallback){
		var path = this.usersEndpoint;
		if(type){
			path += "?userType=" + type;
		}
		this.get(path, successCallback, function(data, responseHandler){ 
			alert('Could not retrieve list of users.');
		});
	},
	getUserById: function(userId,successCallback){
		var path = this.userByIdEndpoint.replace("%s",userId);
		
		this.get(path, successCallback, function(data, responseHandler){ 
			alert('Could not retrieve user.');
		});
	},
	createUser: function(userObject,successCallback,failureCallback){
		if(!failureCallback){
			failureCallback = function(data, responseHandler){
				console.log('Could not create user.' + data);
				alert('Could not create user.' + data);
			};
		}
		this.post(this.usersEndpoint, userObject, successCallback, failureCallback);
	},
	updateUser: function(userObject,successCallback,failureCallback){
		if(!failureCallback){
			failureCallback = function(data, responseHandler){
				console.log('Could not update user. ' + responseHandler.responseText);
				alert('Could not update user.');
			};
		}
		var path = this.userByIdEndpoint.replace("%s",userObject.userId);
		this.put(path, userObject, successCallback, failureCallback);
	},
	getAssociateClasses: function(successCallback){
		
		this.get(this.associateClassesEndpoint, successCallback, function(data, responseHandler){ 
			alert('Could not retrieve list of associate class mappings.');
		});
	},
	getChapters: function(successCallback){
		
		this.get(this.chaptersEndpoint, successCallback, function(data, responseHandler){ 
			alert('Could not retrieve list of chapters.');
		});
	},
	getUserTypes: function(successCallback){
		
		this.get(this.userTypesEndpoint, successCallback, function(data, responseHandler){ 
			alert('Could not retrieve list of chapters.');
		});
	},
	createEACMeeting: function(eacMeetingObject, successCallback){
		
		//Pass in anonymous failure function, which can alert a debug message, print to console,
		//update page with red text, or whatever you want on failure
		this.post(this.eacMeetingsEndpoint, eacMeetingObject, successCallback,function(data, responseHandler){
			alert('Could not create EAC meeting.');
		});
	},
	getRecruitInfoByUserId: function(userId, successCallback){
		var path = this.recruitInfoEndpoint.replace("%s",userId);
		
		this.get(path, successCallback, function(data,responseHandler){
			alert('Could not retrieve recruit info.');
		});
	},
	createRecruitInfo: function(userId, recruitInfoObject, successCallback){
		var path = this.recruitInfoEndpoint.replace("%s",userId);
		
		this.post(path, recruitInfoObject, successCallback, function(data,responseHandler){
			alert('Could not create recruit info.');
		});
	},
	updateRecruitInfo: function(userId, recruitInfoObject, successCallback){
		var path = this.recruitInfoEndpoint.replace("%s",userId);
		
		this.put(path, recruitInfoObject, successCallback, function(data,responseHandler){
			alert('Could not update recruit info.');
		});
	},
	/**
	 * retrieve a list of all contacts made to the specified recruit
	 * @param recruitUserId - the userId of the recruit being contacted
	 * @param maxResults - the maximum number of contact objects to return. Server default is 20
	 * @param successCallback - the function to perform on the response object
	 * @returns {String} - temporary return while mocked
	 */
	getRecruitContactHistoryByRecruitUserId: function(recruitUserId, successCallback, maxResults){
		this.getRecruitContactHistoryByParameters(recruitUserId, null, successCallback, maxResults);
	},
	/**
	 * retrieve a list of all contacts made by a given user (i.e. a recruitment chair)
	 * @param userId - the userId of the person making contact with recruits
	 * @param maxResults - the maximum number of contact objects to return. Server default is 20
	 * @param successCallback - the function to perform on the response object
	 * @returns {String} - temporary return while mocked
	 */
	getRecruitContactHistoryByUserId: function(userId, successCallback, maxResults){
		this.getRecruitContactHistoryByParameters(null, userId, successCallback, maxResults);
	},
	getRecruitContactHistoryByParameters: function(recruitUserId,recruitContactorUserId, successCallback, maxResults){
		var path = this.recruitContactEndpoint;
		var existingParams = false;
		if(recruitUserId){
			path += "?recruitUserId=" + recruitUserId;
			existingParams = true;
		}
		if(recruitContactorUserId){
			path += (existingParams ? "&" : "?") + "recruitContactorUserId=" + recruitContactorUserId;
			existingParams = true;
		}
		if(maxResults){
			path += (existingParams ? "&" : "?") + "maxResults=" + maxResults;
			existingParams = true;
		}
		
		this.get(path, successCallback, function(data,responseHandler){
			console.log("Could not retrieve contact history.  " + data);
		});
	},
	/**
	 * Get the metadata describing all of the potential recruit contact methods
	 * @param successCallback - the function to trigger on success
	 */
	getRecruitContactTypes: function(successCallback){
		this.get(this.recruitContactTypesEndpoint, successCallback, function(data,response){
			console.log("Could not retrieve contact types.  " + data);
		});
	},
	recordRecruitContact: function(recruitContactObject, successCallback){
		this.post(this.recruitContactEndpoint, recruitContactObject, successCallback, function(data, responseHandler){
			console.log("Could not create recruit contact record.  " + responseHandler.responseText);
		});
	},
	getRecruitEngagementLevels: function(successCallback){
		this.get(this.recruitEngagementLevelsEndpoint, successCallback, function(data,responseHandler){
			console.log("Could not retrieve recruit engagement levels.  " + data);
		});
	},
	addRecruitComment: function(recruitCommentObject,successCallback){
		var path = this.recruitCommentsEndpoint.replace("%s",recruitCommentObject.recruitUserId);
		this.post(path, recruitCommentObject, successCallback, function(data,responseHandler){
			console.log("Could not add recruit comment due to exception.  " + data);
		});
	},
	getRecruitCommentsByRecruitUserId: function(recruitUserId,successCallback){
		var path = this.recruitCommentsEndpoint.replace("%s",recruitUserId);
		this.get(path, successCallback, function(data,responseHandler){
			console.log("Could not add recruit comment due to exception.  " + data);
		});
	},
	getRecruitSources: function(successCallback){
		this.get(this.recruitSourcesEndpoint, successCallback, function(data, responseHandler){
			console.log("Could not retrieve recruit sources.  " + data);
		});
	}

};