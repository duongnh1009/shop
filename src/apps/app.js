const express = require('express');
const app = express();
const config = require("config");
const session = require("express-session");
const methodOverride = require('method-override');
const flash = require("connect-flash");

//methodOverride
app.use(methodOverride('_method'));

//flash
app.use(flash());

//session
app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: config.get("app.session_key"),
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

//form
app.use(express.urlencoded({extended: true}));

//static
app.use('/static', express.static(config.get('app.static_folder')));

//config view
app.set("views", config.get('app.view_folder'))
app.set("view engine", config.get('app.view_engine'))

//share
app.use(require("./middlewares/cart"))
app.use(require("./middlewares/share"))

//config router
app.use(require(config.get('app.router')));

module.exports = app;