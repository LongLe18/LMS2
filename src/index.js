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
const security = require('./utils/security');
const studentExamController = require('./controllers/StudentExamController');

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
const server = http.createServer(app);

const io = require('socket.io')(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
        allowedHeaders: ['Authorization'],
        credentials: true,
    },
});

io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    const decoded = security.verifyToken(token);

    if (!decoded) {
        return next(new Error('Authentication error'));
    }

    socket.user = decoded;
    next();
});
io.on('connection', (socket) => {
    socket.on('update exam', async (data) => {
        const result = await studentExamController.putUpdatev2(
            data,
            socket.user.userId,
            socket.handshake.query.dthv_id
        );
        socket.emit('response exam', result);
    });
});

server.listen(process.env.port || 3000);
// Create an HTTPS service identical to the HTTP service.
// https.createServer(options, app).listen(process.env.port || 3000,()=>{
//      console.log(`Server is running at port ${process.env.port || 3000}`)
// });

//require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
