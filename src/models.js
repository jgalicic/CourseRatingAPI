const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

const UserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  emailAddress: {
    type: String,
    unique: true,
    required: true,
    match: [
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
      "Please fill a valid email address"
    ]
  },
  password: {
    type: String,
    required: true
  }
});

const CourseSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  estimatedTime: {
    type: String
  },
  materialsNeeded: {
    type: String
  },
  steps: [
    { stepNumber: { type: Number } },
    { title: { type: String, required: true } },
    { description: { type: String, required: true } }
  ],
  reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }]
});

const ReviewSchema = new mongoose.Schema({
  user: { type: Schema.Types.ObjectId, ref: "User" },
  postedOn: { type: Date, default: Date.now },
  rating: { required: true, type: Number, min: 1, max: 5 },
  review: { type: String }
});

// authenticate input against database documents
UserSchema.statics.authenticate = function(emailAddress, password, callback) {
  User.findOne({ emailAddress: emailAddress }).exec(function(error, user) {
    if (error) {
      return callback(error);
    } else if (!user) {
      let err = new Error("User not found.");
      err.status = 401;
      return callback(err);
    }

    // Test without bcrypt
    // return callback(null, user);

    bcrypt.compare(password, user.password, function(error, result) {
      if (result === true) {
        return callback(null, user);
      } else {
        return callback();
      }
    });
  });
};

// hash password before saving to database
UserSchema.pre("save", function(next) {
  let user = this;
  bcrypt.hash(user.password, 10, function(err, hash) {
    if (err) {
      return next(err);
    } else {
      user.password = hash;
      next();
    }
  });
});

const User = mongoose.model("User", UserSchema);
const Course = mongoose.model("Course", CourseSchema);
const Review = mongoose.model("Review", ReviewSchema);

module.exports.user = User;
module.exports.course = Course;
module.exports.review = Review;
