var express = require('express');
var bodyparser = require('body-parser');
var request = require('request');
var mdb = require('moviedb')('8437ba0afa5bdf8e982bc6f76d885b01');
var app = express();
app.img_url = "http://image.tmdb.org/t/p/original";
app.base_url = 'http://rancio.herokuapp.com'

app.use(bodyparser.json());

//process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;
//routes
//webhook
app.get('/webhook', function(req, res) {
    if (req.query['hub.mode'] === 'subscribe' &&
        req.query['hub.verify_token'] === 'rancio_bot') {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});
// hello world
app.get('/', function(req, res) {
    res.send("Hello world");
});
//My personal functions


function getMovie(txt) {

    request(app.base_url + 'mdb/?movie=' + txt, function(err, res, body) {
        return body;
    })

}



//facebook API ////////////////////////////////////////////////////////////////////////////////////////


function receivedMessage(event) {
    var senderID = event.sender.id;
    var recipientID = event.recipient.id;
    var timeOfMessage = event.timestamp;
    var message = event.message;

    console.log("Received message for user %d and page %d at %d with message:",
        senderID, recipientID, timeOfMessage);
    console.log(JSON.stringify(message));

    var messageId = message.mid;

    // You may get a text or attachment but not both
    var messageText = message.text;
    var messageAttachments = message.attachments;

    if (messageText) {

        // If we receive a text message, check to see if it matches any special
        // keywords and send back the corresponding example. Otherwise, just echo
        // the text we received.
        switch (messageText) {
            case 'star':
                sendPosterMessage(senderID, messageText);
                break;

            case 'button':
                sendButtonMessage(senderID);
                break;

            case 'generic':
                sendGenericMessage(senderID);
                break;

            case 'receipt':
                sendReceiptMessage(senderID);
                break;

            default:
                sendTextMessage2(senderID, messageText);
                sendPosterMessage(senderID, messageText);


        }
    } else if (messageAttachments) {
        sendTextMessage(senderID, "Message with attachment received");
    }
};
//sending message to chat ------------------------

function sendTextMessage2(recipientId, messageText) {
  var spacesOut = messageText.split(' ').join('%20');
  var txt = spacesOut;
  console.log("ACA VA EL TITULO EL FUCKING TITULO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  console.log(txt);
    mdb.searchMovie({
            query: txt
        }, function(err, resp) {
            //handling errors
            console.log(resp);
            if (resp['results'][0]) {
                var peli = resp['results'][0]
                var peli_des = resp['results'][0]['overview'];
                var peli_poster = resp['results'][0]['poster_path'];
            } else {
                var peli = '';
                var peli_des = '';
                var peli_poster = '';
            }
            var messageData2 = {
                    recipient: {
                        id: recipientId
                    },
                    message: {
                        text: "OVERVIEW: "+peli_des
                    }
                };

                callSendAPI(messageData2);

        });
    }



function sendPosterMessage(recipientId, messageText) {
    var spacesOut = messageText.split(' ').join('%20');
    var txt = spacesOut.split('poster').join('%20');
    console.log("ACA VA EL TITULO EL FUCKING TITULO!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
    console.log(txt);

    mdb.searchMovie({
        query: txt
    }, function(err, resp) {
        //handling errors
        console.log(resp);
        if (resp['results'][0]) {
            var peli = resp['results'][0]
            var peli_des = resp['results'][0]['overview'];
            var peli_poster = resp['results'][0]['poster_path'];
        } else {
            var peli = '';
            var peli_des = '';
            var peli_poster = '';
        }


        //mensaje
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "image",
                    payload: {

                        url: app.img_url + peli_poster

                    }
                }
            }
        };

        callSendAPI(messageData);
    });
}




function sendTextMessage(recipientId, messageText) {
    var spacesOut = messageText.split(' ').join('%20');
    mdb.searchMovie({
        query: spacesOut
    }, function(err, resp) {
        //handling errors
        console.log(resp);
        if (resp['results'][0]) {
            var peli = resp['results'][0]
            var peli_des = resp['results'][0]['overview'];
            var peli_poster = resp['results'][0]['poster_path'];
        } else {
            var peli = '';
            var peli_des = '';
            var peli_poster = '';
        }


        //mensaje
        var messageData = {
            recipient: {
                id: recipientId
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "generic",
                        elements: [{
                            title: messageText,
                            subtitle: peli_des,
                            item_url: app.img_url + peli_poster,
                            image_url: app.img_url + peli_poster,

                        }]
                    }
                }
            }
        };

        callSendAPI(messageData);
    });


    //ni idea uqe hace esto
}

function callSendAPI(messageData) {
    request({
        uri: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: 'EAAElESuD4ZBABAKwcE96vz7eEcLXKJn7eTMJehctbdcXys3TDhGufSQxZBPDNErryZBT8ZB0Eu1yTKpJon3BBBsAmDXei1kQq1bI82I59uhFR1HHfnyj6JXgZCvctggb3FqvyfQm7k36j1omh7ezZA0WV4YFZAFUKM7Gsf9DDpstwZDZD'
        },
        method: 'POST',
        json: messageData

    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            var recipientId = body.recipient_id;
            var messageId = body.message_id;

            console.log("Successfully sent generic message with id %s to recipient %s",
                messageId, recipientId);
        } else {
            console.error("Unable to send message.");
            console.error(response);
            console.error(error);
        }
    });
}


//This part is where my bot does the stuff I want ///////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
app.post('/webhook', function(req, res) {
    var data = req.body;

    // Make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function(pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;

            // Iterate over each messaging event
            pageEntry.messaging.forEach(function(messagingEvent) {
                if (messagingEvent.optin) {
                    //receivedAuthentication(messagingEvent);
                } else if (messagingEvent.message) {
                    receivedMessage(messagingEvent); //aqui mando el mensaje
                } else if (messagingEvent.delivery) {
                    //receivedDeliveryConfirmation(messagingEvent);
                } else if (messagingEvent.postback) {
                    //receivedPostback(messagingEvent);
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know you've
        // successfully received the callback. Otherwise, the request will time out.
        res.sendStatus(200);
    }
});

//moviedb restapi /////////////////////////////////////////////////////////////////////////////////////////////////////////


app.get('/mdb', function(req, res) {
    mdb.searchMovie({
        query: req.query.movie
    }, function(err, resp) {

        var peli = resp['results'][0]
        var peli_id = resp['results'][0]['id'].toString();
        var peli_poster = resp['results'][0]['poster_path'];

        res.send(peli);
        //
        //res.send(peli);
        //console.log(peli.id);
        //res.send(req.query.movie);
    });
});


//Setting the listen method to our enviroment port
app.listen(port, function() {
    console.log("Node JS server launched, running on http:localhost//:" + port);
});
