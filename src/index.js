const path = require('path');
const express = require('express');
const cors = require('cors');
const route = require('./routes');
const app = express();
const passport = require('passport');
const session = require('express-session');
var https = require('https');
var http = require('http');
var fs = require('fs');

require('dotenv').config();

// This line is from the Node.js HTTPS documentation.
// var options = {
//     key: fs.readFileSync('C:/nginx/ssl/hsaplus_edu_vn/private.key'),
//     cert: fs.readFileSync('C:/nginx/ssl/hsaplus_edu_vn/hsaplus_edu_vn.crt')
//};

app.use(cors());
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(
    express.urlencoded({
        extended: true,
    })
);

app.use(session({ secret: 'SECRET', resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());

route(app);

// app.listen(process.env.port || 3000, () =>
//     console.log(`Server listening at http://localhost:${rocess.env.port || 3000}`)
// );

// Create an HTTP service.
http.createServer(app).listen(process.env.port || 3000);
// Create an HTTPS service identical to the HTTP service.
// https.createServer(options, app).listen(process.env.port || 3000,()=>{
//      console.log(`Server is running at port ${process.env.port || 3000}`)
// });

//require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();