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
dialog.onDefault(function (session, args) {
    session.send("I could not understand what you said. Please try again. I may not be able to handle your request.");
});

// onBegin Handler
// Triggered when the conversation is started
dialog.onBegin(function (session, args) {
    session.send("Hello there! Feel free to ask me about the Connect.Tech conference speakers, sessions, and information about the venue or hotel.");
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