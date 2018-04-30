var mongoose = require("mongoose");
var Campground = require("./models/campground");
var comment = require("./models/comment");

var data = [
  { name: "Clouds Rest",
    image: "http://haileyidaho.com/wp-content/uploads/2015/01/Stanley-lake-camping-Credit-Carol-Waller-2011.jpg",
    description: "Well, the way they make shows is, they make one show. That show's called a pilot. Then they show that show to the people who make shows, and on the strength of that one show they decide if they're going to make more shows. Some pilots get picked and become television programs. Some don't, become nothing. She starred in one of the ones that became nothing."
  },
  { name: "Hollow Trails",
    image: "http://cdn-image.travelandleisure.com/sites/default/files/styles/1600x1000/public/1443561122/CAMPING0915-Glacier-National-Park.jpg?itok=6gQxpDuT",
    description: "Now that there is the Tec-9, a crappy spray gun from South Miami. This gun is advertised as the most popular gun in American crime. Do you believe that shit? It actually says that in the little book that comes with it: the most popular gun in American crime. Like they're actually proud of that shit. "
  },
  { name: "Red Dunes Canopy",
    image: "https://s-media-cache-ak0.pinimg.com/736x/04/f0/c8/04f0c823bd2efc6630c8d643b0bf89a4--tree-camping-go-camping.jpg",
    description: "My money's in that office, right? If she start giving me some bullshit about it ain't there, and we got to go someplace else and get it, I'm gonna shoot you in the head then and there. Then I'm gonna shoot that bitch in the kneecaps, find out where my goddamn money is. She gonna tell me too. Hey, look at me when I'm talking to you, motherfucker. You listen: we go in there, and that nigga Winston or anybody else is in there, you the first motherfucker to get shot. You understand?"
  }
]

function seedDB(){
  Campground.remove({}, function(err){
  // if(err){
    // console.log(err);
  // }
  // console.log("removed campgrounds!");
  // data.forEach(function(seed){
    // Campground.create(seed, function(err, campground){
      // if(err){
        // console.log(err);
      // } else{
        // console.log("added campground");
        // comment.create(
          // {
            // text: "This place is great",
            // author: "homer"
          // }, function(err, comment){
            // if(err){
              // console.log(err);
            // } else {
            // campground.comments.push(comment);
            // campground.save();
            // console.log("created new comment");
          // }
        // });
      // }
    // });
  // });
 });
}

module.exports = seedDB;
