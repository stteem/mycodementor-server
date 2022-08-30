var mongoose = require('mongoose');
var passportLocalMongoose = require('passport-local-mongoose');

var Schema = mongoose.Schema;

var Subscription = new Schema({
    plan: {
      type: String, 
      required: true
    },
    price: {
      type: Number, 
      required: true
    },
    sessions_per_month: {
      type: Number,
      required: true 
    },
    sessions_scheduled: {
        type: Number
    },
    user:  {
      type: Schema.Types.ObjectId,
      ref: 'User'
    }
},
{
    timestamps: true
});

Subscription.plugin(passportLocalMongoose);
module.exports = mongoose.model('Subscription', Subscription);