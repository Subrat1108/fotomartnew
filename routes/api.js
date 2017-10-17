var aws = require('aws-sdk');
var express = require('express');
var router = express.Router();
var fs = require('fs');
var path = require('path');
var mongoose = require( 'mongoose' );
var bCrypt = require('bcrypt-nodejs');
var multer = require('multer');
var multerS3 = require('multer-s3');
var Thought = mongoose.model('Thoughts');
var User = mongoose.model('User');
var Upload = mongoose.model('Upload');

// var storage = s3({
//   destination: function (req, file, cb) {
//     cb(null, 'multer-uploads/uploadedPics')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname))
// 	},
// 	bucket      : 'fotomartploads',
// 	region      : 'us-west-2',
// 	acl : 'public-read'
// });
 
// var upload = multer({ storage: storage });

// var profileStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, './public/uploads/profilePics/')
//   },
//   filename: function (req, file, cb) {
//     cb(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname))
//   }
// })

// var profilePicUpload = multer({ storage: profileStorage });

var s3 = new aws.S3();

var upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: 'fotomartploads',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: file.fieldname});
    },
    key: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now()+ path.extname(file.originalname));
    }
  })
})

var conn = mongoose.connection;


//Used for routes that must be authenticated.
isAuthenticated = function (req, res, next) {
	// if user is authenticated in the session, call the next() to call the next request handler 
	// Passport adds this method to request object. A middleware is allowed to add properties to
	// request and response objects

	//allow all get request methods
	if(req.method === "GET"){
		return next();
	}
	if (req.isAuthenticated()){
		return next();
	}

	// if the user is not authenticated then redirect him to the login page
	res.redirect('/#login');
};


router.post('/picUpload/', upload.single('file'), function (req, res, next) {
  console.log(req.body);
  console.log(req.file);
  var newUpload = {
    name: req.body.name,
		created: Date.now(),
		created_by : req.body.current_user,
    file: req.file
  };
  Upload.create(newUpload, function (err, next) {
    if (err) {

      next(err);
    } else {
      res.send(newUpload);
    }
  });
});

router.get('/picUpload/', function (req, res, next) {
	Upload.find({},  function (err, uploads) {
	  if (err) next(err);
	  else {
		
		res.send(uploads);
	  }
	});
  });

  router.get('/picUpload/:uuid/:filename', function (req, res, next) {
	console.log(req.params);
	Upload.findOne({
	  'file.filename': req.params.uuid,
	  'file.originalname': req.params.filename
	}, function (err, upload) {
	  if (err) next(err);
	  else {
		res.set({
		  "Content-Disposition": 'attachment; filename="' + upload.file.originalname + '"',
		  "Content-Type": upload.file.mimetype
		});
		console.log(upload.file.path);
		fs.createReadStream(upload.file.path).pipe(res);
		console.log('after fs');
	  }
	});
	});
	
	router.get('/picUpload/:user', function(req,res,next){
		console.log('user : '+ req.params.user);
		Upload.find({created_by : req.params.user},function(err,upload){
			if(err) next(err);
			else{
				console.log(upload);
				res.send(upload);
			}
		});
	});

	router.delete('/picUpload/:imgId',function(req, res) {
			Upload.remove({
				_id: req.params.imgId
			}, function(err) {
				if (err)
					res.send(err);
			});
		});

  /***************************************Thoughts Api******************************************** */
router.use('/thoughts', isAuthenticated);

router.route('/thoughts')
	.post(function(req, res){

		var thought = new Thought();
		
		console.log(req.body.post + " by "+ req.body.created_by);
		thought.post = req.body.post;
		thought.created_by = req.body.created_by;
		thought.save(function(err, upload) {
			if (err){
				return res.send(500, err);
			}
			return res.json('thought upload complete');
		});
	})
	//gets all thoughts
	.get(function(req, res){
		Thought.find(function(err, thoughts){
			if(err){
				return res.send(500, err);
			}
			return res.send(thoughts);
		});
	});


/************************************************ others functionality*************************************************************/
	
	//updates specified change
	router.post('/profilePic/',upload.single('file'), function (req, res, next) {
		User.findById(req.params.id, function(err, foundUser){
			console.log(foundUser);
			if(err){
						res.send(err);
					}else{
					if(foundUser != null){
						console.log("changing pic");
						foundUser.file = req.file;
						
						foundUser.save(function(err, foundUser){
										if(err)
											res.send(err);
						
										res.json(foundUser);
									});
									console.log("changed pic to" + foundUser.file);
								
					}else{
						res.send({"Status":"pic Change failed"});
					}
				}

		})
	});
	
	router.get('/profilePic/:id', function(req,res,next){
		console.log('_id : '+ req.params.id);
		User.find({_id : req.params.id},function(err,pic){
			if(err) next(err);
			else{
				console.log(pic);
				res.send(pic);
			}
		});
	});
	
var createHash = function(password){
	return bCrypt.hashSync(password, bCrypt.genSaltSync(10), null);
};	
module.exports = router;
