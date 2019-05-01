// Stream dimensions
var WIDTH = 800;
var HEIGHT = 450;

// This is proxied by the server
var CAMERA_STREAM_IP = "127.0.0.1:8080";
// Replace with the camera's IP
var CAMERA_CONTROL_IP = CAMERA IP;

// The credentials don't work yet, the camera needs to be open
// var USERNAME = "root";
// var PASSWORD = "enter";
var CAMERA_URL = "";
var CAMERA_CONTROL_URL = "";
var LEFT_CONTROL_STRING = "";
var RIGHT_CONTROL_STRING = "";

var LEFT = "LEFT";
var RIGHT = "RIGHT";

// Create a Rekognition object
// Replace accessKeyId and secretAccessKey with your values
var rekognition = new AWS.Rekognition({apiVersion: '2016-06-27',  "accessKeyId": "YOUR ACCESS KEY ID", "secretAccessKey": "YOUR SECRET ACCESS KEY", "region": "us-east-1"});

var imageStream = null;
var c;

function setup() {
  //CAMERA_URL = "http://" + CAMERA_IP + "/mjpg/video.mjpg";
  CAMERA_URL = "http://" + CAMERA_STREAM_IP + "/stream";
  CAMERA_CONTROL_URL = "http://" + CAMERA_CONTROL_IP + "/axis-cgi/com/ptz.cgi?";
  LEFT_CONTROL_STRING = "speed=50&move=left&zoom=10";
  RIGHT_CONTROL_STRING = "speed=50&move=right&zoom=10";
  
  
  c = createCanvas(WIDTH, HEIGHT);
  imageStream = createImg(CAMERA_URL);

  imageStream.hide();
}

function draw() {
  background(220);
  if (imageStream) {
    image(imageStream, 0, 0); 
  }
}

function keyPressed() {

	// slice and dice image from canvas to get in right format for Rekognition
	var data = c.elt.toDataURL('image/jpeg', 1.0);
	var base64Image = data.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
	var binaryImg = atob(base64Image);
	var length = binaryImg.length;
	var ab = new ArrayBuffer(length);
	var ua = new Uint8Array(ab);
	for (var i = 0; i < length; i++) {
		ua[i] = binaryImg.charCodeAt(i);
	}		

	// d is detectLabels
	if (key == 'd') {
	
		// Rekognition detectLabels
		var params = {
		  Image: { /* required */
			Bytes: ab
		  },
		  MaxLabels: 123, 
		  MinConfidence: 70
		};
		rekognition.detectLabels(params, function(err, data) {
		  if (err) console.log(err, err.stack); // an error occurred
		  else {
			  console.log(data);           // successful response
		  }
		});
		
	} else if (key == 'f') {
		
		// Rekognition searchFaces
		var params = {
		  CollectionId: 'veillance', /* required */
		  Image: { /* required */
			Bytes: ab
		  },
		  FaceMatchThreshold: '90',
		  MaxFaces: '1'
		};
		rekognition.searchFacesByImage(params, function(err, data) {
		  if (err) console.log(err, err.stack); // an error occurred
		  else {
			  console.log(data);           // successful response
// 			  console.log(data.FaceMatches[0].Face);
		  }
		});	
	}
}

function mousePressed() {
 if (mouseX < WIDTH/2) {
  moveCamera(LEFT); 
 } else {
  moveCamera(RIGHT); 
 }
}

function moveCamera(direction) {
  var out = "";
 if (direction == LEFT) {
  out = controlRequest(CAMERA_CONTROL_URL + LEFT_CONTROL_STRING);
 }
 else if (direction == RIGHT) {
  out = controlRequest(CAMERA_CONTROL_URL + RIGHT_CONTROL_STRING);
 }
 //print(out);
}

function controlRequest(url) {  
 fetch(url,{mode: "no-cors"})
  .then(response => {
    if (response.status === 200) {
      return response
    } else {
      //throw new Error('Something went wrong on api server!');
    }
  })
  .then(response => {
    console.debug(response);
  }).catch(error => {
    console.error(error);
  }); 
  
}

