const express = require('express');
const router = express.Router();
const jobsController = require("../controllers/jobController")

/* GET users listing. */
router.post('/jobs', async function (req, res, next) {
    await jobsController.createJob(req, res)
});

router.get('/jobs', async function (req, res, next) {
    await jobsController.getAll(req, res)
});

router.delete('/jobs/:id', async function (req, res, next) {
    await jobsController.deleteJob(req, res)
});

router.put('/jobs/:id/updateStarted', async function (req, res, next) {
    await jobsController.updateStaredAt(req, res)
});

router.put('/jobs/:id/updateEnded', async function (req, res, next) {
    await jobsController.updateEndedAt(req, res)
});

router.put('/jobs/:id/updateDescription', async function (req, res, next) {
    await jobsController.updateDescription(req, res)
});

router.put('/jobs/:id/updateReview', async function (req, res, next) {
    await jobsController.updateReview(req, res)
});

// router.delete('/jobs/:id/deleteReview', async function (req, res, next) {
//     await jobsController.deleteJob(req, res)
// });

module.exports = router;
