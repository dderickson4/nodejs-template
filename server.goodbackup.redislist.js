/* 
 * server.js
 * 
 * The main file, to be invoked at the command line. Calls app.js to get 
 * the Express app object.
 */

var app = require('./app').init(5000);
//var redis = require("redis-node"),
//    client = redis.createClient();

var redis = require("redis"),
client = redis.createClient();


var bcrypt = require('bcrypt');

cryptPassword = function(password, callback) {
   bcrypt.genSalt(10, function(err, salt) {
    if (err) return callback(err);
      else {
        bcrypt.hash(password, salt, function(err, hash) {
            return callback(err, hash);
        });
      }
  });
};

comparePassword = function(password, userPassword, callback) {
   bcrypt.compare(password, userPassword, function(err, isPasswordMatch) {
      if (err) return callback(err);
      else return callback(null, isPasswordMatch);
   });
};

cryptPassword('donastia', function (err,data){
		console.log(data);
		// data is true in this case...
		comparePassword('donastia','$2a$10$utKtZz9xaDy4xsOEj7nKXuWPu2IIEjk7aOwP7LeZWaaSmMzjMCJ56', function (err,data)
		{
			console.log(err);
			console.log(data);
		});
	});




var locals = {
        title: 		 'Node | Express | EJS | Boostrap',
        description: 'A Node.js applicaton bootstrap using Express 3.x, EJS, Twitter Bootstrap, and CSS3',
        author: 	 'C. Aaron Cois, Alexandre Collin',
        _layoutFile: true
    };

app.get('/', function(req,res){

    locals.date = new Date().toLocaleDateString();

    res.render('home.ejs', locals);
});

var Save = function (org, table, json, callback) {
	
	
	client.incrby (org + ':uid:' + table + 's', 1, function (err, id)
	{
		client.sadd(org + ':' + table + 's', id);
		json.id = id;

		for(var key in json) {
			client.set(org + ':' + table + ':' + key + ':' + id, json[key]);;
		}
		
		var key = 'json:' + org + ':' + table + ':' + id;
		client.set(key,unescape( encodeURIComponent(JSON.stringify(json))));
		client.get(key, function (err,data) {
			callback (null,data);
		});
	});

	//client.sort("org:users", "by", "org:user:*->username", "get", "org:user:*->username", redis.print);
	//SORT org:users BY org:user:* GET org:user:* ALPHA DESC
	/*
			var ret = [];
			for (var i=0; i < data.length; i++)
			{
				var json_obj = data[i];
				var retObj = JSON.parse( decodeURIComponent( escape ( json_obj ) ) );
				ret.push(retObj);
			}

			res.send(ret);
	*/

	/*
	client.sort(org + ':' + table + 's','by',org + ':' + table + ':*','get','json:' + org + ':' + table + ':*','ALPHA','asc', function (err,list)
		{
			callback (null,list);
			
		});
	*/
}

var List = function (org, table, sortby, callback) {
	
	
	
	//client.sort("org:users", "by", "org:user:*->username", "get", "org:user:*->username", redis.print);
	//SORT org:users BY org:user:* GET org:user:* ALPHA DESC
	/*
			var ret = [];
			for (var i=0; i < data.length; i++)
			{
				var json_obj = data[i];
				var retObj = JSON.parse( decodeURIComponent( escape ( json_obj ) ) );
				ret.push(retObj);
			}

			res.send(ret);
	*/

	client.sort(org + ':' + table + 's','by',org + ':' + table + ':' + sortby + ':*','get','json:' + org + ':' + table + ':*','ALPHA','asc', function (err,list)
	{
		callback (null,list);	
	});
}

function makeid()
{
    var text = "";
    var possible = "abcdefghijklmnopqrstuvwxyz";

    for( var i=0; i < 5; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

app.get('/redistest', function (req,res) {
	var json = { 
		username: makeid() + Math.floor((Math.random()*10)+1),
		password: 'banana'
	};

	var org = 'org';
	var table = 'users';

	cryptPassword(json.password, function (err,data){
		console.log(data);
	});

	Save (org,table,json, function (err,data) {
		if (data != null)
		{
			res.send(data );		
		} else {
			res.send(err);
		}
	});
});

app.get('/redislist', function (req,res) {
	var json = { 
		username: makeid() + Math.floor((Math.random()*10)+1),
		password: 'donastia'
	};

	var org = 'org';
	var table = 'users';

	cryptPassword(json.password, function (err,data){
		console.log(data);
	});

	List (org,table,'password', function (err,data) {
		if (data != null)
		{
			var lst = [];
			var cnt = data.length;
			for (var i=0; i < cnt; i++)
			{
				var json_obj = data[i];
				var retObj = JSON.parse( decodeURIComponent( escape ( json_obj ) ) );
				lst.push(retObj);
			}
			var ret = {};
			ret.data = lst;
			ret.error = null;
			ret.count = cnt;
			res.send(ret);		
		} else {
			res.send(err);
		}
	});
});

/* The 404 Route (ALWAYS Keep this as the last route) */
app.get('/*', function(req, res){
    res.render('404.ejs', locals);
});