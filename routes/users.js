var express = require('express');
var passport = require('passport');
var router = express.Router();
var User = require('../models/user');
var authenticate = require('../authenticate');

router.use(express.json());

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});


router.post('/signup', (req, res, next) => {

  const newUser = {
    firstname : req.body.firstname,
    lastname : req.body.lastname,
    email : req.body.email,
    username: req.body.email
  }

  User.register(new User(newUser), 
    req.body.password, (err, user) => {
    if(err) {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json({err: err});
      return ;
    }

    passport.authenticate('local')(req, res, () => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      res.json({
        firstname: user.firstname,
        lastname: user.lastname,
        message: 'Sign up successful'
      });
    });
  });
});

router.post('/login', passport.authenticate('local'), (req, res) => {

  var token = authenticate.getToken({_id: req.user._id});
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.json({
    success: true, 
    token: token, 
    status: 'You are successfully logged in!'
  });
});

router.get('/logout', (req, res) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie('session-id');
    res.redirect('/');
  }
  else {
    var err = new Error('You are not logged in!');
    err.status = 403;
    next(err);
  }
});

module.exports = router;
