var bcrypt = require('bcrypt-nodejs');

module.exports = function(app) {
    app.get('/', isLoggedIn, (req, res) => {
        res.redirect('/profile');
    })

    app.get('/add_user', (req, res) => {
        res.render('add-user.ejs', {
            title: "Add User"
        });
    });
    app.post('/add_user', (req, res) => {
        let errors = [];
        
        if (req.body.username == "")                            errors.push("Please enter a Username")
        if (req.body.firstname == "")                           errors.push("Please enter a First Name")
        if (req.body.lastname == "")                            errors.push("Please enter a Last Name")
        if (req.body.lastname == "")                            errors.push("Please enter an Email")    
        if (req.body.password.length < 6)                       errors.push("Password must be at least 6 characters");
        else if (req.body.cpassword != req.body.password)       errors.push("Password must be matching");

        if (errors.length > 0) {
            console.log(errors);
            res.render('add-user.ejs', {
                title: "Add User",
                message: errors
            });
        } else {
            console.log("yeet1");
            db.query("SELECT * FROM users WHERE username = ? ", [req.body.username], (err, rows) => {

                console.log("yeet2");
                if (err) return res.status(500).send(err);
                if (rows.length > 0) {
                    message = 'Username already exists';
                    res.render('add-user.ejs', {
                        title: "Add User",
                        message: message
                    });
                    res.end();
                } else {
                    console.log("yeet3");
                    db.query("SELECT * FROM users WHERE email = ? ", [req.body.email], (err, rows) => {
                        console.log("yeet4");
                        if (err) return res.status(500).send(err);
                        if (rows.length > 0) {
                            message = 'Email already exists';
                            res.render('add-user.ejs', {
                               title: "Add User",
                               message: message
                            });
                            res.end();
                        } else {
                            bcrypt.hash(req.body.password, null, null, function(encryptErr, hash) {
                                if (encryptErr) return res.status(500).send(encryptErr);
                                let query = "INSERT INTO users (firstname, lastname, username, email, password) VALUES (?, ?, ? ,? ,?)";
                                let values =   [req.body.firstname, 
                                                req.body.lastname, 
                                                req.body.username, 
                                                req.body.email, 
                                                hash];
                                db.query(query, values, (err, rows) => {
                                    if (err) return res.status(500).send(err);
                                    res.redirect('/login');        
                                });
                            });
                        }
                    });
                }
            });
        }
    });


    app.get('/edit_user', isLoggedIn, (req, res) => {
        db.query("SELECT * FROM users WHERE user_id = ? ", [req.user.user_id], (err, rows) => {
            if (err) return res.status(500).send(err);
            res.render('edit-user.ejs', {
                title: "Edit User"
                ,message: ''
                ,user: req.user
            });
        });
    });


    app.post('/edit_user', isLoggedIn, (req, res) => {
        let query = "UPDATE users SET firstname = ?" +
                                   ", lastname = ?" +
                                   ", email = ?" +
                                   ", username = ? " +
                    "WHERE users.user_id = ?";
        let values =   [req.body.firstname, 
                        req.body.lastname, 
                        req.body.email, 
                        req.body.username,
                        req.user.user_id];

        db.query("SELECT * FROM users WHERE username = ? AND user_id != ?", [req.body.username, req.user.user_id], (err, rows) => {
            if (err) return res.status(500).send(err);
            if (rows.length > 0) {
                message = 'Username already exists';
                res.render('edit-user.ejs', {
                    message,
                    title: "Edit User"
                });
            }
            db.query(query, values, (err, rows) => {
                if (err) return res.status(500).send(err);
                res.redirect('/profile');
            });
        });
    });
    app.get('/delete_user', isLoggedIn, (req, res) => {
        let user_id = req.user.user_id;
        req.logout();
        db.query("DELETE FROM users WHERE user_id = ?", [user_id], (err, rows) => {
            if (err) return res.status(500).send(err);
            res.redirect('/login');
        });
    });
    app.get('/profile/', isLoggedIn, (req, res) => {
            res.render('profile.ejs', {
            title: "Profile"
            ,user: req.user
        });
    });
    app.post('/profile/', isLoggedIn, (req, res) => {
        console.log(req.body);
        if (req.body.action == "edit_user")
            res.redirect('/edit_user');
        else if (req.body.action == "delete_user")
            res.redirect('/delete_user');
        else
            res.redirect('/logout');
    });

}

    function isLoggedIn(req, res, next) {
        // if user is authenticated in the session, carry on
        if (req.isAuthenticated())
        return next();
        // if they aren't redirect them to the home page
        res.redirect('/login');
    };