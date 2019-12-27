'use strict';
const request = require('request');

let express = require('express'),
    bodyParser = require('body-parser'),
    app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(process.env.PORT || 8989, () => console.log('Example app listening on port 8989!'));

app.get('/', (req, res) => res.send('Hello World!'));

// Adds support for GET requests to our webhook
app.get('/webhook', (req, res) => {

    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = "EAAGFThh3pmgBAEZAgjOegxSNgoTk1eHEDSrMZAz9wrrf01qbUMmDSHgjabuUMLP2JcM8e6yZCN73KTvdvCofbKzZAweoTQ5ZAaoCjvZBvLdTb0iq5M7NLAnELS78awZCk8YHdplU9oQ8deh83yzhoirPdILDsPfojaq59WRzxmFXi6Xq4TWcYUoAyMSZCmDm3cgZD";

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});

// Creates the endpoint for our webhook
app.post('/webhook', (req, res) => {
    let body = req.body;

    if (body.object === 'page') {

        // Iterates over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Gets the message. entry.messaging is an array, but
            // will only ever contain one message, so we get index 0
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);

            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            // if (webhook_event.postback) {
            //     console.log(webhook_event.message);
            // } else if (webhook_event.message) {
            //     console.log(webhook_event.postback);
            // }

            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
                handlePostback(sender_psid, webhook_event.message);
            }
        });

        // Returns a '200 OK' response to all requests
        res.status(200).send('EVENT_RECEIVED');
    } else {
        // Returns a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

// Handles messages events
const handleMessage = (sender_psid, received_message) => {
    let response;

    if (received_message.text) {

    }
}

//
const handlePostback = (sender_psid, received_postback) => {
    let response;

    // Get the payload for the postback
    let payload = received_postback.text;

    if(payload === 'st'){
        response = askTemplate('Are you a Cat or Dog Person?');
        callSendAPI(sender_psid, response);
    }
    else if(payload === 'Hi'){
        response = askTemplate1('Hi CC');
        callSendAPI(sender_psid, response);
    }
    else if(payload === 'Ditmemay'){
        response = askTemplate1('Dit Chi May');
        callSendAPI(sender_psid, response);
    }
    else if (payload === 'Hello') {
      response = askTemplate1('Hulle');
      callSendAPI(sender_psid, response);
    }
    else {
      response = askTemplate1('Nói ngu quá không hiểu');
      callSendAPI(sender_psid, response);
    }
}

const askTemplate = (text) => {
    return {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text": text,
                "buttons":[
                    {
                        "type":"postback",
                        "title":"Cats",
                        "payload":"CAT_PICS"
                    },
                    {
                        "type":"postback",
                        "title":"Dogs",
                        "payload":"DOG_PICS"
                    }
                ]
            }
        }
    }
}

const askTemplate1 = (text) => {
    return {
                "text": text,
            }
}

// Sends response messages via the Send API
const callSendAPI = (sender_psid, response, cb = null) => {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };

    // Send the HTTP request to the Messenger Platform
    request({
        "url": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": "EAALzDmXb5V0BAMasbxZAR1SSqTUcw4nAr9JZCfXxTfwq7zAcrJmLFfFSFiTanVc24VjNveSkjZBoREZB0lQbraQKEOLojyMOkCtVxCJtV9eyB0AtQyZCGadjciThAnbFafHNe8odiYpPDeMY9eTOJ9KUb5mEAwF0JFutZBbxlY9YD9LzIJl02HbUwc4RJovwwZD" },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            if(cb){
                cb();
            }
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}
