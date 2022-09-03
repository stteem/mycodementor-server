var express = require('express');
var passport = require('passport');
var router = express.Router();
var User = require('../models/user');
var Subscription = require('../models/subscription');
var authenticate = require('../authenticate');
var cors = require('./cors');

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
  console.log('new user ',newUser)
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

router.post('/emailexists', (req, res, next) => {
    User.findOne({email: req.body.email })
    .then((user) => {
        if(!user){
          let body = {
           email: false
          }
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.json(body);
        }
        let body = { 
          email: user.email 
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(body);
    }, (err) => next(err))
    .catch((err) => {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json(err);
    });
});

router.post('/login', passport.authenticate('local'), ( req, res) => {

  Subscription.findOne({user: req.user._id})
  .then((sub) => {

    let isSubscribed = false;

    if(sub !== null){
      isSubscribed = true;
    }
    
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      username: req.user.firstname,
      loggedin: true,
      token: token, 
      isSubscribed: isSubscribed,
    });
           
  })
});

router.get('/checkJWTtoken', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT invalid!', success: false, err: info});
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT valid!', success: true, user: user.firstname});
    }
  }) (req, res, next);
});

module.exports = router;
