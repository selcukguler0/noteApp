/*
express
mysql
crypt
nodemon
pug
nodemailer
express-session
body-parser
*/
const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const userRouter = require("./routes/users");
const session = require('express-session');

//APP USAGES
app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "pug");
app.use(express.static(__dirname+'/views/public'));
app.use(session({
    secret: 'real slim shady',
    resave: false,
    saveUninitialized: false
  }));

//ROUTES
app.use(userRouter);

app.listen(3000);