'use strict';

var express = require('express');
var controller = require('./atpdata.controller');

var router = express.Router();

router.get('/rank', controller.getRank);
router.get('/tournaments', controller.getTournaments);


module.exports = router;