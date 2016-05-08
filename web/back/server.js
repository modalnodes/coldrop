var fs = require('fs');
var express = require("express");
var bodyParser = require("body-parser");
var app = express();

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

var port = process.env.PORT || 4000;
var router = express.Router();

var response;
var configFileName = 'config.json';
var customConfigFileName = "customConfig.json"
var outputFilename = './../../app/res/'+customConfigFileName;

router.get("/config", function(req, res, next) {
  console.log("\n" + new Date());
  console.log(req.query);
  readConfig();
  res.json({
    response: response
  });
});

router.post("/config", function(req, res){
  console.log("\n" + new Date());

  writeConfig(req.body);
  readConfig();
  res.json({
    response: response
  });
});

// BASE ROUTE
app.use("/api", router);

// START SERVER
// ==========================================
app.listen(port);
console.log("Server starts on port: " + port);

function readConfig(){
  try {
     response = JSON.parse(fs.readFileSync('./../../app/res/'+customConfigFileName, 'utf8'));
  } catch (e){
    console.log(e);
    response = JSON.parse(fs.readFileSync('./../../app/res/'+configFileName, 'utf8'));
  }
}

function writeConfig(data){
  console.log("write file with data:"+data);
  fs.writeFileSync(outputFilename, JSON.stringify(data, null, 4));
}
