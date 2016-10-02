/* 
 * app.js
 * 
 * Our base app code, including Express configs
 */

var express = require('express')
  , engine = require('ejs-locals')
  , app = express()
  , RedisStore = require('connect-redis')(express)
  , sessionStore = new RedisStore('localhost');
  var fs = require('fs'),
    sys = require('sys');

    
var SESSION_SECRET = 'victoriasecret';


exports.init = function(port) {

    app.configure(function(){
        app.set('views', __dirname + '/views');
        app.set('view engine', 'ejs');




        app.use(express.bodyParser({ keepExtensions: true, uploadDir: "uploads" })); 
        app.use(express.methodOverride());
        app.use(express.static(__dirname + '/static'));
        app.use(express.cookieParser());
        app.use(express.session( { secret: "super secret string",
                                    maxAge : Date.now() + 7200000, // # 2h Session lifetime
                                    store: sessionStore
                                  }
                                ));
        app.use(app.router);
        app.enable("jsonp callback");
    });

    app.engine('ejs', engine);

    app.configure('development', function(){
       app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
        // app.use(express.logger({ format: ':method :url' }));
    });

    app.configure('production', function(){
       app.use(express.errorHandler()); 
    });


    app.use( function(err, req, res, next) {
        res.render('500.ejs', { locals: { error: err }, status: 500 });
    });
    
    server = app.listen(port);

    console.log("Listening on port %d in %s mode", server.address().port, app.settings.env);

    return app;
}