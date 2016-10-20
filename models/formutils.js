/*
// code example
cryptPassword('donastia', function (err,data){
		console.log(data);
		// data is true in this case...
		//$2a$10$xeldi3cu7kHDbwXC8fnEoOvoASwPuURC4saRMuMxKgGaK1T0DFhtq
		//$2a$10$utKtZz9xaDy4xsOEj7nKXuWPu2IIEjk7aOwP7LeZWaaSmMzjMCJ56
		comparePassword('donastia',data, function (err,data)
		{
			console.log(err);
			console.log(data);
		});

		comparePassword('donastia','$2a$10$8NTvXmZsEkxXU3DaqoRoievY4lwuJEd1vD2WQzAAazjk6Vz/ZsRgW', function (err,data)
		{
			console.log(err);
			console.log(data);
		});
});
*/
var bcrypt = require('bcrypt');
var locals = {
        title: 		 'Erickson Information Systems',
        description: 'Real-time collaborative forms based web application development services.',
        author: 	 'David Erickson',
        error: '',
        js: '',
        data: { user_name: '',
                org: 'demo',
                user_email: '',
                pwd: '',
                cpwd: '',
                gender: '' },
        _layoutFile: true
    };

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


function FocusElement (id)
{
	locals['js'] += '<script>FocusElement("' + id + '");</script>';
	return '<script>FocusElement("' + id + '");</script>';
}

function Error (strError)
{
    locals['error'] = "";
    locals['js'] = "";
    if (strError != null && strError != "null")
    {
	    strError = '<div id="alert" class="alert alert-error">' + strError + '</div>';
	    locals['error'] = strError;
	    locals['js'] += '<script>' + '$(document).ready(function() {    $("#errorWrapper").show();    });' + '</script>';
	    //FadeError ();
	}
}

function FormData (jsonData)
{
	locals['formdata'] = jsonData;
	//FadeError ();
}

function FadeError ()
{
	locals['js'] += '<script>' + '$(document).ready(function() {     setTimeout(function() {  $("#errorWrapper").fadeOut("slow"); },5000);       });' + '</script>';
}

function Message (strError)
{
    locals['error'] = "";
    locals['js'] = "";
    if (strError != null && strError != "null")
    {
	    strError = '<div id="alert" class="alert alert-success">' + strError + '</div>';
	    locals['js'] += '<script>' + '$(document).ready(function() {    if ($("#alert").html() != "") $("#errorWrapper").show();    });' + '</script>';
	    locals['error'] = strError;
	}
}

function UpdateElementVal (id, val)
{
	// TODO: May need to escape the val for this to work for special characters.
	var strOutput = '<script>' + '$(document).ready(function() {  $("#' + id + '").val("' + val + '");  });' + '</script>';
	locals['js'] += strOutput;
}

function UpdateElementHTML (id, html)
{
	// $("#btnAddProfile").html('Save');
	var strOutput = '<script>' + '$(document).ready(function() {  $("#' + id + '").html("' + html + '");  });' + '</script>';
	locals['js'] += strOutput;
}

// <div class="alert alert-block">
//   <button type="button" class="close" data-dismiss="alert">&times;</button>
//   <h4>Warning!</h4>
//   Best check yo self, you're not...
// </div>
function Warning (strError)
{
    locals['error'] = "";
    if (strError != null && strError != "null")
    {
	    strError = '<div class="alert alert-block"><button type="button" class="close" data-dismiss="alert">&times;</button><h4>Warning!</h4>' + strError + '</div>';
	    locals['error'] = strError;
	}
	FadeError();
}


function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};

function guid_original() {
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
         s4() + '-' + s4() + s4() + s4();
}

function guid() {
  return s4() + (s4().substring(0,2));
}

var lpad = function(value, padding) {
    var zeroes = "0";

    for (var i = 0; i < padding; i++) { zeroes += "0"; }

    return (zeroes + value).slice(padding * -1);
}

Array.prototype.contains = function(obj) {
    var i = this.length;
    while (i--) {
        if (this[i] == obj) {
            return true;
        }
    }
    return false;
}

function getGovtDate()
{
	var myDate = new Date();
	return (myDate.getFullYear() + "" + lpad(myDate.getMonth(),2) + "" + lpad(myDate.getDate(),2) + "" + lpad(myDate.getHours(),2) + "" + lpad(myDate.getMinutes(),2) + "" + lpad(myDate.getSeconds(),2));
}

function getGovtDateWithDashes()
{
	var myDate = new Date();
	return (myDate.getFullYear() + "-" + lpad(myDate.getMonth(),2) + "-" + lpad(myDate.getDate(),2) + "-" + lpad(myDate.getHours(),2) + "-" + lpad(myDate.getMinutes(),2) + "-" + lpad(myDate.getSeconds(),2));
}

function log(str)
{
	if (DEBUG)
	{
		console.log('[' + getGovtDateWithDashes() + '] [' + FORM_NAME + ']' + str);
	}
}

module.exports.guid_original = guid_original;
module.exports.locals = locals;
module.exports.FocusElement = FocusElement;
module.exports.FadeError = FadeError;
module.exports.UpdateElementVal = UpdateElementVal;
module.exports.UpdateElementHTML = UpdateElementHTML;
module.exports.Error = Error;
module.exports.Message = Message;
module.exports.Warning = Warning;
module.exports.cryptPassword = cryptPassword;
module.exports.comparePassword = comparePassword;
module.exports.FormData = FormData;

