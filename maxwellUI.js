var associateClasses = new Array();
var chapters = new Array();
var userTypes = new Array();
var recruitContactTypes = new Array();
var recruitEngagementLevels = new Array();
var usersByType = new Array(); //This is a 2-dimensional array.  Key = user type id, value = array of users of that type
var userInfoByUserId = new Array();
var recruitInfoByUserId = new Array();
var metadataOnChangeEvents = new Array();
var metadataInitialized = false;

$(document).ready(function(){
	initialSetup();
	$("#loginPane").lightbox_me();
});
function initialSetup(){
	maxwellClient.init("http://www.evergreenalumniclub.com:7080/ProjectMaxwell/rest");
	phiAuthClient.init("http://www.evergreenalumniclub.com:7080");
	initializeOnChangeHandlers();
	$('#newUser').click(function(){
		$('#contentHolder').children().not('#createUsersHolder').hide();
		getNewUserData();
		setNewUserValues();
		$('#createUsersHolder').show();
	});
	$('#usersList').click(function(){
		$('#contentHolder').children().not('#usersListHolder').hide();
		retrieveAndPopulateUserTable($('#userTableTypeSelect').val());
		$('#usersListHolder').show();
	});
	$('#userTableTypeSelect').change(function(){
		retrieveAndPopulateUserTable($('#userTableTypeSelect').val());
	});
	$('#newEACMeeting').click(function(){
		$('#contentHolder').children().not('#newEACMeetingHolder').hide();
		$('#newEACMeetingHolder').show();
	});
	$('#recruitPage').click(function(){
		$('#contentHolder').children().not('#recruitmentPageHolder').hide();
		populateRecruitmentPage();
		$('#recruitmentPageHolder').show();
	});
	$('#submitEventButton').click(createEACMeeting);
	$('#submitPasswordLoginButton').click(doLoginByPassword);
}

/**
 * Use PhiAuth to attempt a password grant.
 * If a token is successfully retrieved, add it to maxwellClient, and set the refresh countdown
 */
function doLoginByPassword(){
	var username = $("#loginFormUsername").val();
	var password = $("#loginFormPassword").val();
	phiAuthClient.authenticateByPassword(username,password,
			function(data,statusCode,responseHandler){
				$("#loginPane").trigger("close");
				maxwellClient.setAccessToken(phiAuthClient.tokenResponse.accessToken);
				
				$(".loginFormInput").val(null);
				//These variables are here because this is an asynchronous wait timer,
				//and phiAuthClient is liable to change in the time before the timer is triggered
				var tmpRefreshToken = phiAuthClient.tokenResponse.refreshToken;
				var tmpTtl = phiAuthClient.tokenResponse.ttl;
				setRefreshTimer(tmpRefreshToken, tmpTtl);
				
				if(!metadataInitialized){
					metadataInitialized = true;
					initializeMetadata();
				}
			},function(data,statusCode,responseHandler){
				$("#loginFormErrorDiv").html(phiAuthClient.errorResponse.errorMessage);
				$("#loginFormPassword").val(null);
			});
}

/**
 * Helper function to schedule refreshing the tokens
 * @param token - the refresh token from the phi auth response
 * @param seconds - the number of seconds to wait before requesting a new token
 */
function setRefreshTimer(token, seconds){
	if(seconds == null){
		seconds = 7200;
	}
	var tmpTimer = window.setTimeout(function(){
		refreshToken(token);
		window.currentTokenRefreshTimer = null;
	},seconds * 1000);
	if(window.currentTokenRefreshTimer != null){
		window.clearTimeout(window.currentTokenRefreshTimer);
	}
	window.currentTokenRefreshTimer = tmpTimer;
}

/**
 * Given a current refresh token, request from PhiAuth a completely new set of tokens
 * And then restart the refresh timer
 * @param token - the refresh token provided from previous Phi Auth token grant
 */
function refreshToken(token){
	phiAuthClient.refreshToken(token,function(data, status, responseHandler){
		maxwellClient.setAccessToken(phiAuthClient.tokenResponse.accessToken);
		//These variables are here because this is an asynchronous wait timer,
		//and phiAuthClient is liable to change in the time before the timer is triggered
		var tmpRefreshToken = phiAuthClient.tokenResponse.refreshToken;
		var tmpTtl = phiAuthClient.tokenResponse.ttl;
		setRefreshTimer(tmpRefreshToken, tmpTtl);
	},function(data,status,responseHandler){
		console.log("Refresh failed, login will expire at end of current token's ttl.");
	});
}

function initializeOnChangeHandlers(){
	//Associate Class event handlers
	associateClasses.onChange = new Array();
	associateClasses.onChange[0] = function(){ 
		var associateClassString = '';
		for(var i = 0; i < associateClasses.length; i++){
			var associateClassObject = associateClasses[i];
			if(associateClassObject !== undefined){
				associateClassString += '<option value="' + associateClassObject.associateClassId + '">' + associateClassObject.name + '</option>';
			}
		}
		//associateClassString += '<option value="' + data[i]['associateClassId'] + '" selected>' + data[i]['name'] + '</option>';
		$('#associateClassInput').html(associateClassString);
		/*.chosen().change(function(){
			var currSelected = $(this).children('[value="' + $(this).val() + '"]').text();
		});*/
		$("#associateClassInput").val(associateClasses.length -1);
	};
	
	//Chapter event handlers
	chapters.onChange = new Array();
	chapters.onChange[0] = function(){ 
		var chapterString = '';
		for(var i = 0; i < chapters.length; i++){
			var chapterObject = chapters[i];
			if(chapterObject !== undefined){
				chapterString += '<option value="' + chapterObject.chapterId + '">' + chapterObject.name + '</option>';
			}
		}
		//chapterString += '<option value="' + data[i]['chapterId'] + '" selected>' + data[i]['name'] + '</option>';
		$('#chapterNameInput').html(chapterString);
		/*.chosen().change(function(){
			var currSelected = $(this).children('[value="' + $(this).val() + '"]').text();
		});*/
		$("#chapterNameInput").val(41);
	};
	
	//UserType event handlers
	userTypes.onChange = new Array();
	userTypes.onChange[0] = function(){ 
		var userTypeString = '';
		for(var i = 0; i < userTypes.length; i++){
			var userTypeObject = userTypes[i];
			if(userTypeObject !== undefined){
				userTypeString += '<option value="' + userTypeObject.userTypeId + '">' + userTypeObject.name + '</option>';
			}
		}
		//userTypeString += '<option value="' + data[i]['userTypeId'] + '" selected>' + data[i]['name'] + '</option>';
		$('#userTypeInput').html(userTypeString);
		/*.chosen().change(function(){
			var currSelected = $(this).children('[value="' + $(this).val() + '"]').text();
		});*/
	};
	
	//RecruitContactType event handlers
	recruitContactTypes.onChange = new Array();
	
	//RecruitEngagementLevel event handlers
	recruitEngagementLevels.onChange = new Array();
}
function triggerMetadataOnChangeHandlers(object){
	for(var i = 0; i < object.onChange.length; i++){
		object.onChange[i]();
	}
}
function initializeMetadata(){
	maxwellClient.getAssociateClasses(function(data){
		var tempAssociateClassArray = new Array();
		for(var i = 0; i < data.length; i++){
			tempAssociateClassArray[data[i].associateClassId] = data[i];
		}
		setAssociateClasses(tempAssociateClassArray);
	});
	maxwellClient.getChapters(function(data){
		var tempChapterArray = new Array();
		for(var i = 0; i < data.length; i++){
			tempChapterArray[data[i].chapterId] = data[i];
		}
		setChapters(tempChapterArray);
	});
	maxwellClient.getUserTypes(function(data){
		var tempUserTypeArray = new Array();
		for(var i = 0; i < data.length; i++){
			tempUserTypeArray[data[i].userTypeId] = data[i];
		}
		setUserTypes(tempUserTypeArray);

		//Pre-instantiate the arrays in our users array
		$(userTypes).each(function(index){
			window.usersByType[index] = new Array();
		});
	});
	maxwellClient.getRecruitContactTypes(function(data){
		var tempRecruitContactTypeArray = new Array();
		for(var i = 0; i < data.length; i++){
			tempRecruitContactTypeArray[data[i].recruitContactTypeId] = data[i];
		}
		setRecruitContactTypes(tempRecruitContactTypeArray);
	});
	maxwellClient.getRecruitEngagementLevels(function(data){
		var tempRecruitEngagementLevelArray = new Array();
		for(var i = 0; i < data.length; i++){
			tempRecruitEngagementLevelArray[data[i].recruitEngagementLevelId] = data[i];
		}
		setRecruitEngagementLevels(tempRecruitEngagementLevelArray);
	});

	//Moved here temporarily to default the recruit page to the front and populate it
	//This is not a good long-term way of doing things, however
	$('#recruitPage').click();
}
function getNewUserData(){
	//I don't know what this is, but it's certainly not the right way to be doing whatever it is
	/*getDatas({'referredBy': true, referredByID: 1});
	getDatas({'referredBy': true, referredByID: 2});
	getDatas({'referredBy': true, referredByID: 3});*/
}
/**
 * This function is used to make sure we aren't repeatedly hitting the server to retrieve users lists that we already have
 * @param userType
 */
function retrieveAndPopulateUserTable(userType){
	//In the future, we may need to do an ETag check here instead of just checking for null
	//Otherwise we might get concurrent modification problems
	if(usersByType[userType] == null || usersByType[userType].length == 0){
		maxwellClient.getUsersByType(userType, function(data, responseHandler){
			usersByType[userType] = data;
			populateUserTable2(usersByType[userType]);
		});
	}else{
		populateUserTable2(usersByType[userType]);
	}
}
function populateUserTable(){
	maxwellClient.getUsersByType($('#userTableTypeSelect').val(), function(data){
		var newUserText = '';
		for(var i = 0; i < data.length; i++){
			var associateClassId = data[i].associateClassId == null ? '' : data[i].associateClassId;
			var email = data[i].email == null ? '' : data[i].email;
			newUserText += '<tr><td><div class="userTableFullName">' + data[i].firstName + ' ' + data[i].lastName + '</div></td>' +
			'<td><div class="userTableAssociateClass">' + associateClassId + '</div></td>' +
			'<td><divclass="userTableEmailAddy">' + email + '</div></td>' +
			'<td><div class="userTablePhoneNumber">520-977-3126</div></td></tr>';
		}
		$('#usersListBody').empty().append(newUserText);
	});
	
}
function populateUserTable2(data){
	var newUserText = '';
	for(var i = 0; i < data.length; i++){
		var associateClassId = data[i].associateClassId == null ? '' : data[i].associateClassId;
		var email = data[i].email == null ? '' : data[i].email;
		newUserText += '<tr><td><div class="userTableFullName">' + data[i].firstName + ' ' + data[i].lastName + '</div></td>' +
		'<td><div class="userTableAssociateClass">' + associateClasses[associateClassId].name + '</div></td>' +
		'<td><divclass="userTableEmailAddy">' + email + '</div></td>' +
		'<td><div class="userTablePhoneNumber">520-977-3126</div></td></tr>';
	}
	$('#usersListBody').empty().append(newUserText);
}
function populateRecruitmentPage(){
	maxwellClient.getUsersByType(5, function(data){
		var recruitListText = '';
		for(var i = 0; i < data.length; i++){
			recruitListText += '<li class="recruitsListItem"><div class="userTableFullName">' + data[i].firstName + ' ' + data[i].lastName + '</div></li>';
		}
		if(data.length != 0){
			loadRecruitDetails(data[0]['userId']);
		}
		$('#recruitsNameList').empty().append(recruitListText);
	});
}
function loadRecruitDetails(recruitID){
	$('#recruitBlurbHolder, #recruitsContactHistoryListHolder').empty();
	maxwellClient.getRecruitContactHistoryByRecruitUserId(recruitID, function(data){
		if(data.length == 0){
			$('#recruitsContactHistoryListHolder').append('<div>Could not retrieve any recruit information</div>');
		}else{
			var recruitContactUL = $('<ul id="recruitsContactHistoryList"></ul>');
			var recruitListText = '';
			var recruitContactors = [];
			for(var i = 0; i < data.length; i++){
				if(data[i]['notes']){
					var contactNotes = data[i]['notes'];
				}else{
					var contactNotes = "Nope.";
				}
				recruitListText += '<li class="recruitContactItem"><div class="recruitContactItemInner">' +
					'<div class="recruitContactTimestamp">Time was: ' + data[i]['contactTimestamp'] + '</div>' +
					'<div class="recruitContactRecruitor">Contacter was: <span class="recruitContactorUserId-' + data[i]['recruitContactorUserId'] + '">loading....</span></div>' +
					'<div class="recruitContactMethod">Contacted method: ' + data[i]['recruitContactTypeId'] + '</div>' +
					'<div class="recruitContactNotes">Notes: ' + contactNotes + '</div>' +
					'</div></li>';

				if($.inArray(data[i]['recruitContactorUserId'], recruitContactors) == -1){
					recruitContactors.push(data[i]['recruitContactorUserId']);
				}
			}
			recruitContactUL.append(recruitListText);
			$('#recruitsContactHistoryListHolder').append(recruitContactUL);
			for(var i = 0; i < recruitContactors.length; i++){
				maxwellClient.getUserById(recruitContactors[i], function(userData){
					if(userData){
						$('.recruitContactorUserId-' + userData['userId']).text(userData.firstName + ' ' + userData.lastName)
					}
				});
			}
		}
	});
	maxwellClient.getRecruitInfoByUserId(recruitID, function(data){
		var recruitDetails = '<div>classStanding: ' + data.classStanding + '</div>' +
		'<div>dateAdded: ' + data.dateAdded + '</div>' +
		'<div>gpa: ' + data.gpa + '</div>' +
		'<div>lifeExperiences: ' + data.lifeExperiences + '</div>' +
		'<div>recruitSourceId: <span id="recruitSourceId">loading....</span></div>' +
		'<div>rushListUserId: ' + data.rushListUserId + '</div>';
		$('#recruitBlurbHolder').append(recruitDetails);
		console.log("Getting user info for recruit with id '" + recruitID + "'.");
		maxwellClient.getUserById(recruitID, function(userData){
			if(userData){
				$('#recruitSourceId').text(userData['firstName'] + ' ' + userData['lastName'])
			}
		});
	});
	
}
function setNewUserValues(){
	$('#referredByMemberInput').chosen();
	$('#kittenSubmitButton').click(submitUser);
	/*$('#associateClassInput').chosen().change(function(){
		console.log($(this).val())
	});*/
}
function getDatas(dataOptions){
	var getURL = "http://evergreenalumniclub.com:7080/ProjectMaxwell/rest/"
	if(dataOptions['associateClass']){
		getURL += "associateClasses";
	}else if(dataOptions['userTypes']){
		getURL += "users/userTypes"
	}else if(dataOptions['referredBy']){
		getURL += "users?userType=" + dataOptions['referredByID'];
	}else if(dataOptions['chapters']){
		getURL += "chapters";
	}else{
		getURL += "users?userType=3";
	}
	$.getJSON(getURL)
	.success(function(data){
		if(dataOptions['associateClass']){
			var associateClassString = '';
			for(var i = 0; i < data.length - 1; i++){
				associateClassString += '<option value="' + data[i]['associateClassId'] + '">' + data[i]['name'] + '</option>';
			}
			associateClassString += '<option value="' + data[i]['associateClassId'] + '" selected>' + data[i]['name'] + '</option>';
			$('#associateClassInput').append(associateClassString).	chosen().change(function(){
				var currSelected = $(this).children('[value="' + $(this).val() + '"]').text();
			});
		}else if(dataOptions['userTypes']){
			var userTypeString = '';
			for(var i = 0; i < data.length; i++){
				userTypeString += '<option value="' + data[i]['userTypeId'] + '">' + data[i]['name'] + '</option>';
			}
			$('#userTypeInput').append(userTypeString).chosen().change(function(){
				if($(this).val() == 5){
					$('#yearInitiatedInput').attr('disabled', 'true').val('');
					$('#yearGraduatedInput').attr('disabled', 'true').val('');
					$('#pinNumberInput').attr('disabled', 'true').val('');

					$('#associateClassInput').attr('disabled', 'true');
					$('#associateClassInput')[0].selectedIndex = 0;
					$('#associateClassInput').trigger("liszt:updated");

					$('#chapterNameInput').attr('disabled', 'true');
					$('#chapterNameInput')[0].selectedIndex = 0;
					$('#chapterNameInput').trigger("liszt:updated");
				}else if($(this).val() == 1 || $(this).val() == 2){
					$('#associateClassInput')[0].selectedIndex = 0;
					$('#chapterNameInput').attr('disabled', 'true');
					$('#chapterNameInput')[0].selectedIndex = 0;
					$('#associateClassInput').trigger("liszt:updated");
					$('#chapterNameInput').trigger("liszt:updated");
				}else{
					$('#yearInitiatedInput').removeAttr('disabled');
					$('#yearGraduatedInput').removeAttr('disabled');
					$('#associateClassInput').removeAttr('disabled');
					$('#pinNumberInput').removeAttr('disabled');
					$('#chapterNameInput').removeAttr('disabled');
					$('#associateClassInput').trigger("liszt:updated");
					$('#chapterNameInput').trigger("liszt:updated");
				}
			});
		}else if(dataOptions['referredBy']){
			var referredByString = '';
			if(dataOptions['referredByID'] == 1){
				referredByString += '<optgroup label="Associate">';
			}else if(dataOptions['referredByID'] == 2){
				referredByString += '<optgroup label="Initiate">';
			}else if(dataOptions['referredByID'] == 3){
				referredByString += '<optgroup label="Alumnus">';
			}
			for(var i = 0; i < data.length; i++){
				referredByString += '<option value="' + data[i]['userId'] + '">' + data[i]['firstName'] + ' ' + data[i]['lastName'] + '</option>';
			}
			referredByString += '</optgroup>';
			if(dataOptions['referredByID'] == 3){
				referredByString += '<optgroup label="Other">' +
				'<option value="" selected>No one</option>'+
				'</optgroup>';
			}
			$('#referredByMemberInput').append(referredByString).trigger("liszt:updated");
		}else if(dataOptions['chapters']){
			var userTypeString = '';
			for(var i = 0; i < data.length; i++){
				if(data[i]['chapterId'] == 41){
					userTypeString += '<option value="' + data[i]['chapterId'] + '" selected>' + data[i]['name'] + '</option>';
				}else{
					userTypeString += '<option value="' + data[i]['chapterId'] + '">' + data[i]['name'] + '</option>';
				}
			}
			$('#chapterNameInput').append(userTypeString).chosen();
		}
	});
}

//TODO: UNWIND ME AND USE CLIENTS, PLEASE
function submitUser(){
	var errorList = new Array();
	var userData = new Object;
	if($('#firstNameInput').val() && $('#lastNameInput').val()){
		userData['firstName'] = $('#firstNameInput').val();
		userData['lastName'] = $('#lastNameInput').val();
	}else{
		errorList.push("Name is f'ed up.");
	}

	userData['email'] = $('#emailAddressInput').val() || null;
	userData['yearInitiated'] = $('#yearInitiatedInput').val() || null;
	userData['yearGraduated'] = $('#yearGraduatedInput').val() || null;
	if($('#userTypeInput').val() == 1 || $('#userTypeInput').val() == 2){
		if($('#associateClassInput').val() == 0){
			errorList.push("Undergrads must have an Associate Class.");
		}else{
			userData['associateClassId'] = $('#associateClassInput').val();
		}
	}else{
		userData['associateClassId'] = $('#associateClassInput').val();
	}
	
	userData['userTypeId'] = $('#userTypeInput').val() || null;
	userData['chapterId'] = $('#chapterNameInput').val() || null;
	userData['linkedInId'] = $('#linkedInURLInput').val() || null;
	userData['twitterId'] = $('#twitterURLInput').val() || null;
	userData['highschool'] = $('#highschoolInput').val() || null;
	if($('#phoneNumberInput').val().length <= 12){
		userData['phoneNumber'] = $('#phoneNumberInput').val() || null;	
	}else{
		errorList.push('Phone Number is too long.');
	}
	
	userData['referredById'] = $('#referredByMemberInput').val() || null;

	
	/*if(errorList.length == 0){
		var userPin = prompt("WHAT YOU PIN NUMBA, DOCTA JONES?")
	}
	if(userPin != null && userPin.length != 0 && !isNaN(userPin)){
		var password = prompt("PASSWERD");
		getUserToken(userData, userPin, password);
	}else if(userPin != null){
		var checkTryAgain = confirm("Pin has to be a number, fool. Try again?");
		if(checkTryAgain){
			submitUser();
		}
	}else{*/
	if(errorList.length > 0){
		var errorString = "Please resolve the following profile issues: \n";
		for(var i = 0; i < errorList.length; i++){
			errorString += (i+1) + ": " + errorList[i] + "\n";
		}
		alert(errorString);
	}else{
		maxwellClient.createUser(userData, function(data, responseHandler){
			console.log(data);
		});
	}
}
function getUserToken(userData, pinNumber, passwordWord){
	/*var tokenDeets = {
		"grantType": "PASSWORD",
		"username": pinNumber.toString(),
		"password": passwordWord,
		"clientId": "MAXWELL_WEB_CLIENT" 
	}
	tokenDeets = JSON.stringify(tokenDeets);
	$.ajax({
		dataType: "json",
		type: "POST",
		url: "http://evergreenalumniclub.com:7080/PhiAuth/rest/token",
		data: tokenDeets,
		contentType: "application/json",
		success: function(data){
			alert("yashimash");
			postDatas(userData, data.accessToken)
		},
		error: function(data){
			alert('NooooooOOOOOooOOOoOOooOOOOoOOOooooooo!');
			console.log(data);
		}
	});*/
	postDatas(userData, null);
}
function postDatas(userData, accessToken){
	/*userData = JSON.stringify(userData);
	console.log(userData)
	$.ajax({
		dataType: "json",
		type: "POST",
		headers: {
			"Authorization": accessToken
		},
		url: "http://evergreenalumniclub.com:7080/ProjectMaxwell/rest/users",
		data: userData,
		contentType: "application/json",
		success: function(){
			alert("Excelsior");
			$(".newUserInput").val('');
		},
		error: function(data){
			alert('Something went wrong. Oops.');
			console.log(data);
		}
	});*/
}
function createEACMeeting(){
	var eventDate = $('#eventDate').val();
	var eventLocation = $('#eventLocation').val();
	var eventMapLink = $('#eventGoogleMaps').val();
	var eventWebSite = $('#eventWebsite').val();
	var eacObject = new Object();
	eacObject.location = eventLocation.length < 1 ? null : eventLocation;
	eacObject.date = eventDate.length < 1 ? null : eventDate;
	eacObject.googleMaps = eventMapLink.length < 1 ? null : eventMapLink;
	eacObject.website = eventWebSite.length < 1 ? null : eventWebSite;
	maxwellClient.createEACMeeting(eacObject, function(responseObject, responseHandler){
		console.log(responseObject);
		$('.createEACMeetingInput').val('');
	});
}
function setAssociateClasses(associateClasses){
	var tempOnChange = this.associateClasses.onChange;
	this.associateClasses = associateClasses;
	this.associateClasses.onChange = tempOnChange;
	triggerMetadataOnChangeHandlers(this.associateClasses);
}
function setChapters(chapters){
	var tempOnChange = this.chapters.onChange;
	this.chapters = chapters;
	this.chapters.onChange = tempOnChange;
	triggerMetadataOnChangeHandlers(this.chapters);
}
function setUserTypes(userTypes){
	var tempOnChange = this.userTypes.onChange;
	this.userTypes = userTypes;
	this.userTypes.onChange = tempOnChange;
	triggerMetadataOnChangeHandlers(this.userTypes);
}
function setRecruitContactTypes(recruitContactTypes){
	var tempOnChange = this.recruitContactTypes.onChange;
	this.recruitContactTypes = recruitContactTypes;
	this.recruitContactTypes.onChange = tempOnChange;
	triggerMetadataOnChangeHandlers(this.recruitContactTypes);
}
function setRecruitEngagementLevels(recruitEngagementLevels){
	var tempOnChange = this.recruitEngagementLevels.onChange;
	this.recruitEngagementLevels = recruitEngagementLevels;
	this.recruitEngagementLevels.onChange = tempOnChange;
	triggerMetadataOnChangeHandlers(this.recruitEngagementLevels);
}