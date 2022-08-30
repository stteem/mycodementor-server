var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var Schema = mongoose.Schema;

var subscriptionSchema = new Schema({
    plan: {
      type: String, 
      required: true
    },
    value: {
      type: Number, 
      required: true
    },
    session_per_month: {
      type: Number,
      required: true 
    }
  },
  {
    timestamps: true
  });

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
    subscription: [subscriptionSchema],
    new_subscription: {
      type: Schema.Types.ObjectId,
      ref: 'Subscription'
    }
});

User.plugin(passportLocalMongoose);
module.exports = mongoose.model('User', User);