//import packages
var express = require('express');
var bodyParser = require('body-parser');
var passport = require('passport');

//import authentication file
var authenticate = require('../utility/authenticate');

//import models
var User = require('../models/user');

//create route
var router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.get('/', authenticate.verifyUser, authenticate.verifyLogin, authenticate.verifyAdmin, function (req, res, next) {
  User.find({})
    .then((users) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json(users);
    }, (err) => next(err))
    .catch((err) => next(err));
});

//signup user
router.post('/signup', (req, res, next) => {
  if (req.body.pancard !== null) {
    User.register(new User({ username: req.body.username, pancard: req.body.pancard}),
      req.body.password, (err, user) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json({ err: err });
        }
        else {
          if (req.body.firstname)
            user.firstname = req.body.firstname;
          if (req.body.lastname)
            user.lastname = req.body.lastname;
          if (req.body.pancard)
            user.pancard = req.body.pancard;
          if(req.body.type)
            user.type = req.body.type;
          user.logout = 0;
          user.save((err, user) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              res.json({ err: err });
              return;
            }
            passport.authenticate('local')(req, res, () => {
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.json({ success: true, status: 'Registration Successful!' });
            });
          });
        }
      });
  }
  else {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.json({ err: 'Please Provide PanCard Details' });
    return;
  }

});

//login user
router.post('/login', passport.authenticate('local'), (req, res) => {
  var token = authenticate.getToken({ _id: req.user._id, type: req.user.type, timestamp: Math.floor(new Date()/1000) });
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, token: token, status: 'You are successfully logged in!' });

});

//logout user
router.get('/logout', authenticate.verifyUser, authenticate.verifyLogin, (req, res, next) => {
  User.findByIdAndUpdate(authenticate.logout(),{
    $set : {logout: Math.floor(new Date()/1000)}
  }, {new: true}, (err, user) => {
    if(err){
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({ success: false, status: 'Error Occured' });
    }
    else {
      res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({ success: true, status: 'You are successfully logged out!' });
    }
  });
});

router.get('/authPan', authenticate.verifyUser, authenticate.verifyLogin, (req, res, next) => {
  let pan = authenticate.getPan();
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, pan: pan});
});


//auth user
router.get('/authUser', authenticate.verifyUser,
 authenticate.verifyLogin,
 (req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, status: 'You are authenticated' });
});


//auth Employee
router.get('/authEmployee', authenticate.verifyUser,
 authenticate.verifyLogin,
 authenticate.verifyEmployee,
 (req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, status: 'You are authenticated' });
});

//auth Admin
router.get('/authAdmin', authenticate.verifyUser,
 authenticate.verifyLogin,
 authenticate.verifyAdmin,
 (req, res, next) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({ success: true, status: 'You are authenticated' });
});

module.exports = router;
