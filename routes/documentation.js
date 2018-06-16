const express = require('express');
const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('documentation', {title: 'Intervision - Documentation'});
});

module.exports = router;
