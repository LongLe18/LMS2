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
const { api } = require('./config');
const port = api.port;
const portHttps = api.portHttps;

require('dotenv').config();

// This line is from the Node.js HTTPS documentation.
// var options = {
//     key: fs.readFileSync('ssl/ltqg_key.pem'),
//     ca: fs.readFileSync('ssl/ltqg_csr.pem'),
//     cert: fs.readFileSync('ssl/ltqg_cert.pem')
// };

// const corsOptions = {
//     origin: '*',
//     methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//     preflightContinue: false,
//     optionsSuccessStatus: 204,
//     exposedHeaders: 'Content-Range',
// };

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

app.listen(port, () =>
    console.log(`Server listening at http://localhost:${port}`)
);

// Create an HTTP service.
// http.createServer(app).listen(port);
// Create an HTTPS service identical to the HTTP service.
// https.createServer(options, app).listen(portHttps,()=>{
//     console.log(`Server is running at port ${portHttps}`)
// });

//require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();