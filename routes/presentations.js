const express = require('express');
const router = express.Router();
const fileUpload = require('express-fileupload');
const path = require('path');
const updateFile = require('../util/updateFile.js');


router.use(fileUpload());

// const s3CallBack = function(obj, buckName, rootFolder){
//   if(obj.success){
//     var folders = obj.data;
//
//
//     Object.keys(folders).map(function(objectKey, index) {
//       var rootPath = 'https://s3.eu-west-3.amazonaws.com/'+bucketName+'/'+rootFolder;
//       var brochureName = objectKey;
//       var brochurePages = folders[objectKey];
// }

router.get('/', function(req, res, next) {
  // Create the parameters for calling createBucket
  // var bucketParams = {
  //  Bucket : 'intervision-b2b'
  // };
  //
  // var s3 = new AWS.S3();
  //  // Call S3 to create the bucket
  // s3.listObjects(bucketParams, function(err, data) {
  //    if (err) {
  //       console.log("Error", err);
  //    } else {
  //
  //       res.send(data.Contents);
  //    }
  // });
  res.render('edit_presentation', {title: 'Intervision - Presentation'});
});

router.post('/', function(req, res, next){

  if (typeof req.files.htmlFile === 'undefined'){
    console.log(req.body);
    res.render('update_result', {msg: 'Something went wrong!',
                                 success: false});
  }

  // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
  let htmlFile = req.files.htmlFile;

  // Use the mv() method to place the file somewhere on your server
  htmlFile.mv(path.join(__dirname, '/../public/present.html'), function(err) {
    if (err){
      return res.status(500).send(err);
    }
    var bucket = 'intvsn-b2b', folder='';
    updateFile(bucket, folder);
    res.render('update_result', {msg: 'Presentation updated successfuly',
                                 success: true});
  });
});

module.exports = router;











// var AWS = require('aws-sdk');
// // Set the region
// AWS.config.update({region: 'eu-west-3'});
//
// // Create the parameters for calling createBucket
// var bucketParams = {
//    Bucket : 'intervision-b2b'
// };
//
// const s3 = new AWS.S3();
//  // Call S3 to create the bucket
// s3.listObjects(bucketParams, function(err, data) {
//    if (err) {
//       console.log("Error", err);
//    } else {
//       console.log("Success", data);
//    }
// });
//
//
// var params = {
//   Bucket: 'intervision-b2b',
//   Conditions: [
//
//   ],
//   Prefix: 'brochures/cmc'
// };
// s3.listObjects(params, function(err, data) {
//   if (err) console.log(err, err.stack); // an error occurred
//   else     console.log(data);           // successful response
// });
