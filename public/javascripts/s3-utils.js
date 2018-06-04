
var albumBucketName = 'intvsn-b2b';
var bucketRegion = 'eu-west-2';
var IdentityPoolId = 'eu-west-2:c58af998-a9e9-4e51-b8cd-66a8e1bee0fb';

AWS.config.update({
  region: bucketRegion,
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: IdentityPoolId
  })
});

var s3 = new AWS.S3({
  apiVersion: '2006-03-01',
  params: {Bucket: albumBucketName}
});


function listAlbums() {
  s3.listObjects({Delimiter: '/'}, function(err, data) {
    if (err) {
      return alert('There was an error listing your albums: ' + err.message);
    } else {
      var albums = data.CommonPrefixes.map(function(commonPrefix) {
        var prefix = commonPrefix.Prefix;
        var albumName = decodeURIComponent(prefix.replace('/', ''));
        return getHtml([
          '<li class="album col-md-4">',
          '<span class="title" onclick="viewAlbum(\'' + albumName + '\')">',
              albumName,
            '</span>',
            '<span class="btn btn-danger delete" onclick="deleteAlbum(\'' + albumName + '\')">',
            'x',
            ,'</span>',
          '</li>'
        ]);
      });
      var message = albums.length ?
        getHtml([
          '<p>Click on an album name to view it.</p>',
          '<p>Click on the X to delete the album.</p>'
        ]) :
        '<p>You do not have any albums. Please Create album.';
      var htmlTemplate = [
        '<h2>Albums</h2>',
        message,
        '<ul class="nav albums row">',
          getHtml(albums),
        '</ul>',
        '<button class="btn btn-success" onclick="createAlbum(prompt(\'Enter Album Name:\'))">',
          '<i class="fa fa-user"> </i>',
          'Create New Album',
        '</button>'
      ]
      document.getElementById('app').innerHTML = getHtml(htmlTemplate);
    }
  });
}













function createAlbum(albumName) {
  albumName = albumName.trim();
  if (!albumName) {
    return alert('Album names must contain at least one non-space character.');
  }
  if (albumName.indexOf('/') !== -1) {
    return alert('Album names cannot contain slashes.');
  }
  var albumKey = encodeURIComponent(albumName) + '/';
  s3.headObject({Key: albumKey}, function(err, data) {
    if (!err) {
      return alert('Album already exists.');
    }
    if (err.code !== 'NotFound') {
      return alert('There was an error creating your album: ' + err.message);
    }
    s3.putObject({Key: albumKey}, function(err, data) {
      if (err) {
        return alert('There was an error creating your album: ' + err.message);
      }
      alert('Successfully created album.');
      viewAlbum(albumName);
    });
  });
}















function viewAlbum(albumName) {
  var albumPhotosKey = encodeURIComponent(albumName) + '/';
  s3.listObjects({Prefix: albumPhotosKey}, function(err, data) {
    if (err) {
      return alert('There was an error viewing your album: ' + err.message);
    }
    // `this` references the AWS.Response instance that represents the response
    var href = this.request.httpRequest.endpoint.href;
    var bucketUrl = href + albumBucketName + '/';

    console.log(data.Contents);

    var photos = data.Contents.map(function(photo) {
      if(photo.Size === 0){
        return null;
      }
      var photoKey = photo.Key;
      var photoUrl = bucketUrl + encodeURIComponent(photoKey);
      return getHtml([
        '<div class="image">',
          '<div>',
            '<img style="width:128px;height:128px;" src="' + photoUrl + '"/>',
          '</div>',
          '<span class="btn btn-danger delete" onclick="deletePhoto(\'' + albumName + "','" + photoKey + '\')">',
              'X',
            '</span>',
          '<div>',
            '<span>',
              photoKey.replace(albumPhotosKey, ''),
            '</span>',
          '</div>',
        '</div>',
      ]);
    });
    var message = photos.length ?
      '<p>Click on the X to delete the photo</p>' :
      '<p>You do not have any photos in this album. Please add photos.</p>';
    var htmlTemplate = [
      '<h4>',
        'Album: ' + albumName,
      '</h4>',
      message,
      '<div>',
        getHtml(photos),
      '</div>',
      '<input class="control-group" id="photoupload" type="file" accept="image/*" multiple></br>',
      '<button id="addphoto" class="btn btn-success" onclick="addPhoto(\'' + albumName +'\')">',
        '+ Add Photo',
      '</button>',
      '<button class="btn btn-warning" onclick="listAlbums()">',
        'Back To Albums',
      '</button>',
    ]
    document.getElementById('app').innerHTML = getHtml(htmlTemplate);
  });
}











function addPhoto(albumName) {
  files = document.getElementById('photoupload').files;
  if (!files.length) {
    return alert('Please choose a file to upload first.');
  }

  console.log(files);

  for(var i = 0; i < files.length ; i++){

    file = files[i];

    var fileName = file.name;
    var albumPhotosKey = encodeURIComponent(albumName) + '/';

    var photoKey = albumPhotosKey + fileName;
    s3.upload({
      Key: photoKey,
      Body: file,
      ACL: 'public-read'
    }, function(err, data) {
      if (err) {
        return alert('There was an error uploading your photo: ', err.message);
      }
      console.log(data);
      alert('Successfully uploaded ' + data.key);
      viewAlbum(albumName);
    });
  }


  //var file = files[0];
}








function deletePhoto(albumName, photoKey) {
  s3.deleteObject({Key: photoKey}, function(err, data) {
    if (err) {
      return alert('There was an error deleting your photo: ', err.message);
    }
    alert('Successfully deleted photo.');
    viewAlbum(albumName);
  });
}







function deleteAlbum(albumName) {
  var albumKey = encodeURIComponent(albumName) + '/';
  s3.listObjects({Prefix: albumKey}, function(err, data) {
    if (err) {
      return alert('There was an error deleting your album: ', err.message);
    }
    var objects = data.Contents.map(function(object) {
      return {Key: object.Key};
    });
    s3.deleteObjects({
      Delete: {Objects: objects, Quiet: true}
    }, function(err, data) {
      if (err) {
        return alert('There was an error deleting your album: ', err.message);
      }
      alert('Successfully deleted album.');
      listAlbums();
    });
  });
}



function getHtml(template) {
          return template.join('\n');
       }


listAlbums();




