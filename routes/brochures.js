const express = require('express');
const router = express.Router();
const pg = require('pg');
const path = require('path');
const fileUpload = require('express-fileupload');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/b2b';
const s3 = require('../util/s3.js');

router.use(fileUpload());

router.post('/', (req, res, next) => {
  console.log(req.files);
  console.log(req.body);
  if (typeof req.files === 'undefined' || req.files.length < 1){
    res.render('update_result', {msg: 'Something went wrong!',
                                 success: false});
  }

  let files = req.files;
  const bucketName = 'intervision-b2b';
  //var brochurePath = path.join(__dirname, `/../public/tmp/${filename}`);
  const rootName = 'brochures';
  const seriesName = req.body['series-name'];
  let filesToUpload = req.files.length;

  s3.uploadSeries(bucketName, rootName, seriesName, files, function(err, data){
    if(err){
      console.log('Error uploading!');
      res.status(500).send(err);
      return;
    }
    filesToUpload -= 1;
    if(filesToUpload === 0){
      console.log('all set!!');
      res.status(200).send('All Set!');
    }
  });



  // brochure.mv(brochurePath, function(err){
  //   if(err){
  //     console.log(err);
  //     return res.status(500).send(err);
  //   }
  // });

  // var path = require('path');
  // var imgs = []
  // var PDFImage = require('pdf-image').PDFImage;
  // var brochurePath = path.join('./public/tmp/nor.pdf');
  // var pdfImage = new PDFImage(brochurePath, {
  //   convertOptions: {
  //     "-resize": "1800x900",
  //     "-quality": "90"
  //   }
  // });
  // pdfImage.convertFile().then(function (imagePaths) {
  //   imgs = imagePaths;
  //   console.log(imgs);
  // }, function(err){
  //   console.log(err);
  // });

  // s3.uploadBrochure(bucketName, filename, brochure, function(err, data){
  //
  //   }
  //})

  // console.log(req.files.length);
  // const results = [];
  // // Grab data from http request
  // const data = {text: req.body.text, complete: false};
  // // Get a Postgres client from the connection pool
  // pg.connect(connectionString, (err, client, done) => {
  //   // Handle connection errors
  //   if(err) {
  //     done();
  //     console.log(err);
  //     return res.status(500).json({success: false, data: err});
  //   }
  //   // SQL Query > Insert Data
  //   client.query('INSERT INTO items(text, complete) values($1, $2)',
  //   [data.text, data.complete]);
  //   // SQL Query > Select Data
  //   const query = client.query('SELECT * FROM items ORDER BY id ASC');
  //   // Stream results back one row at a time
  //   query.on('row', (row) => {
  //     results.push(row);
  //   });
  //   // After all data is returned, close connection and return results
  //   query.on('end', () => {
  //     done();
  //     return res.json(results);
  //   });
  // });
});

router.get('/', (req, res, next) => {
  const results = [];
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Select Data
    const query = client.query('SELECT * FROM items ORDER BY id ASC;');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});


router.delete('/:brochure_id', (req, res, next) => {
  const results = [];
  // Grab data from the URL parameters
  const id = req.params.brochure_id;
  // Get a Postgres client from the connection pool
  pg.connect(connectionString, (err, client, done) => {
    // Handle connection errors
    if(err) {
      done();
      console.log(err);
      return res.status(500).json({success: false, data: err});
    }
    // SQL Query > Delete Data
    client.query('DELETE FROM items WHERE id=($1)', [id]);
    // SQL Query > Select Data
    var query = client.query('SELECT * FROM items ORDER BY id ASC');
    // Stream results back one row at a time
    query.on('row', (row) => {
      results.push(row);
    });
    // After all data is returned, close connection and return results
    query.on('end', () => {
      done();
      return res.json(results);
    });
  });
});


module.exports = router;
