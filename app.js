var express = require('express');
var bodyparser = require('body-parser');
var app = express();

//process.env.PORT lets the port be set by Heroku
var port = process.env.PORT || 8080;
//routes
app.get('/', function(req, res){
  res.send("Hello world");
});
//Setting the listen method to our enviroment port
app.listen(port, function(){
  console.log("Node JS server launched, running on http:localhost//:"+ port);
});
