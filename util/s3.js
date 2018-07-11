var AWS = require('aws-sdk');
var path = require('path');
var fs = require('fs');





function createTree(objects,rootFolder){

  console.log(objects);

  var folders = {};
  objects.forEach(function(obj){
    var path = obj.Key;
    var regex = rootFolder+'(.+)\\/(.+)$';
    var match = path.match(regex)
    if(match && match.length > 0){
      var folder = match[1], filename = match[2];

      if(typeof folders[folder] === 'undefined'){
        folders[folder] = [];
      }

      folders[folder].push(filename);
    }
  });
  console.log(folders);
  return folders;
}


const uploadSeries = function(bucketName, rootName, name, files, callback){
  var s3 = new AWS.S3();

  files.forEach(function(file){
    var uploadParams = {
      Bucket: bucketName,
      Key: '',
      ACL: 'public-read',
      Body: '',
      ContentType: file.mimetype
    };
    // var fileStream = fs.createReadStream(file);
    // fileStream.on('error', function(err) {
    //   console.log('File Error', err);
    // });
    uploadParams.Body = file.data;
    uploadParams.Key = path.join(rootName , name, path.basename(file));
    s3.upload(uploadParams, function (err, data) {
      callback(err, data);
    });
  });

  callback({}, {});


  // call S3 to retrieve upload file to specified bucket
  // var file = file;

  // var fs = require('fs');
  // var fileStream = fs.createReadStream(file);
  // fileStream.on('error', function(err) {
  //   console.log('File Error', err);
  // });
  // uploadParams.Body = file.data;
  //
  // // var path = require('path');
  // uploadParams.Key = name;

  // call S3 to retrieve upload file to specified bucket

}

const getBrochures = function(bucketName, rootFolder, callback){

  var s3 = new AWS.S3();
  var bucketParams = {
    Bucket: bucketName
  }

  s3.listObjects(bucketParams, function(err, data){
    if(err){
      console.log(err);
      return callback({success: false, data: err});
    }else{
      return callback({
                        success: true,
                        data:
                          createTree(data.Contents, rootFolder)
                      },
                      bucketName,
                      rootFolder
                      );
    }
  });
}

const uploadPresentation = function(presentation, callback){
  var s3 = new AWS.S3(),
      bucketName = 'intvsn-b2b';

    var uploadParams = {
      Bucket: bucketName,
      Key: '',
      ACL: 'public-read',
      Body: '',
      ContentType: 'text/html'
    };
    // var fileStream = fs.createReadStream(file);
    // fileStream.on('error', function(err) {
    //   console.log('File Error', err);
    // });
    uploadParams.Body = presentation;
    uploadParams.Key = path.join('presentation/' , 'presentation.html');
    s3.upload(uploadParams, function (err, data) {
      callback(err, data);
    });
}

const s3 = {
  getBrochures,
  uploadSeries,
  uploadPresentation
}
module.exports = s3;
