var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var Schema = mongoose.Schema;


var User = new Schema({
  firstname: {
          type: String,
          default: ''
  },
  lastname: {
      type: String,
      default: ''
  },
  email: {
      type: String,
      default: ''
  },
  username: String,
  password: String,
  admin:   {
      type: Boolean,
      default: false
  },
},
{
  timestamps: true
});

User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);