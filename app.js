const express = require('express')
const app = express()
const Sequelize = require('sequelize')
const passport = require('passport')
const localStrategy = require('passport-local')
const user = require('./models/user')
const job = require('./models/job')
const bid = require('./models/bid')
const rating = require('./models/rating')
var ObjectId = require('mongodb').ObjectID;
app.use('/public', express.static('public')) //setting publix as static

// set the view engine to ejs
app.set('view engine', 'ejs')

//authentication configurations
app.use(require('body-parser').urlencoded({ extended: true }))
app.use(require('cookie-parser')())
app.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }))



//Database connection- We are using Sqlite DB
var mongoose = require('mongoose')
mongoose.Promise = global.Promise
mongoose.connect('mongodb://localhost:27017/freelance')



app.use(require('express-session')({
    secret: "Secret word goes here in production",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());



//routes
app.get('/', (req, res) => {
    res.render('index');
});

app.post('/signup', function (req, res) {
    console.log(req.body);
    user.register(new user({ username: req.body.username, name: req.body.name, pincode: req.body.pincode, phonenumber: req.body.phonenumber, address: req.body.address, utype: req.body.utype }),
        req.body.password,
        function (err, user) {
            if (err) {
                //errror handling
                console.log("ntho error")
                console.log(err)
            }
            passport.authenticate("local")(req, res, function () {
                res.redirect('/dashboard')
            });
        });
});

app.post('/signin', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/'
}), function (req, res) {

});
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/');
}
app.get('/dashboard', isLoggedIn, (req, res) => {
    if (req.user.utype == 1) {
        job.
            find({
                freelancer: req.user.username,
                status: "On Going"
            }).
            sort({ createdAt: -1 }).
            exec((err, jobs) => {
                job.
                    find({
                        freelancer: "Unassigned"
                    }).
                    sort({ createdAt: -1 }).
                    exec((err, newjobs) => {
                        res.render("freelancer", {
                            jobs: jobs,
                            newjobs: newjobs,
                        });
                    });

            });


    } else if (req.user.utype == 2) {
        job.
            find({
                owner: req.user.username
            }).
            sort({ createdAt: -1 }).
            exec((err, jobs) => {
                bid.
                    find({
                        recruiter: req.user.username
                    }).
                    sort({ createdAt: -1 }).
                    exec((err, bids) => {

                        res.render("recruiter", {
                            jobs: jobs,
                            bids: bids
                        })
                    });

            });

    }
})
app.post('/postjob', isLoggedIn, (req, res) => {
    var newjob = new job({
        owner: req.user.username,
        title: req.body.title,
        desc: req.body.desc,
        rate: req.body.rate,
        status: "New",
        freelancer: "Unassigned"
    });

    newjob.save(function (err, datas) {
        if (!err) {
            res.redirect('/dashboard')

        }
        else {
            console.log(err);
        }
    });
});
app.get('/logout', function (req, res) {
    req.logout();
    res.redirect('/');
})
app.post('/bid', isLoggedIn, (req, res) => {
    var obid = mongoose.Types.ObjectId(req.body.id);
    job.
        findOne({
            _id: obid
        }).
        exec((err, job) => {
            console.log(err)
            if (!err) {

                var newbid = new bid({
                    bidder: req.user.username,
                    rate: req.body.rate,
                    recruiter: job.owner,
                    jobid: job._id,
                    jobtitle: job.title
                })

                newbid.save((error, result) => {

                    if (error) {
                        console.log(error)
                    }
                    res.redirect('/dashboard')
                })
            }
        });

})
app.get('/accept/:id', (req, res) => {
    bid.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }).
        exec((err, onebid) => {
            job.findOne({ _id: mongoose.Types.ObjectId(onebid.jobid) }, function (err, onejob) {
                onejob.status = "On Going";
                onejob.freelancer = onebid.bidder;

                onejob.save(function (err) {
                    if (!err) {
                        bid.deleteMany({ jobid: onejob._id }, function (err) {
                            res.redirect('/dashboard')
                        })
                    }
                });
            });
        })
})
app.get('/reject/:id',(req,res)=>{
    bid.findOne({ _id: mongoose.Types.ObjectId(req.params.id)}).remove(()=>{
        res.redirect('/dashboard')
    })
})
app.get('/finished/:id', (req, res) => {
    job.findOne({ _id: mongoose.Types.ObjectId(req.params.id) }).
        exec((err, onebid) => {
            onebid.status = "Finished";
            onebid.save(function (err) {
                if (!err) {
                    res.redirect('/dashboard')
                }
            })
        });
})
app.get('/faq',(req,res)=>{
    res.render('faq')
})
app.post('/review',(req,res)=>{
    var newrating = new rating({
       title: req.body.title,
       freelancer : req.body.freelancer,
       rating: req.body.rating ,
       review : req.body.review,
       recruiter : req.user.username
    })
    newrating.save((error, result) => {

        if (error) {
            console.log(error)
        }
        res.redirect('/'+req.body.freelancer)
    })
})
app.get('/:usr', (req, res) => {
    user.findOne({ username: req.params.usr }).
        exec((err, freelancer) => {
            rating.find({ freelancer: req.params.usr }).
                exec((err, ratings) => {
                        res.render('profile',{
                            freelancer : freelancer,
                            ratings : ratings
                        })

                });
        });
})

app.listen(3000, () => {
    console.log("Server running at localhost:3000");
})