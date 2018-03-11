var mongoose   = require('mongoose');




var bidSchema = new mongoose.Schema ({
    bidder : { type : String},
    rate : {type:Number},
    recruiter:{type:String},
    jobid: {type:String},
    jobtitle:{type:String}
   }, {
    timestamps: true
  }
);


module.exports = mongoose.model("bid",bidSchema);