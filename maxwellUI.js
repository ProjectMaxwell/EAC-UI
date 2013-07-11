var associateClasses = new Array();
var chapters = new Array();
var userTypes = new Array();
var recruitContactTypes = new Array();
var recruitEngagementLevels = new Array();
var recruitSources = new Array();
var usersByType = new Array(); //This is a 2-dimensional array.  Key = user type id, value = array of users of that type
var userInfoByUserId = new Array();
var recruitInfoByUserId = new Array();
var metadataOnChangeEvents = new Array();
var metadataInitialized = false;
var maxwellServiceURI;
var phiAuthServiceURI;
var danteURI = "https://students.washington.edu/phitau/UWNetIDBounce/UWNetIDBounce.php";
var tmpUserToEdit;
var recentlyUpdatedRecruits;
var mockRecentlyUpdatedRecruits = [{
		"userDateCreated": 1373236501,
		"userDateModified": 1373239888,
		"firstName": "TESTUSER3",
		"lastName": "tu3",
		"userId": 368,
		"recruitEngagementLevelId": 1,
		"recruitDateCreated": 1373236502,
		"recruitDateModified": 0
		},
		{
		"userDateCreated": 1373236401,
		"userDateModified": 0,
		"firstName": "Johnny",
		"lastName": "Testster",
		"userId": 10,
		"recruitEngagementLevelId": 3,
		"recruitDateCreated": 1373236402,
		"recruitDateModified": 0
		},
		{
		"userDateCreated": 1373236301,
		"userDateModified": 1373236303,
		"firstName": "Cornelius J.",
		"lastName": "Recruitingston",
		"userId": 365,
		"recruitEngagementLevelId": 4,
		"recruitDateCreated": 1373236302,
		"recruitDateModified": 0
		}];

$(document).ready(function(){
	initialSetup();
	var refreshToken = getRefreshTokenCookie();
	var uwnetidToken = loadPageVar("token");
	if(refreshToken){
		phiAuthClient.refreshToken(refreshToken,function(data, status, responseHandler){
			maxwellClient.setAccessToken(phiAuthClient.tokenResponse.accessToken);
			
			setRefreshTokenCookie(phiAuthClient.tokenResponse.refreshToken);
			//These variables are here because this is an asynchronous wait timer,
			//and phiAuthClient is liable to change in the time before the timer is triggered
			var tmpRefreshToken = phiAuthClient.tokenResponse.refreshToken;
			var tmpTtl = phiAuthClient.tokenResponse.ttl;
			setRefreshTimer(tmpRefreshToken, tmpTtl);
			
			if(!metadataInitialized){
				metadataInitialized = true;
				initializeMetadata();
			}
		},function(data,status,responseHandler){
			if(uwnetidToken){
				phiAuthClient.authenticateByUWNetID(uwnetidToken,successfulLogin,failedLogin);
				console.log("Refresh token from cookie not valid, getting new authorization via UWNetID token.");
			}else{
				console.log("Refresh token from cookie not valid.");
				$("#loginPane").lightbox_me();
			}
		});
	}else if(uwnetidToken){
		phiAuthClient.authenticateByUWNetID(uwnetidToken,successfulLogin,failedLogin);
	}else{
		$("#loginPane").lightbox_me();
	}
});
/*function bradyCat(){
	var betweenNums = 10;
	if(Math.floor(Math.random()*betweenNums+1) == 1){
		var imageWidth = 200;
		var imageHeight = 150;
		$('body').css('background', 'none');
		var bradyCat = '<style>' +
			'#bradyHolder{ width: 100%; height: 100%; position: fixed; top: 0px; left: 0px; z-index: -1; overflow: hidden;}' +
			'.bradyRow{ height: ' + imageHeight + '; position: relative; overflow: hidden;}' +
			'.bradyImage{ display: block; position: absolute; width: ' + imageWidth + '; height: ' + imageHeight + '; top: 0px; }' +
			'</style>' +
			'<div id="bradyHolder"></div>';
		$('body').append(bradyCat);
		var columns = ($('body').width()/200) + 1;
		var rows = ($('body').height()/150) + 1;
		console.log(columns);
		console.log(rows)
		var bradyText = '';
		for(var i = 0; i < rows; i++){
			bradyText += '<div class="bradyRow">';
			for(var m = 0; m < columns; m++){
				console.log(i)
				bradyText += '<img class="bradyImage" style="left: ' + (m*imageWidth) + 'px;" src="https://students.washington.edu/phitau/images/brady_kiteh_small.jpg" />';
			}
			bradyText += '</div>';
		}
		bradyText += '</div>';
		$('#bradyHolder').append(bradyText);
	};
}*/
function initialSetup(){
	maxwellClient.init("http://www.evergreenalumniclub.com:7080/ProjectMaxwell/rest");
	phiAuthClient.init("http://www.evergreenalumniclub.com:7080");
	initializeOnChangeHandlers();
	$('#newUser').click(function(){
		var myObj = $('#userFormDiv');
		$('#contentHolder').append(myObj);
		myObj.show();
		$('#viewUserEditButton a.edit .button').empty().append("Create");
		$('#contentHolder').children().not('#userFormDiv').hide();
		updateUserFormMode(2);
		setNewUserValues();
//		$('#createUsersHolder').show();
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
		retrieveAndPopulateRecruitTable();
		$('#recruitmentPageHolder').show();
	});
	
	$('#navHolder div').click(hideNotification);
	$('#recruitsDetailsHolder').hide();
	$('#submitEventButton').click(createEACMeeting);
	$('#submitPasswordLoginButton').click(doLoginByPassword);
	$('#UWNetIDLoginButton').click(doLoginByUWNetID);
	$('#notificationBarCloseButton').click(hideNotification);


	$('#recordRecruitContactButton').click(recordRecruitContact);
		$('#recruitsContactHistoryListHolder').find('.addItemButtonHolder').click(function(){
			$(this).animate({
				top: '-40px'
			}, 250, function(){
				$('#recruitsContactHistoryListHolder').find('.addItemHolder').animate({
					top: '0px'
				}, 250);
			});
		});
	$('#addRecruitCommentButton').click(addRecruitComment);
	$('#recruitCommentsHolder').find('.addItemButtonHolder').click(function(){
		$(this).animate({
			top: '-40px'
		}, 250, function(){
			$('#recruitCommentsHolder').find('.addItemHolder').animate({
				top: '0px'
			}, 250);
		});
	});
	//$('#submitPasswordLoginButton').click(doLoginByPassword);
	$('#loginFormUsername, #loginFormPassword').on('keyup', function(e){
		var code = (e.keyCode ? e.keyCode : e.which);
		if(code == 13 && $('#loginFormUsername').val() != "" && $('#loginFormPassword').val() != ""){
			doLoginByPassword();
		}
	});
	$('#createUserButton').click(submitUser);
	
	//$('#userFormAssociateClassInput').chosen();
	
	$('#viewUserHeader a.edit .button').click(function(){
		if($('#userFormCreateOrEdit').val() == "view"){
			updateUserFormMode(1);
			$('#viewUserEditButton a.edit .button').empty().append("Discard");
		}else if($('#userFormCreateOrEdit').val() == "edit"){
			updateUserFormMode(0);
			$('#viewUserEditButton a.edit .button').empty().append("Edit");
		}else{
			console.log("User form is currently in unknown state and cannot be swapped.");
		}
	});
	$('#userFormButton').click(function(){
		//TODO: probably do some clientside validation here
		if($('#userFormCreateOrEdit').val() == "edit"){
			console.log("Building edited profile.");
			var userToEdit = buildUserObject();
			maxwellClient.updateUser(userToEdit, updateAfterUserEdit,function(data,responseHandler){
				try{
					var errorObject = JSON.parse(responseHandler.responseText);
					console.log(errorObject);
					doNotification('Could not update user due to exception: ' + errorObject.errorMessage,true);	
				}catch(e){
					console.log("Could not parse exception as json.");
					doNotification('Could not update user due to unknown exception.');
				}
			});
		}else if($('#userFormCreateOrEdit').val() == "create"){
			console.log("Building new profile to create.");
			var userToCreate = buildUserObject();
			console.log(userToCreate);
			maxwellClient.createUser(userToCreate, updateAfterUserCreate, function(data,responseHandler){
				try{
					var errorObject = JSON.parse(responseHandler.responseText);
					console.log(errorObject);
					doNotification('Could not create new user due to exception: ' + errorObject.errorMessage,true);	
				}catch(e){
					console.log("Could not parse exception as json.");
					doNotification('Could not create new user due to unknown exception.');
				}
			});
		//	maxwellClient.updateUser(userToEdit, updateAfterUserEdit);
		}else{
			console.log("User form is not in edit mode, and no other modes are currently supported, and therefore this button cannot be used.");
		}
	});
}

/*********************************************************************************************
******************************* Authentication Helpers ***************************************
**********************************************************************************************/
/**
 * Use PhiAuth to attempt a password grant.
 * If a token is successfully retrieved, add it to maxwellClient, and set the refresh countdown
 */
function doLoginByPassword(){
	var username = $("#loginFormUsername").val();
	console.log("Logging in user '" + username + "' by password.");
	var password = $("#loginFormPassword").val();
	phiAuthClient.authenticateByPassword(username,password,
			successfulLogin,failedLogin);
}

function doLoginByUWNetID(){
	var redirectAddress = danteURI + "?redir=" + encodeURIComponent(document.URL);
	$(location).attr("href",redirectAddress);
}

function successfulLogin(data,statusCode,responseHandler){
	$("#loginPane").trigger("close");
	maxwellClient.setAccessToken(phiAuthClient.tokenResponse.accessToken);
	
	$(".loginFormInput").val("");
	setRefreshTokenCookie(phiAuthClient.tokenResponse.refreshToken);
	//These variables are here because this is an asynchronous wait timer,
	//and phiAuthClient is liable to change in the time before the timer is triggered
	var tmpRefreshToken = phiAuthClient.tokenResponse.refreshToken;
	var tmpTtl = phiAuthClient.tokenResponse.ttl;
	setRefreshTimer(tmpRefreshToken, tmpTtl);
	
	if(!metadataInitialized){
		metadataInitialized = true;
		initializeMetadata();
	}
}

function failedLogin(data,statusCode,responseHandler){
	$("#loginFormErrorDiv").html(phiAuthClient.errorResponse.errorMessage);
	$("#loginFormPassword").val("");
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
		setRefreshTokenCookie(phiAuthClient.tokenResponse.refreshToken);
		//These variables are here because this is an asynchronous wait timer,
		//and phiAuthClient is liable to change in the time before the timer is triggered
		var tmpRefreshToken = phiAuthClient.tokenResponse.refreshToken;
		var tmpTtl = phiAuthClient.tokenResponse.ttl;
		setRefreshTimer(tmpRefreshToken, tmpTtl);
	},function(data,status,responseHandler){
		console.log("Refresh failed, login will expire at end of current token's ttl.");
	});
}


/*********************************************************************************************
************************************ Cache Helpers *******************************************
**********************************************************************************************/

function initializeOnChangeHandlers(){
	//Associate Class event handlers
	associateClasses.onChange = new Array();
	associateClasses.onChange[0] = function(){ 
		var associateClassString = '';
		associateClassString += '<option value="0"></option>';
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
		
		$('#userFormAssociateClassInput').html(associateClassString);
//		$("#userFormAssociateClassInput").trigger("liszt:updated");
	};
	
	//Chapter event handlers
	chapters.onChange = new Array();
	chapters.onChange[0] = function(){ 
		var chapterString = '';
		chapterString += '<option value="0"></option>';
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
		
		$('#userFormChapterInput').html(chapterString);
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
		
		$('#userFormUserTypeInput').html(userTypeString);
	};
	
	//RecruitContactType event handlers
	recruitContactTypes.onChange = new Array();
	recruitContactTypes.onChange[0] = function(){ 
		var recruitContactTypeString = '';
		for(var i = 0; i < recruitContactTypes.length; i++){
			var recruitContactTypeObject = recruitContactTypes[i];
			if(recruitContactTypeObject !== undefined){
				recruitContactTypeString += '<option value="' + recruitContactTypeObject.recruitContactTypeId + '">' + recruitContactTypeObject.name + '</option>';
			}
		}
		$('#contactTypeInput').html(recruitContactTypeString);
		/*.chosen().change(function(){
			var currSelected = $(this).children('[value="' + $(this).val() + '"]').text();
		});*/
	};
	
	//RecruitEngagementLevel event handlers
	recruitEngagementLevels.onChange = new Array();
	
	//RecruitSource event handlers
	recruitSources.onChange = new Array();
}
function triggerMetadataOnChangeHandlers(object){
	if(object.onChange == null || object.onChange == undefined){
		return;
	}
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
	maxwellClient.getRecruitSources(function(data){
		var tempRecruitSourceArray = new Array();
		for(var i = 0; i < data.length; i++){
			tempRecruitSourceArray[data[i].recruitSourceId] = data[i];
		}
		setRecruitSources(tempRecruitSourceArray);
	});

	//Moved here temporarily to default the recruit page to the front and populate it
	//This is not a good long-term way of doing things, however
	$('#recruitPage').click();
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
			setUsersByType(userType, data);
			populateUserTable(userType);
		});
	}else{
		populateUserTable(userType);
	}
}

function populateUserTable(userType){
	var data = usersByType[userType];
	var newUserText = '';
	//Not sure if it's more efficient to append all table data at once, and then add onclick handlers in a second loop
	//or to append table rows and onclick handlers in sequence
	for(var i = 0; i < data.length; i++){
		var associateClassId = data[i].associateClassId == null ? '' : data[i].associateClassId;
		var email = data[i].email == null ? '' : data[i].email;
		var phoneNumber = data[i].phoneNumber == null ? '' : data[i].phoneNumber;
		newUserText += '<tr id="userTable_user' + data[i].userId + '"><td><div class="userTableFullName"><a>' + data[i].firstName + ' ' + data[i].lastName + '</a></div></td>' +
		'<td><div class="userTableAssociateClass">' + associateClasses[associateClassId].name + '</div></td>' +
		'<td><div class="userTableEmailAddy">' + email + '</div></td>' +
		'<td><div class="userTablePhoneNumber">' + phoneNumber + '</div></td></tr>';
	}
	$('#usersListBody').empty().append(newUserText);
	
	for(var i = 0; i < data.length; i++){
		(function(userId){
			var userTableString = "#userTable_user" + userId + " div.userTableFullName a";
			$(userTableString).click(function(){
				viewUser(userId,function(){
					if(!updateUserFormMode(0)){return;}
					$('#contentHolder').children().not('#usersListHolder').hide();
					$('#usersListHolder').show();
				});
			});
		})(data[i].userId);
	}
}

function viewUser(userId, returnButtonCallback){
	$('#viewUserHeader a.previous').click(returnButtonCallback);

	//Set the form to be in "view" mode by default
	updateUserFormMode(0);
	//$('#userFormCreateOrEdit').val("view");
	$('#viewUserEditButton a.edit .button').empty().append("Edit");
	//$('#userFormButton').addClass('disabled');
	
	var myObj = $('#userFormDiv');
	$('#viewUserDiv').append(myObj);
	myObj.show();
	retrieveUserIfNull(userId,function(userObject){
		$('#viewUserTitle').text("User: " + userObject.firstName + " " + userObject.lastName);
		$('input.newUserInput').val(null);
		$('span.newUserSpan').empty();
		$('select.newUserInput').val(0);
		populateUserForm(userObject);
	});
	$('#contentHolder').children().not('#viewUserHolder').hide();
	$('#viewUserHolder').show();
}

function buildUserObject(){
	var userToBuild = new Object();
	if($('#userFormFirstNameInput').val() && $('#userFormFirstNameInput').val() != ''){userToBuild.firstName = $('#userFormFirstNameInput').val();}
	if($('#userFormLastNameInput').val() && $('#userFormLastNameInput').val() != ''){userToBuild.lastName = $('#userFormLastNameInput').val();}
	if($('#userFormEmailAddressInput').val() && $('#userFormEmailAddressInput').val() != ''){userToBuild.email = $('#userFormEmailAddressInput').val();}
	if($('#userFormPhoneNumberInput').val() && $('#userFormPhoneNumberInput').val() != ''){userToBuild.phoneNumber = $('#userFormPhoneNumberInput').val();}
	if($('#userFormYearInitiatedInput').val() && $('#userFormYearInitiatedInput').val() != ''){userToBuild.yearInitiated = $('#userFormYearInitiatedInput').val();}
	if($('#userFormYearGraduatedInput').val() && $('#userFormYearGraduatedInput').val() != ''){userToBuild.yearGraduated = $('#userFormYearGraduatedInput').val();}
	if($('#userFormChapterInput').val() && $('#userFormChapterInput').val() != 0){userToBuild.chapterId = $('#userFormChapterInput').val();}
	if($('#userFormAssociateClassInput').val() && $('#userFormAssociateClassInput').val() != 0){userToBuild.associateClassId = $('#userFormAssociateClassInput').val();}
	if($('#userFormPinInput').val() && $('#userFormPinInput').val() != ''){userToBuild.pin = $('#userFormPinInput').val();}
	if($('#userFormLinkedInInput').val() && $('#userFormLinkedInInput').val() != ''){userToBuild.linkedInId = $('#userFormLinkedInInput').val();}
	if($('#userFormFacebookInput').val() && $('#userFormFacebookInput').val() != ''){userToBuild.facebookId = $('#userFormFacebookInput').val();}
	if($('#userFormTwitterInput').val() && $('#userFormTwitterInput').val() != ''){userToBuild.twitterId = $('#userFormTwitterInput').val();}
	if($('#userFormGoogleInput').val() && $('#userFormGoogleInput').val() != ''){userToBuild.googleAccountId = $('#userFormGoogleInput').val();}
	if($('#userFormHighschoolInput').val() && $('#userFormHighschoolInput').val() != ''){userToBuild.highschool = $('#userFormHighschoolInput').val();}
	if($('#userFormDateOfBirthInput').val() && $('#userFormDateOfBirthInput').val() != ''){userToBuild.dateOfBirth = $('#userFormDateOfBirthInput').val();}
	if($('#userFormUserIdInput').val() && $('#userFormUserIdInput').val() != ''){
		userToBuild.userId = $('#userFormUserIdInput').val();
	}
	userToBuild.userTypeId = $('#userFormUserTypeInput').val();
	return userToBuild;
}

function updateAfterUserEdit(data,responseHandler){
	console.log(data);
	userInfoByUserId[data.userId] = data;
	populateUserForm(data);
	updateUserFormMode(0);
}

function updateAfterUserCreate(data,responseHandler){
	console.log(data);
	userInfoByUserId[data.userId] = data;
	doNotification("User created with id = " + data.userId);
//	populateUserForm(data);
	$('#userFormDiv input').val(null);
	$('#userFormDiv select').prop("selectedIndex",0);
}

function populateUserForm(userObject){
	if(userObject.firstName){
		$('#userFormFirstNameInput').empty().val(userObject.firstName);
		$('#userFormFirstNameSpan').empty().append(userObject.firstName);
	}
	if(userObject.lastName){
		$('#userFormLastNameInput').empty().val(userObject.lastName);
		$('#userFormLastNameSpan').empty().append(userObject.lastName);
	}
	if(userObject.email){
		$('#userFormEmailAddressInput').empty().val(userObject.email);
		$('#userFormEmailAddressSpan').empty().append(userObject.email);
	}
	if(userObject.phoneNumber){
		$('#userFormPhoneNumberInput').empty().val(userObject.phoneNumber);
		$('#userFormPhoneNumberSpan').empty().append(userObject.phoneNumber);
	}
	if(userObject.yearInitiated){
		$('#userFormYearInitiatedInput').empty().val(userObject.yearInitiated);
		$('#userFormYearInitiatedSpan').empty().append(userObject.yearInitiated);
	}
	if(userObject.yearGraduated){
		$('#userFormYearGraduatedInput').empty().val(userObject.yearGraduated);
		$('#userFormYearGraduatedSpan').empty().append(userObject.yearGraduated);
	}
	if(userObject.associateClassId){
		$('#userFormAssociateClassInput').val(userObject.associateClassId);
		$('#userFormAssociateClassSpan').empty().append(associateClasses[userObject.associateClassId].name);
	}
	if(userObject.chapterId){
		$('#userFormChapterInput').val(userObject.chapterId);
		$('#userFormChapterSpan').empty().append(chapters[userObject.chapterId].name);
	}
	if(userObject.userTypeId){
		$('#userFormUserTypeInput').val(userObject.userTypeId);
		$('#userFormUserTypeSpan').empty().append(userTypes[userObject.userTypeId].name);
	}
	if(userObject.pin){
		$('#userFormPinInput').empty().val(userObject.pin);
		$('#userFormPinSpan').empty().append(userObject.pin);
	}
	if(userObject.googleAccountId){
		$('#userFormGoogleInput').empty().val(userObject.googleAccountId);
		$('#userFormGoogleSpan').empty().append(userObject.googleAccountId);
	}
	if(userObject.facebookId){
		$('#userFormFacebookInput').empty().val(userObject.facebookId);
		$('#userFormFacebookSpan').empty().append(userObject.facebookId);
	}
	if(userObject.linkedInId){
		$('#userFormLinkedInInput').empty().val(userObject.linkedInId);
		$('#userFormLinkedInSpan').empty().append(userObject.linkedInId);
	}
	if(userObject.twitterId){
		$('#userFormTwitterInput').empty().val(userObject.twitterId);
		$('#userFormTwitterSpan').empty().append(userObject.twitterId);
	}
	if(userObject.highschool){
		$('#userFormHighschoolInput').empty().val(userObject.highschool);
		$('#userFormHighschoolSpan').empty().append(userObject.highschool);
	}
	if(userObject.dateOfBirth){
		$('#userFormDateOfBirthInput').empty().val(userObject.dateOfBirth);
		$('#userFormDateOfBirthSpan').empty().append(userObject.dateOfBirth);
	}
	if(userObject.userId){
		$('#userFormUserIdInput').empty().val(userObject.userId);
	}
	
}

function updateUserFormMode(userFormMode){
	if(userFormMode == 0){
		if(tmpUserToEdit != null && !compareUsers(tmpUserToEdit,buildUserObject())){
			if(!confirm("User form has unsaved changes - do you want to continue?")){
				return false;
			}
		}
		$('#userFormDiv .userForm_create').hide();
		$('#userFormDiv .userForm_edit').hide();
		$('#userFormDiv .userForm_view').show();
		$('#userFormCreateOrEdit').val("view");
		$('#userFormButton').addClass('disabled');
		tmpUserToEdit = null;
	}else if(userFormMode == 1){
		tmpUserToEdit = buildUserObject();
		$('#userFormDiv .userForm_create').hide();
		$('#userFormDiv .userForm_view').hide();
		$('#userFormDiv .userForm_edit').show();
		$('#userFormCreateOrEdit').val("edit");
		$('#userFormButton').removeClass('disabled');
	}else if(userFormMode == 2){
		$('#userFormDiv .newUserSpan').empty();
		$('#userFormDiv input').val(null);
		$('#userFormDiv select').prop("selectedIndex",0);
		$('#userFormDiv .userForm_edit').hide();
		$('#userFormDiv .userForm_view').hide();
		$('#userFormDiv .userForm_create').show();
		$('#userFormCreateOrEdit').val("create");
		$('#userFormButton').removeClass('disabled');
	}else{
		console.log("Unknown mode for user form.");
	}
	return true;
}

function retrieveAndPopulateRecruitTable(){
	if(usersByType[5] == null || usersByType[5].length == 0){
		maxwellClient.getUsersByType(5, function(data, responseHandler){
			setUsersByType(5, data);
			populateRecruitTable();
		});
	}else{
		populateRecruitTable();
	}
}
function populateRecruitTable(){
	var data = usersByType[5];
	var recruitListText = '';
	for(var i = 0; i < data.length; i++){
		recruitListText += '<li id="recruitsListItem' + data[i]['userId'] + '" class="recruitsListItem"><div class="userTableFullName">' + data[i].firstName + ' ' + data[i].lastName + '</div></li>';
	}
	
	$('#recruitsNameList').empty().append(recruitListText);
	$('#recruitsNameList').find('li').click(function(){
		loadRecruitDetails($(this).attr('id').substring(16));
	});
	if(data.length != 0){
		loadRecruitDetails(data[0]['userId']);
		$('.addItemButtonHolder').show();
	}else{
		$('.addItemButtonHolder').hide();
	}
}
function populateRecruitmentPage(){
	maxwellClient.getUsersByType(5, function(data){
		var recruitListText = '';
		for(var i = 0; i < data.length; i++){
			recruitListText += '<li id="recruitsListItem' + data[i]['userId'] + '" class="recruitsListItem"><div class="userTableFullName">' + data[i].firstName + ' ' + data[i].lastName + '</div></li>';
		}
		if(data.length != 0){
			loadRecruitDetails(data[0]['userId']);
		}
		$('#recruitsNameList').empty().append(recruitListText);
	});
}
function loadRecruitDetails(recruitId){
	var recruitFirstBlurbCheck = false;
	var recruitSecondBlurbCheck = false;
	var recruitContactCheck = false;
	var recruitsCommentCheck = false;
	var recruitsDetailsHolder = $('#recruitsDetailsHolder');
	recruitsDetailsHolder.hide();
	$('#recruitsListItem' + recruitId + ' > div').css('border-right', '1px solid black');
	$('li.recruitsListItem').removeClass('selectedRecruitListItem');
	$('#recruitsListItem' + recruitId).addClass('selectedRecruitListItem');
	$('#recruitBlurbUserData, #recruitBlurbRecruitData, #recruitsContactHistoryListHolder, #recruitCommentsHolder').children().not('#recordRecruitContactHolder, #addRecruitCommentHolder, .addItemButtonHolder, .addItemHolder').remove();
	$('.addItemButtonHolder, .addItemHolder').removeAttr('style');
	$('.addItemHolder').find('input, textarea').val('');
	retrieveUserIfNull(recruitId,function(userObject){
		var userDetails = '<div id="recruitTopDivision" class="wiz-buttons"><div id="recruitName">' + userObject.firstName + ' ' + userObject.lastName + '</div>';
		userDetails += '<input type="hidden" id="recruitUserId" value="' + userObject.userId +'"/>';
		if(userObject.facebookId){userDetails +='<a href="' + userObject.facebookId + '" target="_blank"><div class="recruitFacebookIcon recruitSocialIcon"></div>';}
		if(userObject.linkedInId){userDetails +='<a href="' + userObject.linkedInId + '" target="_blank"><div class="recruitLinkedInIcon recruitSocialIcon"></div>';}
		if(userObject.twitterId){userDetails +='<a href="' + userObject.twitterId + '" target="_blank"><div class="recruitTwitterIcon recruitSocialIcon"></div>';}
		if(userObject.googleAccountId){userDetails +='<a href="' + userObject.googleAccountId + '" target="_blank"><div class="recruitGoogleIcon recruitSocialIcon"></div>';}
		userDetails += '<div class="editRecruitUserInfoButton"><a class="edit" id="editRecruit' + recruitId + 'Button"><span class="button">Edit User</span></a></div>';
		userDetails += '</div><div id="recruitMiddleDivision">';
		if(userObject.phoneNumber){userDetails +='<div class="recruitPhoneNumber" title="' + userObject.phoneNumber + '"><a href="tel:' + userObject.phoneNumber + '">' + userObject.phoneNumber + '</a></div>';}
		if(userObject.email){userDetails +='<div class="recruitEmailAddress"><a href="mailto:' + userObject.email + '">' + userObject.email + '</a></div>';}
		userDetails += '</div><div id="recruitBottomDivision">';
		if(userObject.dateOfBirth){userDetails +='<div class="recruitDOBLabelHolder"><span class="recruitDOBLabel">DOB:</span> ' + userObject.dateOfBirth + '</div>';}
		if(userObject.highschool){userDetails +='<div class="recruitHSLabelHolder"><span class="recruitHSLabel">HS:</span> ' + userObject.highschool + '</div>';}
		userDetails += '</div>';
		$('#recruitBlurbUserData').append(userDetails);
		$('#editRecruit' + recruitId + 'Button').click(getCurrentRecruitUserIdAndViewUser);
		recruitFirstBlurbCheck = true;
		//showRecruitDetails();
	});
	//maxwellClient.getRecruitInfoByUserId(recruitID, function(data){
	retrieveRecruitInfoIfNull(recruitId, function(recruitObject){
		var normalTab = '&nbsp;&nbsp;&nbsp;&nbsp;';
		var recruitDetails = '<div class="recruitDivider"></div><div id="recruitInfoAreaTop"><div class="recruitSmallLabel">Source:<br /><div class="recruitLargeData">' + normalTab + recruitSources[recruitObject.recruitSourceId].name +'</div></div>' +
		'<div class="recruitSmallLabel">Involvement Level:<br /><div class="recruitLargeData">' + normalTab + recruitEngagementLevels[recruitObject.recruitEngagementLevelId].engagementLevel + '</div></div>';
		if(recruitObject.classStanding){recruitDetails += '<div class="recruitSmallLabel">Class:<br /><div class="recruitLargeData">' + normalTab + recruitObject.classStanding + '</div></div>';}
		if(recruitObject.dateAdded){recruitDetails += '<div class="recruitSmallLabel">dateAdded:<br /><div class="recruitLargeData">' + normalTab + recruitObject.dateAdded + '</div></div>';}
		if(recruitObject.gpa){recruitDetails += '<div class="recruitSmallLabel">GPA:<br /><div class="recruitLargeData">' + normalTab + recruitObject.gpa + '</div></div>';}
		if(recruitObject.rushListUserId){recruitDetails += '<div class="recruitSmallLabel">Rush List ID:<br /><div class="recruitLargeData">' + normalTab + recruitObject.rushListUserId + '</div></div>';}
		recruitDetails += '</div><div id="recruitInfoAreaBottom">';
		if(recruitObject.lifeExperiences){recruitDetails += '<div class="recruitSmallLabel">lifeExperiences:<br /><div class="recruitLargeData">' + normalTab + recruitObject.lifeExperiences + '</div></div>';}
		if(recruitObject.lookingFor){recruitDetails += '<div class="recruitSmallLabel">lookingFor:<br /><div class="recruitLargeData">' + normalTab + recruitObject.lookingFor + '</div></div>';}
		if(recruitObject.expectations){recruitDetails += '<div class="recruitSmallLabel">expectations:<br /><div class="recruitLargeData">' + normalTab + recruitObject.expectations + '</div></div>';}
		if(recruitObject.extracurriculars){recruitDetails += '<div class="recruitSmallLabel">extracurriculars:<br /><div class="recruitLargeData">' + normalTab + recruitObject.extracurriculars + '</div></div>';}
		$('#recruitBlurbRecruitData').append(recruitDetails);
		recruitSecondBlurbCheck = true;
		//showRecruitDetails();
	});
	maxwellClient.getRecruitContactHistoryByRecruitUserId(recruitId, function(data){
		if(data.length == 0){
			$('#recruitsContactHistoryListHolder').prepend('<div>Recruit has not been contacted yet.</div>');
		}else{
			var recruitContactUL = $('<ul id="recruitsContactHistoryList"></ul>');
			var recruitContactors = [];
			var recruitListText = '';
			for(var i = 0; i < data.length; i++){
				var contactTypeClass = null;
				recruitListText += '<li id="recruitComment-' + this.recruitCommentId + '">';
				if(data[i]['recruitContactTypeId'] == 1){
					contactTypeClass = 'Text';
				}else if(data[i]['recruitContactTypeId'] == 2){
					contactTypeClass = 'Email';
				}else if(data[i]['recruitContactTypeId'] == 3){
					contactTypeClass = 'SocialMedia';
				}else if(data[i]['recruitContactTypeId'] == 4){
					contactTypeClass = 'Phone';
				}else if(data[i]['recruitContactTypeId'] == 5){
					contactTypeClass = 'Voicemail';
				}
				recruitListText += '<div class="contactVia' + contactTypeClass + ' contactViaIcon" title="Via ' + contactTypeClass + '"></div><div class="recruitContactInnerHolder"><div class="contactHeader"><span class="recruitContactor recruitContactorUserId-' + data[i]['recruitContactorUserId'] + '">loading....</span> via ' + recruitContactTypes[data[i]['recruitContactTypeId']].name + ' at ' + data[i]['contactTimestamp'] + '</div>' +
				'<div class="recruitContactNote">' + (data[i]['notes'] == null ? '' : data[i]['notes']) + '</div>' +
				'</div></li>';

				if($.inArray(data[i]['recruitContactorUserId'], recruitContactors) == -1){
					recruitContactors.push(data[i]['recruitContactorUserId']);
				}
			}
			recruitContactUL.append(recruitListText);
			$('#recruitsContactHistoryListHolder').prepend(recruitContactUL);
			//$('#recordRecruitContactButton').click(recordRecruitContact);
			$('#recruitsContactHistoryListHolder').find('.addItemButtonHolder').click(function(){
				$(this).animate({
					top: '-40px'
				}, 250, function(){
					$('#recruitsContactHistoryListHolder').find('.addItemHolder').animate({
						top: '0px'
					}, 250);
				});
			});

			for(var i = 0; i < recruitContactors.length; i++){
				retrieveUserIfNull(recruitContactors[i],function(userObject){
					$('.recruitContactorUserId-' + userObject['userId']).text(userObject.firstName + ' ' + userObject.lastName);
				});
			}
		}
		recruitContactCheck = true;
		//showRecruitDetails();
	});
	maxwellClient.getRecruitCommentsByRecruitUserId(recruitId, function(data, responseHandler){
		if(data == null || data.length == 0){
			$('#recruitCommentsHolder').prepend('<div>There are no comments about this recruit yet.</div>');
		}else{
			var recruitCommentsUL = $('<ul id="recruitCommentsList"></ul>');

			$('#recruitCommentsHolder').prepend(recruitCommentsUL);
			$(data).each(function(index){
				var recruitCommentId = this.recruitCommentId;
				recruitCommentId2 = this.recruitCommentId;
				
				var recruitCommentText = '<li class="recruitCommentItem" id="recruitComment-' + this.recruitCommentId + '">' +
				'<div class="recruitCommentImage"></div>' +
				'<div class="recruitCommentInnerHolder"><div class="commentHeader"><span class="commentUser">' + this.commenterUserId + '</span> at ' + this.dateCreated + '</div>' +
				'<div class="recruitCommentActual">' + this.comment + '</div>' +
				'</div></li>';
				
				$('#recruitCommentsList').append(recruitCommentText);


				retrieveUserIfNull(this.commenterUserId, function(userObject){
					var myObj = $('#recruitComment-' + recruitCommentId + ' .commentUser');
					myObj.text(userObject.firstName + ' ' + userObject.lastName);
				});
			});
		}
		recruitsCommentCheck = true;
		showRecruitDetails(recruitId);
	});
}
function showRecruitDetails(recruitId){
	//if(recruitFirstBlurbCheck && recruitSecondBlurbCheck && recruitContactCheck && recruitsCommentCheck){
		var selectedRecruit = $('.selectedRecruitListItem');
		var recruitsDetailsHolder = $('#recruitsDetailsHolder');
		recruitsDetailsHolder.css('opacity', 0).show();
		//Stretches the box to line up with a user if the user is low on the list.
		if(selectedRecruit.offset().top + selectedRecruit.height() > recruitsDetailsHolder.offset().top + recruitsDetailsHolder.height()){
			recruitsDetailsHolder.css('height', selectedRecruit.offset().top + selectedRecruit.height() - recruitsDetailsHolder.offset().top);
		}
		recruitsDetailsHolder.css('opacity', 1);
		$('#recruitsListItem' + recruitId + ' > div').css('border-right', '');
		$('html, body').animate({scrollTop:0}, 'slow');
	//}
}
function getCurrentRecruitUserIdAndViewUser(){
	var currentRecruitUserId = $('#recruitUserId').val();
	viewUser(currentRecruitUserId, function(){
		$('#contentHolder').children().not('#recruitmentPageHolder').hide();
		$('#recruitmentPageHolder').show();
		populateRecruitTable();
		loadRecruitDetails(currentRecruitUserId);
	});
}
function setNewUserValues(editUser){
	if($('#referredByMemberInput').children().length != 0){
		$('#referredByMemberInput').chosen();
		$('#referredByMemberInput').parent().show();
	}else{
		$('#referredByMemberInput').parent().hide();
	}
	
	if(editUser){
		$('#submitNewUserButton').click(editUser);
	}else{
		$('#submitNewUserButton').click(submitUser);
	}
	
	/*$('#associateClassInput').chosen().change(function(){
		console.log($(this).val())
	});*/
}
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
	}else if($('#userTypeInput').val() == 5){
		if($('#associateClassInput').val() != 0){
			console.log("Recruits may not have an Associate Class.");
			errorList.push("Recruits may not have an Associate Class.");
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

	if(errorList.length > 0){
		var errorString = "Please resolve the following profile issues: \n";
		for(var i = 0; i < errorList.length; i++){
			errorString += (i+1) + ": " + errorList[i] + "\n";
		}
		alert(errorString);
	}else{
		maxwellClient.createUser(userData, function(data, responseHandler){
			console.log(data);
			$('#submitNewUserButton').unbind('click');
		});
	}
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
function recordRecruitContact(){
	var notes = $('#contactNotes').val();
	var recruitContactObject = new Object();
	console.log("DO FORM VALIDATION");
	recruitContactObject.recruitUserId = $('#recruitUserId').val();
	recruitContactObject.recruitContactorUserId = phiAuthClient.tokenResponse.userId;
	recruitContactObject.contactTimestamp = parseInt(new Date().getTime()/1000);
	recruitContactObject.recruitContactTypeId = $('#contactTypeInput').val();
	recruitContactObject.notes = notes.length < 1 ? null : notes;
	maxwellClient.recordRecruitContact(recruitContactObject, function(responseObject, responseHandler){
		console.log(responseObject);
		$('#contactNotes').val('');
		loadRecruitDetails(recruitContactObject.recruitUserId);
	});
}
function addRecruitComment(){
	var comment = $('#recruitComment').val();
	var recruitCommentObject = new Object();
	if(!comment || comment.length < 1){
		alert("Comment may not be null.");
		return;
	}
	recruitCommentObject.recruitUserId = $('#recruitUserId').val();
	recruitCommentObject.commenterUserId = phiAuthClient.tokenResponse.userId;
	recruitCommentObject.comment = comment;
	console.log(recruitCommentObject);
		maxwellClient.addRecruitComment(recruitCommentObject, function(responseObject, responseHandler){
		console.log(responseObject);
		$('#recruitComment').val('');
		loadRecruitDetails(recruitCommentObject.recruitUserId);
	});
}

//TODO: It might actually be possible to genericize many of these setters with a 2-param function (currArray, newArray)
/*********************************************************************************************
*************************** Cache-friendly Metadata setters **********************************
**********************************************************************************************/
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
function setRecruitSources(recruitSources){
	var tempOnChange = this.recruitSources.onChange;
	this.recruitSources = recruitSources;
	this.recruitSources.onChange = tempOnChange;
	triggerMetadataOnChangeHandlers(this.recruitSources);
}
function setUsersByType(userTypeId, users){
	if(this.usersByType[userTypeId] != null){
		var tempOnChange = this.usersByType[userTypeId].onChange;
	}else{
		tempOnChange = null;
	}
	this.usersByType[userTypeId] = users;
	this.usersByType[userTypeId].onChange = tempOnChange;
	triggerMetadataOnChangeHandlers(this.usersByType[userTypeId]);
}
/**
 * We have an interesting situation where we purposely don't pull full info for each user at startup
 * However, that means we need to be retrieving that info at runtime where necessary.
 * The cost of making this call could become prohibitive if we're doing it repeatedly.
 * This method basically acts as a pass-through for a callback, which is why it's generic.
 * It's only function is to check for an existing user object, if-null pull it down, and then trigger the provided callback.
 * @param userId - The id of the user we need more info about 
 * @param additionalCallback - the function to trigger after deciding we have up-to-date info, or pulling new info
 */
function retrieveUserIfNull(userId, additionalCallback){
	if(this.userInfoByUserId[userId] != null){
		additionalCallback(this.userInfoByUserId[userId]);
	}else{
		maxwellClient.getUserById(userId, function(data, responseHandler){
			this.userInfoByUserId[userId] = data;
			additionalCallback(this.userInfoByUserId[userId]);
		});
	}
}
/**
 * SEE: comments from retrieveUserIfNull(userId, additionalCallback)
 * @param userId - The id of the user we need recruit info about
 * @param additionalCallback -  the function to trigger after deciding we have up-to-date info, or pulling new info
 */
function retrieveRecruitInfoIfNull(userId, additionalCallback){
	if(this.recruitInfoByUserId[userId] != null){
		additionalCallback(this.recruitInfoByUserId[userId]);
	}else{
		maxwellClient.getRecruitInfoByUserId(userId, function(data, responseHandler){
			this.recruitInfoByUserId[userId] = data;
			additionalCallback(this.recruitInfoByUserId[userId]);
		});
	};
}
function setRefreshTokenCookie(value){
	var exdate=new Date();
	exdate.setDate(exdate.getDate() + 1);
	var c_value=escape(value) + "; expires="+exdate.toUTCString();
	document.cookie="RefreshToken=" + c_value;
}
function getRefreshTokenCookie(){
	var i,x,y,ARRcookies=document.cookie.split(";");
	for (i=0;i<ARRcookies.length;i++)
	{
		x=ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y=ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x=x.replace(/^\s+|\s+$/g,"");
		if (x=="RefreshToken")
		{
			console.log(y);
			return unescape(y);
		}
	}
}

function loadPageVar (sVar) {
  return unescape(window.location.search.replace(new RegExp("^(?:.*[&\\?]" + escape(sVar).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

function doNotification(notification, isError){
	if(isError){
		$('#notificationBar').addClass('errorNotification');
	}else{
		$('#notificationBar').removeClass('errorNotification');
	}
	$('#notificationBarText').html(notification);
	$('#notificationBar').show();
}

function hideNotification(){
	$('#notificationBarText').empty();
	$('#notificationBar').hide();
}

function compareUsers(user1, user2){
	if(user1.firstName != user2.firstName){
		return false;
	}
	if(user1.lastName != user2.lastName){
		return false;
	}
	if(user1.email != user2.email){
		return false;
	}
	if(user1.phoneNumber != user2.phoneNumber){
		return false;
	}
	if(user1.yearGraduated != user2.yearGraduated){
		return false;
	}
	if(user1.yearInitiated != user2.yearInitiated){
		return false;
	}
	if(user1.chapter != user2.chapter){
		return false;
	}
	if(user1.associateClassId != user2.associateClassId){
		return false;
	}
	if(user1.pin != user2.pin){
		return false;
	}
	if(user1.linkedInId != user2.linkedInId){
		return false;
	}
	if(user1.facebookId != user2.facebookId){
		return false;
	}
	if(user1.twitterId != user2.twitterId){
		return false;
	}
	if(user1.googleAccountId != user2.googleAccountId){
		return false;
	}
	if(user1.highschool != user2.highschool){
		return false;
	}
	if(user1.dateOfBirth != user2.dateOfBirth){
		return false;
	}
	if(user1.userTypeId != user2.userTypeId){
		return false;
	}
	return true;
}
function viewRecruitmentLandingPage(){
	$('#contentHolder').children().not('#recruitmentLandingPage').hide();
	$('#recruitmentLandingPage').show();
	recentlyUpdatedRecruits = mockRecentlyUpdatedRecruits;
	populateRecentlyUpdatedRecruits();
}
function populateRecentlyUpdatedRecruits(){
	var holder = $('#recruitmentLandingPage > div.topLeftQuadrant > div.landingPageQuadrantContent');
	holder.empty();
	//var content = '';
	for(var i=0; i < recentlyUpdatedRecruits.length; i++){
		var content = '';
		var updatedRecruit = recentlyUpdatedRecruits[i];
		console.log(recentlyUpdatedRecruits[i]);
		content += '<div class="recentlyUpdatedRecruitEntry">';
		content += '<div class="newOrEdited">';
		if(updatedRecruit.userDateModified > 0 || updatedRecruit.recruitDateModified > 0){
			content += 'Edited';
		}else{
			content += 'New';
		}
		content += '</div>';
		content += '<div class="name"><a id="recentlyUpdatedRecruit_user' + updatedRecruit.userId + '">' + updatedRecruit.firstName + ' ' + updatedRecruit.lastName + '</a></div>';
		content += '<div class="recruitEngagementLevel">' + recruitEngagementLevels[updatedRecruit.recruitEngagementLevelId].engagementLevel + '</div>';
		content += '</div>';
		holder.append(content);
		
		

		(function(userId){
			var viewUserLink = $('#recentlyUpdatedRecruit_user' + updatedRecruit.userId);
			viewUserLink.click(function(){
				$('#contentHolder').children().not('#recruitmentPageHolder').hide();
				$('#recruitmentPageHolder').show();
				retrieveAndPopulateRecruitTable();
				loadRecruitDetails(userId);
			});
		})(updatedRecruit.userId);
	}
	//holder.html(content);
	

}