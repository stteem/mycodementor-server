var express = require('express');
var passport = require('passport');
var router = express.Router();
var User = require('../models/user');
var authenticate = require('../authenticate');

router.use(express.json());

/* GET users listing. */
router.get('/subscription', function(req, res, next) {
  res.send('respond with a resource');
});