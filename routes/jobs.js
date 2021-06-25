const express = require('express');
const router = express.Router();
const jobsController = require("../controllers/jobController")

/* GET users listing. */
router.post('/jobs', async function (req, res) {
    await jobsController.createJob(req, res)
});

router.get('/jobs', async function (req, res) {
    await jobsController.getAll(req, res)
});

router.delete('/jobs/:id', async function (req, res) {
    await jobsController.deleteJob(req, res)
});

// router.get('/jobs/:id', async function (req, res) {
//     await jobsController.getJobById(req, res);
// });

router.put('/jobs/:id/updateStarted', async function (req, res) {
    await jobsController.updateStaredAt(req, res)
});

router.put('/jobs/:id/updateEnded', async function (req, res) {
    await jobsController.updateEndedAt(req, res)
});

router.put('/jobs/:id/updateDescription', async function (req, res) {
    await jobsController.updateDescription(req, res)
});

router.put('/jobs/:id/updateReview', async function (req, res) {
    await jobsController.updateReview(req, res)
});

router.put('/jobs/:id/updatePrice', async function (req, res) {
    await jobsController.updatePrice(req, res)
});

// router.delete('/jobs/:id/deleteReview', async function (req, res, next) {
//     await jobsController.deleteJob(req, res)
// });

module.exports = router;
