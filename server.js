var fs = require('fs');

// Don't forget to install with NPM
var AWS = require('aws-sdk');

// Create a Rekognition
// Replace accessKeyId and secretAccessKey with your values
var rekognition = new AWS.Rekognition({apiVersion: '2016-06-27',  "accessKeyId": "YOUR ACCESS KEY ID", "secretAccessKey": "YOUR SECRET ACCESS KEY ID",, "region": "us-east-1"});

// Have to proxy the stream from the camera for p5.js
//https://github.com/legege/node-mjpeg-proxy
var MjpegProxy = require('mjpeg-proxy').MjpegProxy;

var express = require('express')
var app = express()

app.use(express.static('public'));

// Put in the actual camera IP
var CAMERA_IP = "CAMERA IP";

// Credentials don't work yet
// var USERNAME = "root";
// var PASSWORD = "enter";
var CAMERA_URL = "http://" + CAMERA_IP + "/mjpg/video.mjpg";

app.get('/', function (req, res) {
  res.send('Hello World!')
});

// Proxy the mjpeg stream
app.get('/stream', new MjpegProxy(CAMERA_URL).proxyRequest);

// Just an example showing how to submit an image from node
app.get('/test', function (req, res) {
	// Search for face match
	fs.readFile("bikes.jpg", function(err, data) {
	   var imageBuffer = new Buffer(data);

		var params = {
		  CollectionId: 'veillance', /* required */
		  Image: { /* required */
			Bytes: imageBuffer
		  },
		  FaceMatchThreshold: '90',
		  MaxFaces: '1'
		};
		rekognition.searchFacesByImage(params, function(err, data) {
		  if (err) console.log(err, err.stack); // an error occurred
		  else {
			  console.log(data);           // successful response
			  console.log(data.FaceMatches[0].Face);
		  }
		});
	});
});

// Prime the pump, create a face detection database with the images in the prime directory
app.get('/prime', function (req, res) {

	// Create a collection for the target images
	var vparams = {
	  CollectionId: "veillance"
	};
	
	rekognition.deleteCollection(vparams, function(err, data) {
		if (err) console.log(err, err.stack); // an error occurred
		else console.log("delete",data);           // successful response
		
			rekognition.createCollection(vparams, function(err, data) {
			   if (err) {
				console.log(err, err.stack); // an error occurred
			   }
			   else {
				console.log("create",data);           // successful response

				// Create the index // read all of the images in the directory
				fs.readdir("prime", function(err, list) {
					list.forEach(function (filename) {
						if (filename.includes(".jpg") || filename.includes(".png")) {
							fs.readFile("prime/"+filename, function(err, data) {
								console.log(filename);
					
								var imageBuffer = new Buffer(data);
			
								var params = {
								  CollectionId: "veillance", 
								  DetectionAttributes: ["DEFAULT"], 
								  ExternalImageId: filename, 
								  Image: {
									Bytes: imageBuffer
								  }
								};
								rekognition.indexFaces(params, function(err, data) {
								   if (err) console.log(err, err.stack); // an error occurred
								   else     console.log("index",data);           // successful response
								});
							});
						}
					});
				});

			   }	   
			});
	});



});

app.listen(8080, function () {
  console.log('Example app listening on port 8080!')
});
