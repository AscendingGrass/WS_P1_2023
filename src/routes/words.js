const { Router } = require("express");
const testController = require('../controllers/test');
const userController = require('../controllers/userController');

router = new Router();

router.get('/test', testController.test)


module.exports = router