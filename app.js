var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var session = require('express-session');
var partials = require('express-partials');
var flash = require('express-flash');
var methodOverride = require('method-override');
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

//En produccion(heroku) redirijo las peiciones http a https
if (app.get('env') === 'production'){
  app.use(function(req, res, next){
    if (req.headers['x-forwarded-proto'] !== 'https'){
      res.redirect('https://' + req.get('Host') + req.url);
    } else{
      next()
    }
  });
}

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({secret: "Quiz 2016",
                  resave: false,
                  saveUninitialized: true}));
app.use(methodOverride('_method', {methods: ["POST", "GET"]}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(partials());
app.use(flash());

app.use(function(req, res, next){
  
  //compruebo que el usuario no esta logueado
  if (!req.session.user){
    //console.log('No logueado');
    next();
  }
  else{
    //compruebo si la sesion ha caducado
    if(req.session.user.expire <= new Date().getTime()){
      //destruyo la sesion
      //console.log('Sesion expirada:');
      delete req.session.user;
      next();
    }
    else{
      //console.log('Sesion no expirada:');
      req.session.user.expire = new Date().getTime() + 120000;
      next();
    }
  }
});

//Helper dinamico
app.use(function(req, res, next){
  //Hacer visible req.session en las vistas
  res.locals.session = req.session;
  next();
});

app.use('/', routes);



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'product') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
