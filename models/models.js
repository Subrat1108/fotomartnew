var mongoose = require('mongoose');

var thoughtSchema = new mongoose.Schema({
	created_by: String,		
	created_at: {type: Date, default: Date.now},
	post : String,
});

var userSchema = new mongoose.Schema({
	username: String,
	password: String, //hash created from password
	file:Object,
	created_at: {type: Date, default: Date.now},	
});

var UploadSchema = new mongoose.Schema({
	name: String,
	created: Date,
	created_by : String,
	file: Object
});

mongoose.model('Thoughts', thoughtSchema);
mongoose.model('User', userSchema);
mongoose.model('Upload', UploadSchema);

// //utility functions
// var User = mongoose.model('User');
// exports.findByUsername = function(userName, callback){

// 	User.findOne({ user_name: userName}, function(err, user){

// 		if(err){
// 			return callback(err);
// 		}

// 		//success
// 		return callback(null, user);
// 	});

// }

// exports.findById = function(id, callback){

// 	User.findById(id, function(err, user){

// 		if(err){
// 			return callback(err);
// 		}

// 		return callback(null, user);
// 	});
// }