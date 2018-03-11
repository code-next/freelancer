var mongoose   = require('mongoose');
var plmongoose = require('passport-local-mongoose');



var userSchema = new mongoose.Schema ({
    username : { type : String},
    password : { type :String},
    address : {type: String},
    pincode : {type:Number},
    phonenumber:{type: Number},
    name: {type:String},
    utype:{type:Number}

});

userSchema.plugin(plmongoose);
module.exports = mongoose.model("user",userSchema);