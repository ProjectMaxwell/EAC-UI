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

$(document).ready(function(){
	initialSetup();
	$("#loginPane").lightbox_me();
	joelLogin();
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
		retrieveAndPopulateRecruitTable();
		$('#recruitmentPageHolder').show();
	});
	$('#recruitsDetailsHolder').hide();
	$('#submitEventButton').click(createEACMeeting);
	$('#recordRecruitContactButton').click(recordRecruitContact);
	$('#addRecruitCommentButton').click(addRecruitComment);
	$('#submitPasswordLoginButton').click(doLoginByPassword);
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
			setUsersByType(userType, data);
			populateUserTable(userType);
		});
	}else{
		populateUserTable(userType);
	}
}
/*function populateUserTable(){
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
	
}*/
function populateUserTable(userType){
	var data = usersByType[userType];
	var newUserText = '';
	for(var i = 0; i < data.length; i++){
		var associateClassId = data[i].associateClassId == null ? '' : data[i].associateClassId;
		var email = data[i].email == null ? '' : data[i].email;
		newUserText += '<tr><td><div class="userTableFullName">' + data[i].firstName + ' ' + data[i].lastName + '</div></td>' +
		'<td><div class="userTableAssociateClass">' + associateClasses[associateClassId].name + '</div></td>' +
		'<td><div class="userTableEmailAddy">' + email + '</div></td>' +
		'<td><div class="userTablePhoneNumber">520-977-3126</div></td></tr>';
	}
	$('#usersListBody').empty().append(newUserText);
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
		recruitListText += '<li id="recruitsListItem' + data[i]['userId'] + '" class="recruitsListItem" onClick="loadRecruitDetails(' + data[i]['userId'] + ');"><div class="userTableFullName">' + data[i].firstName + ' ' + data[i].lastName + '</div></li>';
	}
	/*if(data.length != 0){
		loadRecruitDetails(data[0]['userId']);
	}*/
	$('#recruitsNameList').empty().append(recruitListText);
}
function populateRecruitmentPage(){
	maxwellClient.getUsersByType(5, function(data){
		var recruitListText = '';
		for(var i = 0; i < data.length; i++){
			console.log
			recruitListText += '<li id="recruitsListItem' + data[i]['userId'] + '" class="recruitsListItem"><div class="userTableFullName">' + data[i].firstName + ' ' + data[i].lastName + '</div></li>';
		}
		if(data.length != 0){
			loadRecruitDetails(data[0]['userId']);
		}
		$('#recruitsNameList').empty().append(recruitListText);
	});
}
function loadRecruitDetails(recruitId){
	$('li.recruitsListItem').removeClass('selectedRecruitListItem');
	$('#recruitsListItem' + recruitId).addClass('selectedRecruitListItem');
	$('#recruitsDetailsHolder').show();
	$('#recruitBlurbUserData, #recruitBlurbRecruitData, #recruitsContactHistoryListHolder, #recruitCommentsHolder').children().not('#recordRecruitContactHolder, #addRecruitCommentHolder, .addItemButtonHolder, .addItemHolder').remove();
	retrieveUserIfNull(recruitId,function(userObject){
		var userDetails = '<div id="recruitTopDivision"><div id="recruitName">' + userObject.firstName + ' ' + userObject.lastName + '</div>';
		userDetails += '<input type="hidden" id="recruitUserId" value="' + userObject.userId +'"/>';
		if(userObject.facebookId){userDetails +='<a href="' + userObject.facebookId + '" target="_blank"><div class="recruitFacebookIcon recruitSocialIcon"></div>';}
		if(userObject.linkedInId){userDetails +='<a href="' + userObject.linkedInId + '" target="_blank"><div class="recruitLinkedInIcon recruitSocialIcon"></div>';}
		if(userObject.twitterId){userDetails +='<a href="' + userObject.twitterId + '" target="_blank"><div class="recruitTwitterIcon recruitSocialIcon"></div>';}
		if(userObject.googleAccountId){userDetails +='<a href="' + userObject.googleAccountId + '" target="_blank"><div class="recruitGoogleIcon recruitSocialIcon"></div>';}
		userDetails += '</div><div id="recruitMiddleDivision">';
		if(userObject.phoneNumber){userDetails +='<div class="recruitPhoneNumber" title="' + userObject.phoneNumber + '"><a href="tel:' + userObject.phoneNumber + '">' + userObject.phoneNumber + '</a></div>';}
		if(userObject.email){userDetails +='<div class="recruitEmailAddress"><a href="mailto:' + userObject.email + '">' + userObject.email + '</a></div>';}
		userDetails += '</div><div id="recruitBottomDivision">';
		if(userObject.dateOfBirth){userDetails +='<div class="recruitDOBLabelHolder"><span class="recruitDOBLabel">DOB:</span> ' + userObject.dateOfBirth + '</div>';}
		if(userObject.highschool){userDetails +='<div class="recruitHSLabelHolder"><span class="recruitHSLabel">HS:</span> ' + userObject.highschool + '</div>';}
		userDetails += '</div>';
		$('#recruitBlurbUserData').append(userDetails);
	});
	//maxwellClient.getRecruitInfoByUserId(recruitID, function(data){
	retrieveRecruitInfoIfNull(recruitId, function(recruitObject){
		var normalTab = '&nbsp;&nbsp;&nbsp;&nbsp;'
		var recruitDetails = '<div class="recruitDivider"></div><div id="recruitInfoAreaTop"><div class="recruitSmallLabel">Source:<br /><div class="recruitLargeData">' + normalTab + recruitSources[recruitObject.recruitSourceId].name +'</div></div>' +
		'<div class="recruitSmallLabel">Defcon:<br /><div class="recruitLargeData">' + normalTab + recruitEngagementLevels[recruitObject.recruitEngagementLevelId].engagementLevel + '</div></div>';
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
	});
	maxwellClient.getRecruitContactHistoryByRecruitUserId(recruitId, function(data){
		if(data.length == 0){
			$('#recruitsContactHistoryListHolder').prepend('<div>Recruit has not been contacted yet.</div>');
		}else{
			var recruitContactUL = $('<ul id="recruitsContactHistoryList"></ul>');
			var recruitListText = '';
			var recruitContactors = [];
			var recruitListText = '';
			for(var i = 0; i < data.length; i++){
				recruitListText += '<li id="recruitComment-' + this.recruitCommentId + '">';
				if(data[i]['recruitContactTypeId'] == 1){
					var contactTypeClass = 'Text';
				}else if(data[i]['recruitContactTypeId'] == 2){
					var contactTypeClass = 'Email';
				}else if(data[i]['recruitContactTypeId'] == 3){
					var contactTypeClass = 'SocialMedia';
				}else if(data[i]['recruitContactTypeId'] == 4){
					var contactTypeClass = 'Phone';
				}else if(data[i]['recruitContactTypeId'] == 5){
					var contactTypeClass = 'Voicemail';
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
			$('#recordRecruitContactButton').click(recordRecruitContact);
			$('#recruitsContactHistoryListHolder').find('.addItemButtonHolder').click(function(){
				console.log('click')
				$(this).animate({
					top: '-40px'
				}, 250, function(){
					$('#recruitsContactHistoryListHolder').find('.addItemHolder').animate({
						top: '0px'
					}, 250);
				});
			})
			for(var i = 0; i < recruitContactors.length; i++){
				retrieveUserIfNull(recruitContactors[i],function(userObject){
					$('.recruitContactorUserId-' + userObject['userId']).text(userObject.firstName + ' ' + userObject.lastName);
				});
			}
		}
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
	});
}
function setNewUserValues(){
	$('#referredByMemberInput').chosen();
	$('#kittenSubmitButton').click(submitUser);
	/*$('#associateClassInput').chosen().change(function(){
		console.log($(this).val())
	});*/
}
/*function getDatas(dataOptions){
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
}*/

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
	recruitContactObject.contactTimestamp = $('#contactTimestampInput').val();
	recruitContactObject.recruitContactTypeId = $('#contactTypeInput').val();
	recruitContactObject.notes = notes.length < 1 ? null : notes;
	console.log(recruitContactObject);
		maxwellClient.recordRecruitContact(recruitContactObject, function(responseObject, responseHandler){
		console.log(responseObject);
		$('.recordRecruitContactInput').val('');
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
		$('.recordRecruitCommentInput').val('');
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
	}
}
function joelLogin(){
	$('#loginFormUsername').val(85940);
	$('#loginFormPassword').val("password");
	$('#submitPasswordLoginButton').click();
	setTimeout(function(){
		loadRecruitDetails(78);
	}, 2000);
}