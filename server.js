// server.js, home of all things good!

// init project
var express = require('express');
var app = express();
var multer  = require('multer')
var upload = multer({ inMemory: true })

var imageSearch = require('node-google-image-search');

//lets require/import the mongodb native drivers.
var mongodb = require('mongodb').MongoClient;
var url = 'mongodb://guest:'+process.env.SECRET+'@ds056979.mlab.com:56979/king-fcc';  // Connection URL.



function makeSlug(min, max) {
  var t = "";
  for(var i = 0; i < min + Math.floor(Math.random() * (max - min)); i++) {
    var base = 65 + (Math.random() * 25);
    if(Math.random() < 0.4) {
      base += 32;
    } else if (Math.random() < 0.3) {
      base = 48 + Math.random() * 9;
    } t += String.fromCharCode(base);
  } 
  return t;
}

String.prototype.regexIndexOf = function(regex, startpos) {
    var indexOf = this.substring(startpos || 0).search(regex);
    return (indexOf >= 0) ? (indexOf + (startpos || 0)) : indexOf;
}



// Use connect method to connect to the Server
mongodb.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else {
    console.log('Connection established to', url.replace(process.env.SECRET, "SECRETPASSWORD"));
    var shrturls = db.collection('shrturls');
    var recentSearches = db.collection('recentsearches');
    
    app.get("/shrturl", function(req, res) {
      var longurl = req.query.shrtn;
      var urlobj = {"longurl": longurl, "shrturl": ""};
      var mUrls = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;

      if(longurl && mUrls.test(longurl)) {
        longurl = longurl.slice(longurl.regexIndexOf(mUrls));
        urlobj.longurl = longurl;
        var shrturl = makeSlug(4, 8);
        urlobj["shrturl"] = shrturl;
        
        // validate long urls (TODO)
        
        shrturls.insert(urlobj, function(err, data) {
          if (err) throw err;
        });
        res.end(JSON.stringify(urlobj));
      }  else if (!longurl) {
        res.sendFile(__dirname + '/views/tstamp/index.html');
      } else {
        res.end('{"err":"Invalid URL!"}');
      }
        // search for their url and redirect them (TODO)
    });
    app.get("/shrturl/:shrturl", function(req, res) {
      shrturls.find({
        shrturl: req.params.shrturl
      }).toArray(function(err, longurls) {
        if(err) throw err;
        res.redirect(longurls[0].longurl);
        res.end(longurls[0].longurl);
      });
    });
    
    app.get("/imgsearch/:img", function(req, res) {
      var offset = 0;
      var amt = 8;
      var page = 0;
      if(req.query.offset) offset = req.query.offset;
      if(req.query.amt && req.query.amt < 20) amt = req.query.amt;
      if(req.query.page) page = req.query.page;
      var searchterm = req.params.img;
      
      imageSearch(searchterm, function(results) {
        var currentdate = new Date(); 
        var datetime = currentdate.getDate() + "/"
                     + (currentdate.getMonth()+1)  + "/" 
                     + currentdate.getFullYear() + " @ "  
                     + currentdate.getHours() + ":"  
                     + currentdate.getMinutes() + ":" 
                     + currentdate.getSeconds();
        recentSearches.insert({searchterm: searchterm, time: datetime}, function(err, data) {
          if(err) throw err;
          var nresults = [];
          for(var result of results) {
            if(result.image) {
              var nresult = {
                              "title": result.title, 
                              "url": result.link, 
                              "snippit": result.snippit,
                              "context": result.image.contextLink,
                              "thumbnail": result.image.thumbnailLink
                            };
              nresults.push(nresult);
            }
          }
          res.end(JSON.stringify(nresults));
        });
      }, page, amt);
    });
    app.get("/recentimgsearches/", function(req, res) {
      var amt = 10;
      if(req.query.amt) amt = req.query.amt;
      recentSearches.find({}).toArray(function(err, data) {
        if(err) throw err;
        res.end(JSON.stringify(data));
      }); 
    });
  }
});

// http://expressjs.com/en/starter/static-files.html
app.use("/", express.static('public'));

app.get("/", function(req, res) {
  res.sendFile(__dirname + '/views/home.html');
});

app.get("/filelength/", function(req, res) {
  res.sendFile(__dirname + '/views/filelength/index.html');
});

app.post('/gfilelength/', upload.single('file'), function (req, res) {
  // req.file is the test file 
  // text fields are in req.body, if there were any lmao
  res.end(JSON.stringify(req.file));
});

app.get("/timestamp/", function(req, res) {
  res.sendFile(__dirname + '/views/tstamp/index.html');
});

// http://expressjs.com/en/starter/basic-routing.html
app.get("/timestamp/:a", function (req, res) {
  var teststr = req.params.a;
  var ret = {"unix": null, "real": null};
  var testint = parseInt(teststr);
  
  if(!isNaN(testint)) teststr = testint;
  var testd = new Date(teststr);
  if(testd.getTime() > 0) {
    ret.unix = testd.getTime();
    ret.real = testd.toDateString();
  }
  
  res.end(JSON.stringify(ret));
});

app.get("/hparser/", function(req, res) {
  var ret = {"system": "", "browser": ""};
  var tarr = req.headers["user-agent"].split(/[\(\)]/);
  
  ret["browser"] = tarr[4].split('').splice(1, tarr[4].length).join('').split(' ').join('; ');
  ret["system"] = tarr[1];
  ret["user-agent"] = req.headers["user-agent"];
  ret["language"] = req.headers["accept-language"].split(";")[0];
  ret["ip"] = req.headers["x-forwarded-for"].split(",")[0];
  ret["protocol"] = req.headers["x-forwarded-proto"].split(",")[0];
  
  res.end(JSON.stringify(ret, null, 2));
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});
