const auth = require("basic-auth");
const User = require("../models.js").user;

function checkAuth(req, res, next) {
  let credentials = auth(req);

  // Check credentials
  if (!credentials) {
    let err = new Error("No credentials found");
    res.statusCode = 401;
    res.setHeader("WWW-Authenticate", 'Basic realm="example"');
    return next(err);
  } else {
    User.authenticate(credentials.name, credentials.pass, (err, user) => {
      console.log("Name: ", credentials.name);
      console.log("PASS: ", credentials.pass);
      if (!user) {
        let err = new Error("User not found.");
        err.status = 401;
        return next(err);
      } else if (err) {
        let err = new Error("Invalid credentials.");
        err.status = 401;
        return next(err);
      } else {
        req.authenticatedUser = user;
        return next();
      }
    });
  }
}

module.exports.checkAuth = checkAuth;
