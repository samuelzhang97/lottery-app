var LocalStrategy = require('passport-local').Strategy;
var bcrypt = require('bcrypt-nodejs');
module.exports = function(passport) {
	// used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        done(null, user.user_id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(user_id, done) {
        db.query("SELECT * FROM `users` WHERE user_id = ? ", [user_id], function(err, rows){
            done(err, rows[0]);
        });
    });
   passport.use(
	    'local-login',
	    new LocalStrategy({
	        // by default, local strategy uses username and password, we will override with email
	        usernameField : 'username',
	        passwordField : 'password',
	        passReqToCallback : true
	    },
	    function(req, username, password, done) { // callback with email and password from our form
	        db.query("SELECT * FROM users WHERE username = ?",[username], function(err, rows){
	        	console.log("Start");
	            if (err) return done(err);
	            if (!rows.length) 
	            	return done(null, false, req.flash('message', 'Username not found.')); // req.flash is the way to set flashdata using connect-flash
	            console.log("User found");
	            console.log(username + " " + password);
	            // if the user is found but the password is wrong
	            bcrypt.compare(password, rows[0].password, function(err, res) {
	            	console.log("Compare password");
	            	if (res)
	            		return done(null, rows[0]);
	            	console.log("failed password match");
	            	return done(null, false, req.flash('message', 'Wrong password.'), req.flash('username', username)); // create the loginMessage and save it to session as flashdata
	            });  
	        });
	    })
    );
}

