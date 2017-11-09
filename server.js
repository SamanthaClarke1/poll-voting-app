// server.js
// (reference) https://github.com/cfsghost/passport-github/blob/master/examples/login/app.js


// init project
var express = require('express');
var fs = require('fs');
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    GitHubStrategy = require('passport-github2').Strategy;
var util = require('util');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var GitHubStrategy = require('passport-github2').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var partials = require('express-partials');
var app = express();
var passwordHash = require('password-hash');
var flash=require("connect-flash");
var Jimp = require("jimp");

var mongodb = require('mongodb').MongoClient;
var url = 'mongodb://guest:'+process.env.MONGO_PASS+'@ds056979.mlab.com:56979/king-fcc';  // Connection URL.

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(flash());
app.use(partials());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());+
app.use(express.static(__dirname + '/public'));


// Use connect method to connect to the Server
mongodb.connect(url, function (err, db) {
  if (err) {
    console.log('Unable to connect to the mongoDB server. Error:', err);
  } else { 
    console.log("MongoDB connected to " + url.split(process.env.MONGO_PASS).join("{SECRETPASSWORD}"));
    var usersDB = db.collection('polls_users');
    var pollsDB = db.collection('polls');
    
    // Passport session setup.
    //   To support persistent login sessions, Passport needs to be able to
    //   serialize users into and deserialize users out of the session.  Typically,
    //   this will be as simple as storing the user ID when serializing, and finding
    //   the user by ID when deserializing.  However, since this example does not
    //   have a database of user records, the complete GitHub profile is serialized
    //   and deserialized.
    passport.serializeUser(function(user, done) {
      done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
      done(null, obj);
    });
    
    function githubReadyUp(accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {
        usersDB.findOne({"name": profile.username}, function(err, data) {
          if(err) throw err;

          if(data) {
            return done(null, data);
          }
          else {
            if(!profile.displayName) profile.displayName = profile.username.split('-').join(' ');
            var toIns = {"id": profile.id, "name": profile.username, "displayName": profile.displayName, "githubLink": profile.profileUrl,
                         "password": null, "bio": profile._json.bio, "secret": generateSecret(), "github": true};
            if(profile.facebook) {
              toIns.facebook = true;
              toIns.github = false;
            }
            if(profile.photos && profile.photos.length > 0) toIns.img = profile.photos[0].value;
            else toIns.img = process.env.NO_IMAGE_URL;

            //console.log(JSON.stringify(profile));

            var slug = makeSlug(7, 7);
            toIns.icon64 = "/avatars/" + slug + ".jpg";

            Jimp.read(toIns.img, function (err, lenna) {
              if (err) throw err;
              lenna.resize(64, 64)            // resize 
                   .quality(64)                 // set JPEG quality 
                   .write("./public/avatars/" + slug + ".jpg"); // save 

              usersDB.insert(toIns, function(err, data) {
                if(err) throw err;
              });
            });
            console.log("profile on default " + JSON.stringify(toIns));
            return done(null, toIns);
          }
        });
      });
    };
    
    // note that done is just a callback.
    passport.use(new FacebookStrategy({
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: "https://poll-voting-app.glitch.me/auth/facebook/callback",
        profileFields: ['displayName', 'name', 'profileUrl', 'email', 'picture.type(large)']
      },
      function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
          //console.log(profile);
          // i need to adapt it to a 'github' standard one, then act as if it was github all along. that's what im doing here.
          var gitUser = {id: profile.id, username: profile.name, displayName: profile.displayName, photos: profile.photos,
                         profileUrl: profile.profileUrl, _json: {bio: "I just hate bios! That's why i won't set one."}};
          
          return githubReadyUp(accessToken, refreshToken, gitUser, done);
        });
      }
    ));
    
    passport.use(new LocalStrategy(function(username, password, done) {
      usersDB.findOne({ name: displayNameToUsername(username) }, function(err, user) {
        if (err) { return done(err); }
        if (!user) {
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!passwordHash.verify(password, user.password)) {
          return done(null, false, { message: 'Incorrect password.' });
        }
        return done(null, user);
      });
    }));
    
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_KEY,
        clientSecret: process.env.GITHUB_SECRET,
        callbackURL: process.env.APP_URL + '/auth/github/callback'
      }, githubReadyUp));

    // http://expressjs.com/en/starter/basic-routing.html
    app.get("/", function (req, res) {
      res.render('index', { user: req.user, error: req.query.err });
    });
    
    /*app.post('/submitavatar', ensureAuthenticated, function(req, res) {
      var user = req.user;
      if(!user) { 
        res.redirect('/?err=Could%20not%20authenticate%20user.');
      } else {
        //console.log("img in = " + req.body.img);
        Jimp.read(req.body.img, function (err, lenna) {
          if (err) throw err;
          var slug = makeSlug(7, 7);
          lenna.resize(64, 64)            // resize 
               .quality(96)                 // set JPEG quality 
               .write("./public/avatars/" + slug + ".jpg"); // save 
          
          user.img = req.body.img;
          user.icon64 = "/avatars/" + slug + ".jpg";
          
          usersDB.update({name: user.name}, {name: user.name, password: user.password, img: user.img, displayName: user.displayName,
                                             icon64: user.icon64, secret: user.secret, github: user.github, bio: user.bio, githubLink: user.githubLink}, function(err) {
            if(err) throw err;
            res.redirect('/account');
          });
        });
      }
    });*/
    
    app.post('/deletepoll', ensureAuthenticated, function(req, res) {
      var pslug = req.body.poll;
      console.log("slug: " + pslug);
      
      pollsDB.remove({slug: pslug}, true, function(err, data) {
        if(err) throw err;
        else {
          if(!data) {
            res.redirect("/?err=Couldn't%20Find%20Post%20To%20Delete");
          } else {
            console.log(data);
            res.redirect("/account");
          }
        }
      });
    });
    
    app.post('/addpoll', ensureAuthenticated, function(req, res) {
      var doc = Date.now();
      
      var slug = makeSlug(7, 7);
      var toIns = {slug: slug, url: "/viewpoll/?s=" + slug, username: req.user.name, votes: {}, doc: doc,
                   displayName: req.user.displayName, answers: {}, question: req.body.question};
      
      for(var i = 0; i < 30; i++) {
        var tans = req.body["index" + i];
        if(tans) toIns.answers[tans] = 0;
      }
      
      pollsDB.insert(toIns, function() {
        res.redirect(toIns.url)
      });
    });
    
    app.post('/voteonpoll/', ensureAuthenticated, function(req, res) {
      if(!req.body.s) { 
        res.redirect("/?err=No%20Slug%20Given!");
      } else {
        pollsDB.findOne({slug: req.body.s}, function(err, poll) {
          if(!poll) {
            res.redirect("/?err=Poll%20not%20found!");
          }
          else {
            if(!req.body.vote) {
              res.redirect(poll.url + "&err=Vote%20is%20missing.");
            }
            else {
              var myvote = req.body.vote.split("Confirm: ")[1];
              if(poll.votes[req.user.name] != myvote) { // as long as they've changed their vote
                poll.votes[req.user.name] = myvote;
                
                for(var ans in poll.answers) { poll.answers[ans] = 0; } // set all answers aggregate vote values to 0
                for(var vote in poll.votes) { // count the votes
                  poll.answers[poll.votes[vote]] += 1; // votes = {person: answerTheyVotedOn}, and poll.answers = {answer: amountOfVotesForIt}
                }

                pollsDB.update({slug: req.body.s}, {slug: poll.slug, url: poll.url, username: poll.username, votes: poll.votes,
                                 displayName: poll.displayName, answers: poll.answers, question: poll.question}, function(err, data) {
                  if(err) throw err;
                  res.redirect(poll.url);
                });
              }
            }
          }
        });
      }
    });
    
    app.get('/viewpoll/', function(req, res) {
      var slug = req.query.s;
      if(!slug) res.redirect("/?err=No%20Slug%20Given!");
      
      pollsDB.findOne({slug: slug}, function(err, poll) {
        if(err) throw err;
        if(!poll) res.redirect("/?err=Poll%20not%20found!");
        else {
          res.render('viewpoll', { user: req.user, error: req.query.err, poll: poll, authd: (req.user != undefined) });
        }
      })
    });
    
    app.get('/createpoll', ensureAuthenticated, function(req, res) {
      res.render('createpoll', { user: req.user, error: req.query.err })
    });
    
    app.get('/paccount', function(req, res) {
      usersDB.findOne({ name: displayNameToUsername(req.query.user) }, function(err, user) {
        if(!user) {
          res.redirect('/?err=Could%20not%20find%20user.');
        }
        pollsDB.find({ username: user.name }).toArray(function(err, data){
          if(err) throw err;
          //console.log(data);
          res.render('account', { user: user, public: true, error: req.query.err, editing: false, polls: data });
        });; // find this users polls
      });
    });
    
    app.get('/account', ensureAuthenticated, function(req, res) {
      pollsDB.find({ username: req.user.name }).toArray(function(err, data){
        if(err) throw err;
        
        //console.log(data);
        res.render('account', { user: req.user, public: false, polls: data, error: req.query.err, editing: req.query.editing });
      });; // find this users polls
    });

    // GET /auth/github
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  The first step in GitHub authentication will involve redirecting
    //   the user to github.com.  After authorization, GitHub will redirect the user
    //   back to this application at /auth/github/callback
    app.get('/auth/github',
      passport.authenticate('github', { scope: [ 'user:email' ] }),
      function(req, res){
        // The request will be redirected to GitHub for authentication, so this
        // function will not be called.
      }
    );
    
    app.get('/auth/facebook', passport.authenticate('facebook'), function(req, res) {
      // redirected to fb, so this is never called. see: https://www.npmjs.com/package/passport-facebook
    });
    app.get('/auth/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/login?err=Couldn\'t%20Auth%20Facebook!' }),
      function(req, res) {
        // Successful authentication, redirect home. 
        res.redirect('/');
    });

    // GET /auth/github/callback
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function will be called,
    //   which, in this example, will redirect the user to the home page.
    app.get('/auth/github/callback', 
      passport.authenticate('github', { failureRedirect: '/login?err=Couldn\'t%20Auth%20Github!' }),
      function(req, res) {
        res.redirect('/');
      }
    );

    app.get('/login', function(req, res) {
      var signup = (req.query.signup ? true:false);
      res.render('login', { user: req.user, signup: signup, error: req.query.err  });
    });

    app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
    });
    
    app.post('/auth/login', 
      passport.authenticate('local', { failureRedirect: '/account?err=Unable%20to%20login!' }),
      function(req, res, next) {
        console.log('/auth/login visited!');
        res.redirect('/'); 
      }
    );
    
    app.post('/auth/updateacc', ensureAuthenticated, function(req, res, next) {
      var user = req.user;
      user.displayName = req.body.displayName;
      user.img = req.body.avatar;
      user.bio = req.body.bio;
      
      var slug = makeSlug(7, 7);
      user.icon64 = "/avatars/" + slug + ".jpg";

      Jimp.read(user.img, function (err, lenna) {
        if (err) throw err;
        lenna.resize(64, 64)            // resize 
             .quality(64)                 // set JPEG quality 
             .write("./public/avatars/" + slug + ".jpg"); // save 
        
        usersDB.update({name: user.name}, {name: user.name, password: user.password, img: user.img, displayName: user.displayName,
                                             icon64: user.icon64, secret: user.secret, github: user.github, bio: user.bio, githubLink: user.githubLink}, function(err) {
            if(err) throw err;
            res.redirect('/account');
          });
      });
    });
    
    app.post('/auth/signin', function(req, res, next) {
      if(req.body.password != req.body.confirmpassword && req.body.password != "" && req.username != "") {
        //console.log("error on first catch /auth/signin !"); 
        if(req.username == "") res.redirect("/login?signup=true&err=Username%20cant%20be%20blank!");
        else if(req.body.password == "") res.redirect("/login?signup=true&err=Password%20can't%20be%20blank!");
        else res.redirect("/login?signup=true&err=Passwords%20don't%20match!"); 
      } else {
        var toIns = {
                      "img": process.env.NO_IMAGE_URL,
                      "name": displayNameToUsername(req.body.username),
                      "displayName": req.body.username,
                      "password": hashOf(req.body.password),
                      "github": false,
                      "secret": generateSecret(),
                      "profileUrl": "https://poll-voting-app.glitch.me/paccount/" + displayNameToUsername(req.body.username),
                      "bio": "I hate bio's so much, I won't even set one!",
                      "githubLink": null
                    };
        usersDB.findOne({"name": toIns.name}, function(err, data) {
          if(err) throw err;
          if(!data) {
            var slug = makeSlug(7, 7);
            toIns.icon64 = "/avatars/" + slug + ".jpg";
            
            Jimp.read(toIns.img, function (err, lenna) {
              if (err) throw err;
              lenna.resize(64, 64)            // resize 
                   .quality(64)                 // set JPEG quality 
                   .write("./public/avatars/" + slug + ".jpg"); // save 
              
              passport.authenticate('local', function(err, user, pass) {
                if (err) { return next(err); }
                if (!user) { return res.redirect('/login'); }
                req.logIn(user, function(err) {
                  if (err) { return next(err); }
                  return res.redirect('/account');
                });
              })(req, res, next);
            });
                      
            usersDB.insert(toIns);
            //console.log(toIns)
            console.log("everbody welcome " + toIns.name + "!");
          }
          else {
            res.redirect("/login?signup=true&err=User%20already%20exists!")
          }
        });
      }
    });
  } // end of mongo else statement
});



// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

// Simple route middleware to ensure user is authenticated.
//   Use this route middleware on any resource that needs to be protected.  If
//   the request is authenticated (typically via a persistent login session),
//   the request will proceed.  Otherwise, the user will be redirected to the
//   login page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/login?err=Unable%20to%20authenticate%20user.')
}

function displayNameToUsername(displayName) {
  if(displayName) {
    return displayName.split(' ').join('-');
  }
  else
    return null;}

function hashOf(input) {
  return passwordHash.generate(input);
}

function generateSecret(verbsl=Math.random() * 1.3, adverbsl=Math.random() * 2.2, directionsl=Math.random() * 1.1, adjectivesl=Math.random() * 2.2, nounsl=Math.random() * 1.5) {
  var verbs = ["jumped", "encircled", "dug", "cut", "ate", "licked", "demolished", "chowed down", "obliterated", "lit", "bent", "snapped", "popped", 
               "obfuscated", "obscured", "loaded", "abducted", "stole", "exited", "shot", "told", "loved", "giggled", "wired", "detached", "screwed", "drank", 
               "rubbed", "broke", "ran", "sprinted", "jogged", "unscrewed", "swallowed", "sounded"];
  var adverbs = ["lovingly", "quickly", "slowly", "cleanly", "smoothly", "roughly", "clearly", "with light feet", "loosely",
                 "air-headidly", "cowardly", "nervously", "lightly", "heavily", "thunderously", "uproarisly", "sleepily", "righteously", "sharply", "bluntly", "strongly"];
  var directions = ["over", "under", "through", "between", "around", "inbetween"];
  var adjectives = ["gross", "putrid", "starving", "yummy", "white", "loud", "quiet", "black", "yellow", "circular", "blue", "mauve", "purple", "big", "red", "green", "communal", "dirty", "clean", "neat", "hard", "rough", "smooth", "glassy", "shiny", "cowardly", "happy", "sad", "mean", "average", "consumerist", "stunned", "well-known", "open", "funny", "real-life", "handsome", "ugly", "cute", "weird"];
  var nouns = ["dog", "cat", "phone", "lighter", "pliers", "batteries", "rock", "ruck-shack", "cubby", "bottle", "can", "roll of tape", "paper", "notebook", "bubble-wrap", "computer",
               "human", "alien", "demon", "porch", "guest", "wishbone", "secret", "joke", "date", "actor", "date-astrophy", "kitten", "sparks", "booklet", "glass-bottle", "wristband", 
               "song", "album", "glass", "knife", "fork", "brush", "deodarant", "dart", "tape", "wire", "cable", "monitor", "keyboard", "harp", "guitar", "bass", "drumkit", "celebrity"];
  
  var sentence = "";
  var capitalization = Math.floor(Math.random() * 2);

  sentence = "the " + getRandIndsOf(nouns, nounsl)  +     " ";
  sentence +=    getRandIndsOf(verbs, verbsl)           +     " ";
  sentence +=    getRandIndsOf(adverbs, adverbsl)       +     " ";
  sentence +=    getRandIndsOf(directions, directionsl) + " the ";
  sentence +=    getRandIndsOf(adjectives, adjectivesl) +     " ";
  sentence +=    getRandIndsOf(nouns, nounsl)           +      "";
  
  var nsentence = "";
  for(var i in sentence) {
	if(capitalization != 0 && i % capitalization == 0) nsentence += sentence[i].toUpperCase();
	else nsentence += sentence[i].toLowerCase();
  }

  return nsentence.split(" ").join("_");
}
function getRandIndsOf(arr, amount=1) {
  var retStr = "";
  for(var i = 0; i < amount; i++) {
    retStr += arr[Math.floor(Math.random() * arr.length)];
    if(i < amount - 1) retStr += " and "; // if not the last one
  }
  return retStr;
}

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
// https://pastebin.com/LSWEmQwT