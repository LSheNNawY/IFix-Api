const express = require('express');
const router = express.Router();
const jobsController= require("../controllers/jobController")

/* GET users listing. */
router.post('/jobs',async function(req, res, next) {
  await jobsController.createJob(req,res)

});

module.exports = router;