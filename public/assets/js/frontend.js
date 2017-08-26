//Global scripts

$(document).ready(function(){
	$('[data-toggle="tooltip"]').tooltip(); 
});

$('#goToCampaign').submit(function( e ) {
	//console.log($(this).data-appointment-id);
	e.preventDefault();
	window.location.href = "/campaign/" + $('#campaignId').val().trim();
});


//Shared Wizard scripts

$('#eventDay,#draftDay').datepicker({
	autoclose: true,
	todayHighlight: true,
	startDate: "date"
});

$('#startTime,#endTime').timepicker({
	minuteStep: 1,
	icons: {
		up: 'fa fa-chevron-up',
		down: 'fa fa-chevron-down'
	},
});

$('#draftTime').timepicker({
	minuteStep: 30,
	icons: {
		up: 'fa fa-chevron-up',
		down: 'fa fa-chevron-down'
	},
});

//Wizard 1 scripts

function submitAppointments(e) {
	e.preventDefault();
	//console.log(e);
	appointmentFormArray = $('#appointmentForm').serializeArray();
	appointmentFormData = {};
	appointmentFormArray.forEach(function(i) {
		appointmentFormData[i.name] = i.value;
	});
	//console.log(appointmentFormData);
	if(validateWiz(appointmentFormData)) {
		$.post("/api/calendar", appointmentFormData, function postSuccess(data) {
			console.log(data);
			window.location.href = "/wizard/" + data;
		});
	}
}

function validateWiz(appointmentFormData) {
	return true;
}

//Wizard 2 scripts

$(".deleteForm").submit(function( e ) {
	//console.log($(this).data-appointment-id);
	e.preventDefault();
	$(this).closest("tr").remove();
	var deleteUrl =  "/api/calendar/"+$(this).attr('data-appointment-id');
	//console.log(deleteUrl);
	$.ajax({
		url: deleteUrl,
		type: 'DELETE',
		success: function(result) {
		}
	});
});

function launchCampaign(e) {
	e.preventDefault();
	//build user object
	var user = {};
	user.email = $("#email").val().trim();
	user.name = $("#userName").val().trim();

	//build campaign object
	var campaign = {};
	//console.log($("#launchCampaignButton").attr('data-campaign-id'));
	campaign.campaignId = $("#launchCampaignButton").attr('data-campaign-id');
	campaign.name = $("#campaignName").val().trim();
	campaign.draftDay = $("#draftDay").val().trim();
	campaign.draftTime = $("#draftTime").val().trim();
	campaign.mustBeAssigned = $("#mustBeAssigned").attr('checked');

	var submissionObject = {};
	submissionObject.user = user;
	submissionObject.campaign = campaign;

	if(validateWiz2(submissionObject)) {
		//console.log(submissionObject);
		$.post("/api/launch", submissionObject, function postSuccess(data) {
			console.log(data);
		}, "json");
	}
}

function validateWiz2() {
	return true;
}

//Preference page scripts

var highestPreference = 0;

$(".higher-preference, .lower-preference, .zero-preference, .highest-preference").click(function() {
	var button = $(this);
	if(!button.hasClass('lower-disabled')) {
		var lastNum = Number(button.siblings(".preferenceNumber").text());
		if(button.hasClass('higher-preference')) {
			var newNum = lastNum + 1;
		} else if (button.hasClass('lower-preference')) {
			var newNum = lastNum - 1
		} else if (button.hasClass('zero-preference')) {
			var newNum = 0;
		} else if (button.hasClass('highest-preference')) {
			var newNum = highestPreference + 1;
		}
		button.siblings(".preferenceNumber").text(newNum);
		//console.log("lastNum: " + lastNum + ", newNum:" + newNum);
		if(newNum === 0) {
			button.siblings(".lower-preference, .zero-preference").addClass('lower-disabled');
			if(button.hasClass('lower-preference') || button.hasClass('zero-preference')) {
				button.addClass('lower-disabled');
			}
		} else if (lastNum === 0 && newNum>0) {
			button.siblings(".lower-preference, .zero-preference").removeClass('lower-disabled');
		}
		var allPrefNumSpans = $("#prefTable").find(".preferenceNumber");
		highestPreference = 0;
		for (var i = 0; i < allPrefNumSpans.length; i++) {
			var prefRanking = Number($(allPrefNumSpans[i]).text());
			if (prefRanking>highestPreference) {
				highestPreference = prefRanking;
			}
		}
	}
});

function submitPrefs(event) {
	var allPrefNumSpans = $("#prefTable").find(".preferenceNumber");
	var apptRanks = {};
	for (var i = 0; i < allPrefNumSpans.length; i++) {
		var prefRanking = Number($(allPrefNumSpans[i]).text());
		var apptId = $(allPrefNumSpans[i]).attr('data-appointment-id');
		if(prefRanking > 0) {
			apptRanks[apptId] = prefRanking;
		}
	}
	//console.log(apptRanks);
	var prefsObj = {};
	prefsObj.apptRanks = apptRanks;
	prefsObj.campaignId = $("#submitPrefs").attr('data-campaign-id');
	prefsObj.name = $("#userName").val().trim();
	prefsObj.email = $("#email").val().trim();

	if(validatePrefs(prefsObj)) {
		//console.log(prefsObj);
		$.ajax({
			type: "POST",
			url: "/api/prefs",
			data: JSON.stringify(prefsObj),
			contentType: "application/json; charset=utf-8",
			dataType: "json",
			success: function(data){
				console.log(data);
			},
			failure: function(errMsg) {
				alert(errMsg);
			}
		});
	}
}

function validatePrefs(prefsObj) {
	if(highestPreference === 0) {
		$('.fa-plus-circle:first').tooltip({title: "You can't be <i>that</i> indifferent", html: true}).tooltip('show');
		return false;
	}
	var re = /.+@.+\..+/i
	var attemptedEmail = $("#email").val().trim();
	if(!attemptedEmail) {
		$('#email').tooltip({title: "At least try", html: true}).tooltip('show');
		return false;
	} else if (!re.test(attemptedEmail)) {
		$('#email').tooltip({title: "Try harder", html: true}).tooltip('show');
		return false;
	}


	return true;
}

//Optimize page scripts

function optimizeCampaign(e) {
	e.preventDefault();
	var campaignId = $("#optimizeCampaignButton").attr('data-campaign-id');
	console.log(campaignId);
	$.ajax({
		type: "POST",
		url: "/api/optimize/"+campaignId,
		data: JSON.stringify({campaignId: campaignId}),
		contentType: "application/json; charset=utf-8",
		dataType: "json",
		success: function(data){
			console.log(data);
		},
		failure: function(errMsg) {
			alert(errMsg);
		}
	});
}