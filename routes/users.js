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
    User.find({email: req.body.email })
    .then((email) => {
        if(email.length == 0){
          const response = { 
           email: false 
          }
          email.push(response);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          return res.json(email);
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(email);
    }, (err) => next(err))
    .catch((err) => {
      console.log('error ', err)
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json(err);
    });
});

router.post('/login', passport.authenticate('local'), ( req, res) => {

  console.log("got here")

  Subscription.findOne({user: req.user._id})
  .then((sub) => {

    let subscription = {
      plan: '',
      price: 0,
      sessions_per_month: 0,
      sessions_scheduled: 0,
      isSubscribed: false
    };

    if(sub !== null){
      subscription = {
        plan: sub.plan,
        price: sub.price,
        sessions_per_month: sub.sessions_per_month,
        sessions_scheduled: sub.sessions_scheduled,
        isSubscribed: true
      };
    }
    
    var token = authenticate.getToken({_id: req.user._id});
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.json({
      subscription: subscription,
      username: req.user.firstname,
      loggedin: true,
      token: token, 
      status: 'Successfully logged in!'
    });
           
  })
});

router.get('/checkJWTtoken', (req, res, next) => {
  passport.authenticate('jwt', {session: false}, (err, user, info) => {
    if (err) {
      console.log('error ', err);
      return next(err);
    }
    if (!user) {
      res.statusCode = 401;
      res.setHeader('Content-Type', 'application/json');
      console.log('info ', info);
      return res.json({status: 'JWT invalid!', success: false, err: info});
    }
    else {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json');
      return res.json({status: 'JWT valid!', success: true, user: user.firstname});
    }
  }) (req, res, next);
});

router.get('/subscription',  cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  User.findById(req.user._id)
  .then((user) => {
    const result = user.subscription[0];
    console.log('get result ', result)

    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    res.json(result);          
  })
  .catch((err) => {
    console.log('error ', err)
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json(err);
  });
});

router.post('/subscription', cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
  
  User.findById(req.user._id)
  .then((user) => {
      if (user != null) {
          req.body.session_per_month = req.body.plan === 'free' ? 2 : 5;
          console.log(req.body)
          user.subscription.unshift(req.body)
          user.save()
          .then((newuser) => {
              const result = newuser.subscription[0];
              console.log('result ', result)

              res.statusCode = 201;
              res.setHeader('Content-Type', 'application/json');
              res.json(result);          
          }, (err) => {
                console.log('error ', err)
                //res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.status(500).json(err);
          })
          .catch(err => {throw(err)})
      }
      else {
          err = new Error('Store ' + req.params.storeId + ' not found');
          err.status = 404;
          res.setHeader('Content-Type', 'application/json');
          res.json(err);
      }
  })
  .catch((err) => {
      console.log('error ', err)
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json(err);
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
