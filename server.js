//importing the packages
const express = require('express');
const mysql = require('mysql2');
const session = require('express-session');//for session management
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');//pass data sent from the front-end of the application
const path = require('path');//access different paths within the application structure
const { check, validationResult } = require('express-validator');//for validation
const dotenv = require('dotenv')
const cors = require('cors');

//configuring the dotenv
dotenv.config();
//initialize
const app = express();
const port = 3000;

//configure - middleware
//middleware is the interface between the frontend and the backend
app.use(express.static(__dirname));//use the static files in our directory
//external files that accompany the main files e.g. images, external js files, other html files
app.use(express.json());//to handle the data
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));//server/frontend modifies the data input to more friendly way for submission
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Configure session middleware
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
}));

//create connection
const connectionPool  = mysql.createPool({
    connectionLimit: 1000,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    port: process.env.DB_PORT,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

//connect to the database
connectionPool.getConnection((err, connection) => {
    if(err){
        console.error('Error occured while connecting to the db server: ' + err.stack);
        return;
    }
    console.log('DB Server connected successfully.');
    connection.release();//release the connection back to the pool
});

//define route to registration form
app.get('/register', (request, response) => {
    response.sendFile(path.join(__dirname, 'register.html'));
});

//display login page
app.get('/login', (request, response) => {
    response.sendFile(path.join(__dirname, "login.html"));
});

//define a User object - registration
const User = {
    tableName: 'users',
    createUser: function(newUser, callback){
        connectionPool.query('INSERT INTO ' + this.tableName + ' SET ?', newUser, callback);
    },
    getUserByEmail: function(email, callback){
        connectionPool.query('SELECT * FROM ' + this.tableName + ' WHERE email = ?', email, callback);
    },
    getUserByUsername: function(username, callback){
        connectionPool.query('SELECT * FROM ' + this.tableName + ' WHERE username = ?', username, callback);
    },
}

//define registration route and logic
app.post('/plp/users/registration', [
    //validation check
    check('email').isEmail().withMessage('Provide valid email address.'),
    check('username').isAlphanumeric().withMessage('Invalid username. Provide aplhanumeric values.'),

    check('email').custom( async(value) => {
        const exist = await User.getUserByEmail(value);
        if(exist){
            throw new Error('Email already exists');
        }
    }),
    check('username').custom( async(value) => {
        const exist = await User.getUserByUsername(value);
        if(exist){
            throw new Error('Username already in use.');
        }
    })
], async (request, response) => {
    //check for validation
    const errors = validationResult(request);
    if(!errors.isEmpty()){
        return response.status(400).json({ errors: errors.array() });
    }

    //hash password
    const saltRounds = 10;//a salt is a piece of random text used in hashing
    const hashedPassword = await bcrypt.hash(request.body.password, saltRounds);

    //define a new user object
    const newUser = {
        full_name: request.body.full_name,
        email: request.body.email,
        username: request.body.username,
        password: hashedPassword
    }

    //log new user data to debug
    console.log('Attempting to create user:', newUser);

    //save new user
    User.createUser(newUser, (error) => {
        if(error){
            console.error('An error occurred while saving the record: ' + error.message);
            return response.status(500).json({ error: error.message });
        }
        console.log('New user record saved!');
        response.status(201).send('Registration successful!');
    });

});

//handle the login logic - authentication
app.post('/api/user/login', (request, response) => {
    const { username, password } = request.body;

    connection.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
        if(err) throw err;
        if(results.length === 0){
            response.status(401).send('Invalid username or password.');
        } else {
            const user = results[0];
            //compare passwords
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if(err) throw err;
                if(isMatch){
                    //storing user data to the session variable
                    request.session.user = user;
                    response.status(200).json({ message: 'Login successful' });
                } else {
                    response.status(401).send('Invalid username or password.');
                }
            });
        }
    });
});

//handle authorization
const userAuthenticated = (request, response, next) => {
    if(request.session.user){
        next();
    } else {
        response.redirect('/login');
    }
}

//secure route
app.get('/dashboard', userAuthenticated, (request, response) => {
    response.status(200).json({ message: 'You are viewing a secured route.'});
});

//destroy session
app.get('/logout', (request, response) => {
    request.session.destroy();
});


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
