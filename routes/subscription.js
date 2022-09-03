var express = require('express');
var router = express.Router();
var Subscription = require('../models/subscription');
var authenticate = require('../authenticate');
var cors = require('./cors');


router.use(express.json());

/* GET users listing. */
router.get('/get_subscription',  cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
  Subscription.findOne({user: req.user._id})
  .then((sub) => {
    if(sub !== null){
      let body = {
        plan: sub.plan,
        price: sub.price,
        sessions_per_month: sub.sessions_per_month,
        sessions_scheduled: sub.sessions_scheduled,
        isSubscribed: true
      }
  
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.json(body); 
    }
    else {
      let body = {
        plan: '',
        price: 0,
        sessions_per_month: 0,
        sessions_scheduled: 0,
        isSubscribed: false
      }
      res.statusCode = 201;
      res.setHeader('Content-Type', 'application/json');
      res.json(body);
    }            
  })
  .catch((err) => {
      res.statusCode = 500;
      res.setHeader('Content-Type', 'application/json');
      res.json(err);
  });
});

router.post('/subscribe', cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
  Subscription.findOne({user: req.user._id})
  .then((sub) => {
    if(sub === null){
      let body = {
        plan: req.body.plan,
        price: req.body.value,
        sessions_per_month: req.body.sessions,
        sessions_scheduled: 0,
        user: req.user._id
      }
      Subscription.create(body)
      .then((new_sub) => {
        let new_body = {
          plan: new_sub.plan,
          price: new_sub.price,
          sessions_per_month: new_sub.sessions_per_month,
          sessions_scheduled: new_sub.sessions_scheduled,
          isSubscribed: true
        }

        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.json(new_body);
      })
      .catch((err) => {
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.json(err);
      });
    }
    else {
      let update = {
        plan: req.body.plan,
        price: req.body.value,
        sessions_per_month: req.body.sessions,
        sessions_scheduled: 0,
      }
      Subscription.findOneAndUpdate({user: req.user._id}, update, {
        new: true,
        useFindAndModify: false
      })
      .then((new_sub) => {
        let new_body = {
          plan: new_sub.plan,
          price: new_sub.price,
          sessions_per_month: new_sub.sessions_per_month,
          sessions_scheduled: new_sub.sessions_scheduled,
          isSubscribed: true
        }

        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.json(new_body);
      })
      .catch((err) => {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'application/json');
        res.json(err);
      });
    }
  })
  .catch((err) => {
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.json(err);
  });
});


router.put('/update_sessions', cors.corsWithOptions, authenticate.verifyUser, async (req, res) => {
  try {
    let doc = await Subscription.findOne({ user: req.user._id });
    doc.sessions_scheduled += req.body.value
    await doc.save();

    let new_body = {
      plan: doc.plan,
      price: doc.price,
      sessions_per_month: doc.sessions_per_month,
      sessions_scheduled: doc.sessions_scheduled,
      isSubscribed: true
    }

    res.statusCode = 201;
    res.setHeader('Content-Type', 'application/json');
    res.json(new_body);
  }
  catch(error){
    res.statusCode = 500;
    res.setHeader('Content-Type', 'application/json');
    res.json(error);
  }

});

module.exports = router;