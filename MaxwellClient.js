var maxwellClient = {
	usersEndpoint: "/users",
	associateClassesEndpoint: "/associateClasses",
	chaptersEndpoint: "/chapters",
	userTypesEndpoint: "/users/userTypes",
	eacMeetingsEndpoint: "/EAC/meet-ups",
	recruitInfoEndpoint: "/users/%s/recruitInfo",
	init: function(serviceUrl){
		this.serviceUrl = serviceUrl;
	},
	defaultFailureBehavior: function(failureString){
		//This function does exactly what the "if typeof == string" block was doing
		alert(failureString);
	},
	post: function(path, postObject, successCallback, failureCallback){
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
			//Make sure object is non-null, and is a function
			if(failureCallback && typeof failureCallback == "function"){
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
	get: function(path, successCallback, failureObject){		
		$.getJSON(this.serviceUrl + path).done(function(data,status,responseHandler){
				successCallback(data, responseHandler);
		}).fail(function(responseHandler, status, data){
			//Make sure object is non-null, and is a function
			if(failureCallback && typeof failureCallback == "function"){
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
	getRecruitContactHistoryByRecruitUserId: function(userId, successCallback){
		var mockedResponse = '														\
		[																			\
		  {																			\
		    "recruitContactId":69,													\
		    "contactorId":123,														\
		    "contacteeId":321,														\
		    "timestamp":13426700,													\
		    "contactTypeId":3,														\
		    "notes":"Talked to recruit about Skiing."								\
		  },																		\
		  {																			\
		    "recruitContactId":6969													\
		    "contactorId":100,														\
		    "contacteeId":321,														\
		    "timestamp":13427900,													\
		    "contactTypeId":2,														\
		    "notes":"Facebook chatted with recruit.  Turns out he�s a huge racist."	\
		  }																			\
		]';
		return mockedResponse;
	},
	getRecruitContactHistoryByUserId: function(userId, successCallback){
		var mockedResponse = '														\
		[																			\
		  {																			\
		    "recruitContactId":69,													\
		    "contactorId":123,														\
		    "contacteeId":321,														\
		    "timestamp":13426700,													\
		    "contactTypeId":3,														\
		    "notes":"Talked to recruit about Skiing."								\
		  },																		\
		  {																			\
		    "recruitContactId":96													\
		    "contactorId":123,														\
		    "contacteeId":8008135,													\
		    "timestamp":13426900,													\
		    "contactTypeId":2,														\
		    "notes":"Facebooked Rutherford McRecruitster. He wants to attend a bbq."\
		  }																			\
		]';
		return mockedResponse;
	}

};