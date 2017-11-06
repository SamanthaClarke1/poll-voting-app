// server.js
// (reference) https://github.com/cfsghost/passport-github/blob/master/examples/login/app.js

// init project
var express = require('express');
var passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    GitHubStrategy = require('passport-github2').Strategy;
var util = require('util');
var session = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var GitHubStrategy = require('passport-github2').Strategy;
var partials = require('express-partials');
var app = express();

var mongodb = require('mongodb').MongoClient;
var url = 'mongodb://guest:'+process.env.MONGO_PASS+'@ds056979.mlab.com:56979/king-fcc';  // Connection URL.

// configure Express
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
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
    
    function loginSignup(accessToken, refreshToken, profile, done) {
      // asynchronous verification, for effect...
      process.nextTick(function () {

        usersDB.findOne({"name": profile.username}, function(err, data) {
          if(err) throw err;
          console.log(JSON.stringify(data));
          if(data) {
            return done(null, data);
          }
          else {
            var toIns = {"id": profile.id, "name": profile.username, "displayName": profile.displayName};
            if(profile.photos && profile.photos.length > 0) toIns.img = profile.photos[0].value;
            else toIns.img = process.env.NO_IMAGE_URL;
            usersDB.insert(toIns, function(err, data) {
              if(err) throw err;
            });
            return done(null, profile);
          }
        });
      });
    }
    
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

    passport.use(new LocalStrategy(function(user, pass, done) {
      
    }));
    
    passport.use(new GitHubStrategy({
        clientID: process.env.GITHUB_KEY,
        clientSecret: process.env.GITHUB_SECRET,
        callbackURL: process.env.APP_URL + '/auth/github/callback'
      }, loginSignup));

    // http://expressjs.com/en/starter/basic-routing.html
    app.get("/", function (req, res) {
      res.render('index', { user: req.user });
    });

    app.get('/account', ensureAuthenticated, function(req, res){
      res.render('account', { user: req.user });
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

    // GET /auth/github/callback
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request.  If authentication fails, the user will be redirected back to the
    //   login page.  Otherwise, the primary route function will be called,
    //   which, in this example, will redirect the user to the home page.
    app.get('/auth/github/callback', 
      passport.authenticate('github', { failureRedirect: '/login',
                                        failureFlash: true }),
      function(req, res) {
        res.redirect('/');
      }
    );

    app.get('/login', function(req, res) {
      var signup = (req.query.signup ? true:false);
      res.render('login', { user: req.user, signup: signup });
    });

    app.get('/logout', function(req, res) {
      req.logout();
      res.redirect('/');
    });
    
    app.post('/auth/login', 
      passport.authenticate('local', { failureRedirect: '/login' }),
      function(req, res, next) {
        res.redirect('/'); 
      }
    );
    
    app.post('/auth/signin', 
      passport.authenticate('local', { failureRedirect: '/login' }),
      function(req, res, next) {
        res.redirect('/'); 
      }
    );

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
  res.redirect('/login')
}

function displayNameToUsername(displayName) {
  return displayName.split(' ').join('-');
}