const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('edit_albums', {title: 'Intervision - Image Ablums'});
});

module.exports = router;
