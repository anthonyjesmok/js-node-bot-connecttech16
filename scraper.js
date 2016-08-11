// IMPORTANT
// THIS IS NOT A NODE SCRIPT
// You must install PhantomJS and CasperJS to run this script properly, and run it with CasperJS.

// Include Modules and Files
var casper = require('casper').create();
var fs = require('fs');
var system = require('system');

// Curent File Path
var curFilePath = fs.absolute(system.args[3]).split('/');
if (curFilePath.length > 1) {
    curFilePath.pop();
    curFilePath = curFilePath.join('/');
}

// Casper Tasks
casper.start('http://connect-js.com/', function () {
	// Create Our Output JSON
	var output = {
        sessions: [],
        speakers: []
    };
    this.echo("Beginning Scrape of Data...");
    this.then(function() {
    	var pushedSpeakers = [];
    	var sessionTitles = this.getElementsInfo('#sessions div[class="modal fade"] h4[class="modal-title"]');
    	var sessionDescriptions = this.getElementsInfo('#sessions div[class="modal fade"] div[class="modal-body panel-body-session"]');
    	var speakerNames = this.getElementsInfo('#sessions div[class="modal fade"] div[class="modal-footer"] > h4');
    	var speakerArea = this.getElementsInfo('#sessions div[class="modal fade"] div[class="modal-footer"]');
    	var speakerBios = this.getElementsInfo('#sessions div[class="modal fade"] div[class="modal-footer"] > span[class="panel-body-session-nobg"]');
        for (var i = 0; i < sessionTitles.length; i++) {
        	var sessionToPush = {};
        	var speakerToPush = {};
        	sessionToPush['title'] = sessionTitles[i].text.trim();
        	sessionToPush['description'] = sessionDescriptions[i].text.trim();
        	sessionToPush['speaker'] = speakerArea[i].text.trim().split('\n')[0].trim();
        	speakerToPush['name'] = speakerNames[i].text.trim();
        	speakerToPush['bio'] = speakerBios[i].text.trim();
        	output.sessions.push(sessionToPush);
        	if(pushedSpeakers.indexOf(speakerToPush['name']) < 0) {
        		output.speakers.push(speakerToPush);
        		pushedSpeakers.push(speakerToPush['name']);
        	}
        }
    });
    this.then(function () {
        fs.write(curFilePath + "/data.json", JSON.stringify(output, null, 4), 'w');
    });
});

//Run Casper, Exit on Complete
casper.run(function () {
    this.echo("Scrape Complete!");
    this.exit();
});