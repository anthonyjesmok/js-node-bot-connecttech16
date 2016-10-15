// Node Modules
var restify = require('restify'),
    builder = require('botbuilder'),
    server = restify.createServer();

// Setup Bot Server Instance
server.listen(3798, function () {
    console.log('Bot Started: %s listening to %s', server.name, server.url);
});

// Setup Our Chat Connector
// This allows us to connect our bot to the Microsoft Bot Framework.
// Credentials do not need to be valid until production.
var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});

// Create the "brains of our bot", which manages dialogs.
var bot = new builder.UniversalBot(connector);

// Have the ChatConnector listen for messages on an API endpoint.
server.post('/api/messages', connector.listen());

// Setup LUIS
// Dialog URL from the Publish Screen
var model = "https://api.projectoxford.ai/luis/v1/application?id=2a917da5-f215-4e3c-9889-76e46de08b9d&subscription-key=87d340526f9647e5a20a61a6125a4a9e";
// Create a Dialog from the Model
var recognizer = new builder.LuisRecognizer(model);
var dialog = new builder.IntentDialog({
    recognizers: [recognizer]
});
bot.dialog('/', dialog);

// onDefault Handler
// Triggered when no other intents match the user's query.
var introducedIds = [];
dialog.onBegin(function (session, args, next) {
    console.log(session);
    if (introducedIds.indexOf(session.message.user.id) > -1) {
        session.send("Hello! Feel free to ask me about sessions, speakers, and venue or hotel information about Connect.Tech 2016!");
        introducedIds.push(session.message.user.id);
    } else {
        next();
    }
});

dialog.onDefault(function (session, args) {
    session.send("Sorry, that is something I cannot do.");
});


// "None" Intent
// Triggered when a match for the "None" intent is detected.
dialog.matches('None', function (session, args) {
    session.send("Sorry, that is something I cannot do.");
});

// "GetHotelInfo" Intent
// Triggered when hotel information is requested.
dialog.matches('GetHotelInfo', function (session, args) {
    session.send("The conference hotel is the Sheraton Suites Galleria-Atlanta, located at 2844 Cobb Parkway SE. Atlanta, GA 30339. Phone number is (770) 955-3900. A link to book rooms for the conference is online.");
});

// "GetVenueInfo" Intent
// Triggered when venue information is requested.
dialog.matches('GetVenueInfo', function (session, args) {
    session.send("The conference will be held at the Cobb Galleria Centre at Galleria Specialty Mall, 2 Galleria Pkwy SE, Atlanta, GA 30339. Phone number is (770) 955-8000. A map is located online at the conference website.");
});

// "FindSession" Intent
// Triggered when sessions are searched for.
dialog.matches('FindSession', function (session, args) {
    var term = builder.EntityRecognizer.findEntity(args.entities, 'SessionSearch');
    if (term) {
        //JSON Filter
        function matchesTerm(value) {
            if (value.title.toLowerCase().includes(term.entity) || value.description.toLowerCase().includes(term.entity)) {
                return true;
            } else {
                return false;
            }
        }
        var data = require('./data.json');
        var filtered_data = data.sessions.filter(matchesTerm);
        console.log(filtered_data);
        if (filtered_data.length > 1) {
            var returnString = "";
            for (var i = 0; i < filtered_data.length; i++) {
                if (i < filtered_data.length - 1) {
                    returnString += filtered_data[i].title + ", ";
                } else {
                    returnString += filtered_data[i].title + ".";
                }
            }
            session.send("You might be interested in these sessions: " + returnString);
        } else if (filtered_data.length == 1) {
            session.send("You might be interested in \"" + filtered_data[0].title + "\": " + filtered_data[0].description);
        } else {
            session.send("We did not find any sessions for your search.");
        }
    } else {
        session.send("I think you're trying to search for a session, but not sure what you're looking for. Please try your query again.")
    }
});

// "FindSpeaker" Intent
// Triggered when speakers are searched for.
dialog.matches('FindSpeaker', function (session, args) {
    var term = builder.EntityRecognizer.findEntity(args.entities, 'SpeakerSearch');
    if (term) {
        //JSON Filter
        function matchesTerm(value) {
            if (value.name.toLowerCase().includes(term.entity) || value.bio.toLowerCase().includes(term.entity)) {
                return true;
            } else {
                return false;
            }
        }
        var data = require('./data.json');
        var filtered_data = data.speakers.filter(matchesTerm);
        console.log(filtered_data);
        if (filtered_data.length > 1) {
            var returnString = "";
            for (var i = 0; i < filtered_data.length; i++) {
                if (i < filtered_data.length - 1) {
                    returnString += filtered_data[i].name + ", ";
                } else {
                    returnString += filtered_data[i].name + ".";
                }
            }
            session.send("Here are the speakers we found: " + returnString);
        } else if (filtered_data.length == 1) {
            session.send("You might be interested in " + filtered_data[0].name + ": " + filtered_data[0].bio);
        } else {
            session.send("We did not find any speakers for your search.");
        }
    } else {
        session.send("I think you're trying to search for a session, but not sure what you're looking for. Please try your query again.")
    }
});