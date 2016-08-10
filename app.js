var express = require('express');
var bodyparser = require('body-parser');
var app = express();

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
//
app.get('/', function(req, res){
  res.send("Hello world");
});


//Setting the listen method to our enviroment port
app.listen(port, function(){
  console.log("Node JS server launched, running on http:localhost//:"+ port);
});
