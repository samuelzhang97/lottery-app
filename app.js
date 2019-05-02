// Set up
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mysql = require('mysql');

var passport = require('passport');
var flash = require('req-flash');

const app = express();
const port = 5000;

// create connection to database
const db = mysql.createConnection ({
    host: 'localhost',
    user: 'root',
    password: 'cMy6ys929!!1!',
    database: 'testdb'
});

// connect to database
db.connect((err) => {
    if (err) {
        throw err;
    }
    console.log('Connected to database');
});
global.db = db;




app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json()); // parse form data client

// configure middleware
app.set('port', process.env.port || port); // set express to use this port
app.set('views', __dirname + '/views'); // set express to look in this folder to render our view
app.set('view engine', 'ejs'); // configure template engine

app.use(session({
	secret: 'yeetingisgood',
	resave: true,
	saveUninitialized: true
 } ));

require('./config/passport')(passport);

app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// Routes
//require('./routes/index')(app);
require('./routes/user')(app);
require('./routes/login')(app, passport);

// set the app to listen on the port
app.listen(port, () => {
    console.log(`Server running on port: ${port}`);
});