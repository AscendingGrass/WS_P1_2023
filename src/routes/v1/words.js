const { Router } = require("express");
const testController = require('../../controllers/test');
const wordsController = require('../../controllers/v1/words');

router = new Router();

router.get('/test', testController.test)


module.exports = router