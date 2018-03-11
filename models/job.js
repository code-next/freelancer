var mongoose   = require('mongoose');




var jobSchema = new mongoose.Schema ({
    owner : { type : String},
    title : { type :String},
    desc : {type: String},
    rate : {type:Number},
    status:{type: String},
    freelancer: {type:String},
   }, {
    timestamps: true
  }
);


module.exports = mongoose.model("job",jobSchema);