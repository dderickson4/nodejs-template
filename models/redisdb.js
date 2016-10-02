var utils = require('./formutils.js');
var async = require('async');

var x = 5;
var addX = function(value) {
  return value + x;
};
module.exports.x = x;
module.exports.addX = addX;

var redis = require("redis"),
client = redis.createClient();

function ContainsString(a, obj) {
    for (var i = 0; i < a.length; i++) {
        if (String(a[i]).toLowerCase() == String(obj).toLowerCase()) {
            return true;
        }
    }
    return false;
}

var Exists = function (org, table, arrLookupKeys, cb) {
	var key = "";
	for (var i=0; i < arrLookupKeys.length; i++)
	{
		key += arrLookupKeys[i];
	}
	var lookupKey = org + ':lookup:' + table + ':' + key;
	client.get(lookupKey, function (err, data)
	{
		if (data != null)
		{
			cb(err, true);
		} else {
			cb(err, false);
		}
	});
}

var Delete = function (org, table, arrLookupKeys, callback) {
	GET (org,table,arrLookupKeys, function (err,json) {
			if (json != null)
			{
				json = JSON.parse(json);
				var id = json.id;
				var jsonkey = 'json:' + org + ':' + table + ':' + id;
				for(var key in json) {
					client.del(org + ':lookup:' + table + ':' + json[key]);
					if (arrLookupKeys != null)
					{
						var lookupKey = org + ':lookup:' + table + ':' + key;
						client.del(lookupKey);
						client.del(org + ':lookup:' + table + ':' + json[key]);
						// org:lookup:customer:Simplicity

						if (ContainsString(arrLookupKeys, json[key] + ''))
						{
							client.del(org + ':lookup:' + table + ':' + 's' + ':' + json[key]);
							client.del(org + ':lookup:' + table + ':' + json[key]);

							console.log("org:lookup:user:daviddouglaserickson@yahoo.com");
							console.log(org + ':lookup:' + table + ':' + json[key]);
						}
					}
					// org:lookup:users:daviddouglaserickson@yahoo.com
					client.del(org + ':' + table + ':' + key + ':' + id);
				}
				console.log(jsonkey);
				client.del(jsonkey);
				client.del(org + ":" + table + ":" + id);
				client.srem(org + ':' + table + 's', id);
				client.decrby (org + ':uid:' + table + 's', 1);

				client.get (org + ':uid:' + table + 's', function (err, data)
				{
					if (callback != null)
					{
						callback(err,data);
					}
				});
			} else {
				var ret = {};
				ret.error = 'No entries found to delete.';
				callback (ret,0);
			}
	});
	
}

exports.GetKey = function (key, callback) {
	console.log(client.get(key));
	return client.get(key);
	//client.get(key, function (err, data)
	//{
	//	if (callback != null) {
	//		callback(err, data);
	//	}
	//	GetKey = data;
	//	console.log(data);
	//	return data;
	//});
}

function SetKey (key, value, callback) {
	
	client.set(key, value, function (err, data)
	{
		if (callback != null) {
			callback(err, data);
		}
		return data;
	});
}

// 1) "org:users:user_email:1"
//  2) "org:users:cpwd:1"
//  3) "org:users:id:1"
//  4) "org:users:pwd:1"
//  5) "org:userss"
//  6) "org:uid:userss"
//  7) "json:org:users:1"
//  8) "org:lookup:users:daviddouglaserickson@yahoo.com"
//  9) "org:users:user_name:1"
// 10) "org:users:gender:1"
var GET = function (org, table, arrLookupKeys, callback) {
	var key = "";
	for (var i=0; i < arrLookupKeys.length; i++)
	{
		key += arrLookupKeys[i];
	}
	//var lookupKey = org + ':lookup:' + table + ':' + key;
	//for (var i=0; i < arrLookupKeys.length; i++)
	//{
		//var key = arrLookupKeys[i];
		var lookupKey = org + ':lookup:' + table + ':' + key;
		var jsonKey = 'json:' + org + ':' + table + ':' + key;
		
		client.get(jsonKey, function (err, data)
		{
			if (data != null)
			{
				callback (err, data);
			} else {
				client.get(lookupKey, function (err, key)
				{
					if (key != null)
					{
						client.get(key, function (err, data)
						{
							callback(err,data);
						});
					} else {
						callback(err, null);
					}
				});
			}
		});	
	//}
}

var Save = function (org, table, json, arrLookupKeys, callback) {
	client.incrby (org + ':uid:' + table + 's', 1, function (err, id)
	{
		
		if (json.id == undefined || (json.id + "").length == 0)
		{
			json.id = utils.guid_original();
		}
		json.sys__order = id;


		id = json.id;

		client.sadd(org + ':' + table + 's', id);
		var jsonkey = 'json:' + org + ':' + table + ':' + id;

		if (arrLookupKeys != null)
		{
			var lookupkey = "";
			for (var i=0; i < arrLookupKeys.length; i++)
			{
				lookupkey += arrLookupKeys[i];
			}
			// lookupkey will be a composite of primary key values.
			// this could be used to check uniqueness before a save
			// is done.
			console.log(lookupkey);
			client.set(org + ':lookup:' + table + ':' + lookupkey,jsonkey);
		}


		for(var key in json) {
			if (key == 'id')
			{
				client.set(org + ':lookup:' + table + ':' + json[key],jsonkey);
			}
			client.set(org + ':' + table + ':' + key + ':' + id, json[key]);
		}
		
		
		client.set(jsonkey,unescape( encodeURIComponent(JSON.stringify(json))), function (err, data)
		{
			client.get(jsonkey, function (err,_data) {
				callback (null,_data);
			});
		});
		
	});
}

var List = function (org, table, sortby, direction, callback) {
	client.sort(org + ':' + table + 's','by',org + ':' + table + ':' + sortby + ':*','get','json:' + org + ':' + table + ':*','ALPHA',direction, function (err,list)
	{
		callback (null,list);	
	});
}


var	ListLimit = function (org, table, sortby, direction, sorttype, skip, take, callback) {
	if ((sorttype + '').length == 0)
	{
		client.sort(org + ':' + table + 's','by',org + ':' + table + ':' + sortby + ':*','get','json:' + org + ':' + table + ':*','ALPHA',direction, 'LIMIT',skip,take, function (err,list)
		{
			//return list;
			callback (null,list);	
		});
	} else 
	{
		client.sort(org + ':' + table + 's','by',org + ':' + table + ':' + sortby + ':*','get','json:' + org + ':' + table + ':*','ALPHA',sorttype,direction, 'LIMIT',skip,take, function (err,list)
		{
			//return list;
			callback (null,list);	
		});
	}
}

//module.exports.SetKey = SetKey;
//module.exports.GetKey = GetKey;
module.exports.Delete = Delete;
module.exports.addX = addX;
module.exports.ListLimit = ListLimit;
module.exports.Exists = Exists;
module.exports.GET = GET;
module.exports.List = List;
module.exports.Save = Save;