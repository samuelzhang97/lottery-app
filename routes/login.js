module.exports = function(app, passport){
    app.get('/login', (req, res) => {
        console.log(req.flash('message'));
        console.log(req.flash('username'));
        if (req.isAuthenticated()) {
            res.redirect('/profile');
        }
        else 
            res.render('login.ejs', {
                title: "Login"
                ,message: req.flash('message')
                ,username: req.flash('username')
            });
    });

    app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }),
        (req, res) => {
        console.log("yeet");
        if (req.body.remember) {
            req.session.cookie.maxAge = 1000 * 60 * 3;
        } else {
            req.session.cookie.expires = false;
        }
        res.render('login.ejs', {
            title: "Login",
            username: req.body.username,
            password: req.body.password
            
        });
    });

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/login');
    });
};
