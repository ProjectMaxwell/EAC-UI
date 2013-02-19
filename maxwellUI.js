associateClasses = [];
chapters = [];
userTypes = [];
metadataOnChangeEvents = [];

$(document).ready(function(){
	initialSetup();
	
});
function initialSetup(){
	maxwellClient = new MaxwellClient("http://evergreenalumniclub.com:7080/ProjectMaxwell/rest");
	initializeOnChangeHandlers();
	initializeMetadata();
	$('#newUser').click(function(){
		$('#usersListHolder').hide();
		$('#newEACMeetingHolder').hide();
		setNewUserValues();
		getNewUserData();
		$('#createUsersHolder').show();
	});
	$('#usersList').click(function(){
		$('#createUsersHolder').hide();
		$('#newEACMeetingHolder').hide();
		populateUserTable();
		$('#usersListHolder').show();
	});
	$('#userTableTypeSelect').change(function(){
		populateUserTable();
	});
	$('#newEACMeeting').click(function(){
		$('#createUsersHolder').hide();
		$('#usersListHolder').hide();
		$('#newEACMeetingHolder').show();
	});
	$('#submitEventButton').click(createEACMeeting);
}
function initializeOnChangeHandlers(){
	//Associate Class event handlers
	associateClasses.onChange = [];
	associateClasses.onChange[0] = function(){ 
		var associateClassString = '';
		for(var i = 0; i < associateClasses.length; i++){
			var associateClassObject = associateClasses[i];
			if(associateClassObject !== undefined){
				associateClassString += '<option value="' + associateClassObject.associateClassId + '">' + associateClassObject.name + '</option>';
			}else{
				console.log("Associate class object was undefined.");
			}
		}
		//console.log(associateClassString);
		//associateClassString += '<option value="' + data[i]['associateClassId'] + '" selected>' + data[i]['name'] + '</option>';
		$('#associateClassInput').html(associateClassString);
		/*.chosen().change(function(){
			var currSelected = $(this).children('[value="' + $(this).val() + '"]').text();
		});*/
		$("#associateClassInput").val(associateClasses.length -1);
	};
	
	//Chapter event handlers
	chapters.onChange = [];
	chapters.onChange[0] = function(){ 
		var chapterString = '';
		for(var i = 0; i < chapters.length; i++){
			var chapterObject = chapters[i];
			if(chapterObject !== undefined){
				chapterString += '<option value="' + chapterObject.chapterId + '">' + chapterObject.name + '</option>';
			}else{
				console.log("Chapter object was undefined.");
			}
		}
		//console.log(chapterString);
		//chapterString += '<option value="' + data[i]['chapterId'] + '" selected>' + data[i]['name'] + '</option>';
		$('#chapterNameInput').html(chapterString);
		/*.chosen().change(function(){
			var currSelected = $(this).children('[value="' + $(this).val() + '"]').text();
		});*/
		$("#chapterNameInput").val(41);
	};
	
	//UserType event handlers
	userTypes.onChange = [];
	userTypes.onChange[0] = function(){ 
		var userTypeString = '';
		for(var i = 0; i < userTypes.length; i++){
			var userTypeObject = userTypes[i];
			if(userTypeObject !== undefined){
				userTypeString += '<option value="' + userTypeObject.userTypeId + '">' + userTypeObject.name + '</option>';
			}else{
				console.log("UserType object was undefined.");
			}
		}
		//console.log(userTypeString);
		//userTypeString += '<option value="' + data[i]['userTypeId'] + '" selected>' + data[i]['name'] + '</option>';
		$('#userTypeInput').html(userTypeString);
		/*.chosen().change(function(){
			var currSelected = $(this).children('[value="' + $(this).val() + '"]').text();
		});*/
		$("#userTypeInput").val(41);
	};
}
function triggerMetadataOnChangeHandlers(object){
	for(var i = 0; i < object.onChange.length; i++){
		object.onChange[i]();
	}
}
function initializeMetadata(){
	maxwellClient.getAssociateClasses(function(data){
		var tempAssociateClassArray = [];
		for(var i = 0; i < data.length; i++){
			tempAssociateClassArray[data[i].associateClassId] = data[i];
			//addAssociateClassMapping(data[i].associateClassId,data[i]);
		}
		setAssociateClasses(tempAssociateClassArray);
	});
	maxwellClient.getChapters(function(data){
		var tempChapterArray = [];
		for(var i = 0; i < data.length; i++){
			tempChapterArray[data[i].chapterId] = data[i];
			//addChapterMapping(data[i].chapterId,data[i]);
		}
		setChapters(tempChapterArray);
	});
	maxwellClient.getUserTypes(function(data){
		var tempUserTypeArray = [];
		for(var i = 0; i < data.length; i++){
			tempUserTypeArray[data[i].userTypeId] = data[i];
			//addUserTypeMapping(data[i].userTypeId,data[i]);
		}
		setUserTypes(tempUserTypeArray);
	});
}
function getNewUserData(){
	//getDatas({'associateClass': true});
	//getDatas({'userTypes': true});
	//getDatas({'chapters': true});
	getDatas({'referredBy': true, referredByID: 1});
	getDatas({'referredBy': true, referredByID: 2});
	getDatas({'referredBy': true, referredByID: 3});
}
function populateUserTable(){
	/*	var getURL = "http://evergreenalumniclub.com:7080/ProjectMaxwell/rest/users?";
	$.getJSON(getURL + 'userType=' + $('#userTableTypeSelect').val())
	.success(function(data){
		console.log(data);
		var newUserText = '';
		for(var i = 0; i < data.length; i++){
			newUserText += '<tr><td><div class="userTableFullName">' + data[i].firstName + ' ' + data[i].lastName + '</div></td>' +
			'<td><div class="userTableAssociateClass">classID ' + data[i].associateClassId + '</div></td>' +
			'<td><divclass="userTableEmailAddy">' + data[i].email + '</div></td>' +
			'<td><div class="userTablePhoneNumber">520-977-3126</div></td></tr>';
		}
		$('#usersListBody').empty().append(newUserText);
	}).error(function(data){
		console.log('fail');
		console.log(data);
	});*/
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
			errorList.push("Undergrads must have an Associate Class.")
		}else{
			userData['associateClassId'] = $('#associateClassInput').val()
		}
	}else{
		userData['associateClassId'] = $('#associateClassInput').val()
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

	if(errorList.length == 0){
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
	}else{
		var errorString = "Fix yo goddamn shit: \n";
		for(var i = 0; i < errorList.length; i++){
			errorString += (i+1) + ": " + errorList[i] + "\n";
		}
		alert(errorString);
	}
}
function getUserToken(userData, pinNumber, passwordWord){
	var tokenDeets = {
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
	});
}
function postDatas(userData, accessToken){
	userData = JSON.stringify(userData);
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
	});
}
function createEACMeeting(){
	var eventDate = $('#eventDate').val();
	var eventLocation = $('#eventLocation').val();
	var eventMapLink = $('#eventGoogleMaps').val();
	var eventWebSite = $('#eventWebsite').val();
	var eacObject = new Object();
	eacObject.location = eventLocation;
	eacObject.date = eventDate;
	eacObject.googleMaps = eventMapLink;
	eacObject.website = eventWebSite;
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