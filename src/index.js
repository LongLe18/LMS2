const path = require('path');
const express = require('express');
const cors = require('cors');
const route = require('./routes');
const app = express();
const passport = require('passport');
const session = require('express-session');

require('dotenv').config();

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

app.listen(process.env.PORT || 3000, () =>
    console.log(`Server listening at http://localhost:${process.env.PORT || 3000}`)
);