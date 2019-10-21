const express = require("express");
const router = express.Router();
const User = require("../models").user;
const Course = require("../models").course;
const Review = require("../models").review;
const mid = require("../middleware/index");

// --01-- GET /api/users 200

router.get("/users", mid.checkAuth, function(req, res, next) {
  res.json(req.authenticatedUser);
});

// --02-- POST /api/users 201

router.post("/users", function(req, res, next) {
  if (req.body.fullName && req.body.emailAddress && req.body.password) {
    // Check if user already exists
    User.findOne({ emailAddress: req.body.emailAddress }, function(err, user) {
      if (err) {
        res.status(400);
        return next(err);
      }
      if (user) {
        let err = new Error("User already exists.");
        err.status = 400; // Bad request
        return next(err);
      }

      // Create and save user to database
      User.create(req.body, function(err, user) {
        if (err) return next(err);
        // Store _id in session
        req.session.userId = user._id;
        // HTTP status = created
        res.status = 201;
        // Set location header
        res.location("/");
        // Redirect to root route
        return res.redirect("/");
      });
    });
  } else {
    let err = new Error(
      "Error: fullName, emailAddress, and password are required."
    );
    err.status = 400; // Bad request
    return next(err);
  }
});

// --03-- GET /api/courses 200
router.get("/courses", function(req, res, next) {
  Course.find({}).exec((err, data) => {
    if (err) return next(err);

    let displayData = [];

    data.forEach(val => {
      displayData.push({ _id: val._id, title: val.title });
    });

    res.status = 200;
    res.json(displayData);
  });
});

// --04-- GET /api/course/:courseId 200

router.get("/courses/:courseId", function(req, res, next) {
  Course.findById(req.params.courseId).exec((err, data) => {
    if (err) {
      res.status(400);
      return next(err);
    }

    Course.findOne({ title: data.title })
      .populate({
        path: "reviews",
        populate: { path: "user", select: "fullName" }
      })
      .populate("user", "fullName")
      .exec(function(err, course) {
        if (err) {
          res.status(400);
          return next(err);
        }
        res.status = 200;
        res.json(course);
      });
  });
});

// --05-- POST /api/courses 201

router.post("/courses", mid.checkAuth, function(req, res, next) {
  // Check if all necessary information has been supplied
  if (
    req.body.title &&
    req.body.description &&
    req.body.user &&
    req.body.steps
  ) {
    // Check if course already exists in database
    Course.findOne({ title: req.body.title }, function(err, user) {
      if (err) return next(err);
      if (user) {
        let err = new Error("Course already exists.");
        err.status = 401;
        return next(err);
      }
      // Create and save user to database
      Course.create(req.body, function(err, course) {
        if (err) return next(err);
        // Store _id in session
        req.session.courseId = course._id;
        // HTTP status = created
        res.status = 201;
        // Set location header
        res.location("/");
        // Redirect to root route
        return res.redirect("/");
      });
    });
  } else {
    let err = new Error(
      "Error: title, description, user, and and steps are required."
    );
    err.status = 400;
    return next(err);
  }
});

// --06-- PUT /api/courses/:courseId 204

router.put("/courses/:courseId", mid.checkAuth, function(req, res, next) {
  // Check if all necessary information has been supplied
  if (
    req.body.title &&
    req.body.description &&
    req.body.user &&
    req.body.steps
  ) {
    Course.findByIdAndUpdate(
      req.params.courseId,
      req.body,
      { upsert: true, new: true },
      (err, course) => {
        if (err) {
          res.status(400);
          return next(err);
        }
        res.status(204).end();
      }
    );
  } else {
    let err = new Error(
      "Error: title, description, user, and and steps are required."
    );
    err.status = 400;
    return next(err);
  }
});

// --07-- POST /api/courses/:courseId/reviews 201

router.post("/courses/:courseId/reviews", mid.checkAuth, function(
  req,
  res,
  next
) {
  if (!req.body.rating) {
    let err = new Error("Rating of 1-5 must be provided.");
    err.status = 400; // Bad request
    return next(err);
  }

  let review = {
    user: req.user,
    rating: req.body.rating,
    review: req.body.review
  };

  console.log("!!!!!11111");

  Course.findById(req.params.courseId, function(err, course) {
    if (err) return next(err);
    if (!course) return res.send();

    Review.create(review, function(err, review) {
      if (err) {
        res.status(400);
        return next(err);
      }

      course.reviews.push(review);

      course.save(function(err, course) {
        if (err) {
          res.status(400);
          return next(err);
        }

        console.log("Setting location header");

        // Set location header
        res.location(`/courses/${req.params.courseId}`);

        res.status(204).end();
      });
    });
  });
});

// // --08--// DELETE /api/users/:userID

// router.delete("/users/:id", function(req, res, next) {
//   User.deleteOne({ _id: req.params.id }, function(err) {
//     if (err) {
//       res.status(400);
//       return next(err);
//     }
//     return res.redirect("/");
//   });
// });

module.exports = router;
