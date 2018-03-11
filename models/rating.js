var mongoose   = require('mongoose');




var ratingSchema = new mongoose.Schema ({
    freelancer : { type : String},
    rating : {type:Number},
    recruiter:{type:String},
    review: {type:String},
    title:{type:String}
   }, {
    timestamps: true
  }
);


module.exports = mongoose.model("rating",ratingSchema);