$(document).ready(function(){
	initialSetup();
	
});
function initialSetup(){
	$('#newUser').click(function(){
		$('#usersListHolder').hide();
		setNewUserValues();
		getNewUserData();
		$('#createUsersHolder').show();
	});
	$('#usersList').click(function(){
		$('#createUsersHolder').hide();
		populateUserTable();
		$('#usersListHolder').show();
	});
	$('#userTableTypeSelect').change(function(){
		populateUserTable();
	});
}
function getNewUserData(){
	getDatas({'associateClass': true});
	getDatas({'userTypes': true});
	getDatas({'chapters': true});
	getDatas({'referredBy': true, referredByID: 1});
	getDatas({'referredBy': true, referredByID: 2});
	getDatas({'referredBy': true, referredByID: 3});
}
function populateUserTable(){
	var getURL = "http://evergreenalumniclub.com:7080/ProjectMaxwell/rest/users?";
	$.getJSON(getURL + 'userType=' + $('#userTableTypeSelect').val())
	.success(function(data){
		console.log(data);
	}).error(function(data){
		console.log('fail');
		console.log(data);
	})
	var newUserText = '<tr><td><div class="userTableFullName">Jowel Shapio</div></td>' +
		'<td><div class="userTableAssociateClass">Chi Omega</div></td>' +
		'<td><divclass="userTableEmailAddy">JowelShapio@email.net</div></td>' +
		'<td><div class="userTablePhoneNumber">520-977-3126</div></td></tr>';
	$('#usersListBody').empty().append(newUserText);
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