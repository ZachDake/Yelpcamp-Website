var express         = require("express"),
    app             = express(),
    bodyParser      = require("body-parser"),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    localStrategy   = require("passport-local"),
    methodOverride  = require("method-override"),
    Campground      = require("./models/campground"),
    comment         = require("./models/comment"),
    User            = require("./models/user"),
    seedDB          = require("./seeds")



mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();


//=================== PASSPORT CONFIGURATION ================================
app.use(require("express-session")({
  secret: "Zach Dake is the Best",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

//============================================================================


app.get("/",function(req, res){
  res.render("Landing");
});

app.get("/campgrounds", function(req, res){
  Campground.find({}, function(err, allCampgrounds){
    if(err){
      console.log(err);
    } else{
      res.render("campgrounds/campgrounds",{campgrounds: allCampgrounds});
    }
  });

});

app.post("/campgrounds", isLoggedIn, function(req, res){
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var newCampground = {name: name, image: image, description: desc, author: author};

  Campground.create(newCampground, function(err, newlyCreated){
    if(err){
      console.log(err);
    } else {
      res.redirect("/campgrounds");
    }
  });
});

app.get("/campgrounds/new", isLoggedIn, function(req, res){
  res.render("campgrounds/new");
});

app.get("/campgrounds/:id", function(req, res){
  Campground.findById(req.params.id).populate("comments").exec(function(err, foundCampground){
    if(err){
      console.log(err);
    } else {
      res.render("campgrounds/show", {campground: foundCampground});
    }
  });
});

//============================== EDIT CAMPGROUND ROUTES =============================================
app.get("/campgrounds/:id/edit", checkUser, function(req, res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
      });
  });

app.put("/campgrounds/:id", function(req, res){
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
    if(err){
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

//=====================================================================================================

//=============================== DESTROY CAMPGROUND ROUTES ===========================================
app.delete("/campgrounds/:id", checkUser, function(req, res){
  Campground.findByIdAndRemove(req.params.id, function(err){
    if(err){
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds");
    }
  });
});


//================================= COMMENT ROUTES =====================================================
app.get("/campgrounds/:id/comments/new", isLoggedIn, function(req, res){
  Campground.findById(req.params.id, function(err, campground){
    if(err){
      console.log(err);
    } else {
      res.render("comments/new", {campground:campground});
    }
  });
});

app.post("/campgrounds/:id/comments", isLoggedIn, function(req, res){
  Campground.findById(req.params.id, function(err, campground){
    if(err){
      console.log(err);
      res.redirect("/campgrounds");
    } else {
      comment.create(req.body.comment, function(err, comment){
        if(err){
          req.flash("error", "Something went wrong");
        console.log(err);
      } else {
        comment.author.id = req.user._id;
        comment.author.username = req.user.username;
        comment.save();
        campground.comments.push(comment);
        campground.save();
        req.flash("success", "Successful post");
        res.redirect('/campgrounds/' + campground._id);
      }
      })
    }
  })
})

app.get("/campgrounds/:id/comments/:comment_id/edit", checkCommentOwnership, function(req, res){
  comment.findById(req.params.comment_id, function(err, foundcomment){
    if(err){
      res.redirect("back");
    } else {
    res.render("comments/edit", {campground_id: req.params.id, comment: foundcomment});
    }
  });
});

app.put("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
  comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedcomment){
    if(err){
      res.redirect('back');
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

app.delete("/campgrounds/:id/comments/:comment_id", checkCommentOwnership, function(req, res){
  comment.findByIdAndRemove(req.params.comment_id, function(err){
    if(err){
      res.redirect("back");
    } else {
      req.flash("success", "Comment Deleted");
      res.redirect("/campgrounds/" + req.params.id);
    }
  })
})
//========================================================================================================

//================================= AUTHENTICATION ROUTES ================================================
app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){
  var newUser = new User({username: req.body.username});
  User.register(newUser, req.body.password, function(err, user){
    if(err){
      req.flash("error", err);
      console.log(err);
      return res.render("register")
      }
      passport.authenticate("local")(req, res, function(){
        req.flash("success", "Welcome to YelpCamp " + user.username);
        res.redirect("/campgrounds");
      });
    });
});

//==========================================================================================================

//======================== LOGIN ROUTES AND FORM ===========================================================
app.get("/login", function(req, res){
  res.render("login");
});

app.post("/login", passport.authenticate("local",
  {
    successRedirect: "/campgrounds",
    failureRedirect: "/login"
  }), function(req, res){
});

//===========================================================================================================

//========================== LOGOUT ROUTES ==================================================================
app.get("/logout", function(req, res){
  req.logout();
  req.flash("success", "Logged You Out!");
  res.redirect("/campgrounds")
});

//================================== MIDDLEWARE =============================================================
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  req.flash("error", "Please Login First!");
  res.redirect("/login");
}

//===========================

function checkUser(req, res, next) {
  if(req.isAuthenticated()){
    Campground.findById(req.params.id, function(err, foundCampground){
        if(err){
          req.flash("error", "campground not found");
          res.redirect("back");
        } else {
          if(foundCampground.author.id.equals(req.user._id)) {
            next();
          } else {
            req.flash("error", "You Don't Have Permission to do That");
            res.redirect("back");
          }
      }
  });
      } else {
        req.flash("error", "You need to be logged in to do that!");
          res.redirect("back");
      }
}

//============================

function checkCommentOwnership(req, res, next) {
  if(req.isAuthenticated()){
    comment.findById(req.params.comment_id, function(err, foundcomment){
        if(err){
          res.redirect("back");
        } else {
          if(foundcomment.author.id.equals(req.user._id)) {
            next();
          } else {
            req.flash("error", "You Dont Have Permission to Do That");
            res.redirect("back");
          }
      }
  });
      } else {
        req.flash("error", "you need to be logged in to do that");
          res.redirect("back");
      }
}

//===================================

app.listen(3000, function(){
  console.log("Yelpcamp Server is running");
})
