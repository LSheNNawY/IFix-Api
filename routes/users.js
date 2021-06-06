const userController = require("../controllers/userController")
const express = require('express');
const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.get('/users', async(req, res , next) => {
  await userController.getAll(req,res)
});

router.post('/users', async(req, res, next) => {
  await userController.createUser(req,res)
});

router.delete('/users/:id' , async(req, res, next) => {
  await userController.deleteUser(req,res)
});

module.exports = router;
