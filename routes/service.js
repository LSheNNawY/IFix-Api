const serviceController = require('../controllers/serviceController')
const express = require('express')
const serviceRouter = express.Router();

serviceRouter.get('/service', async function (req, res, next) {
    await serviceController.getAllService(req, res);
});


serviceRouter.post('/service', async (req, res,next) => {
    await serviceController.createService(req, res);
});

serviceRouter.get('/service/:id', async function (req, res, next) {
    await serviceController.getServiceById(req, res);
});

serviceRouter.put('/service/:id', async function (req, res, next) {
    await serviceController.updateService(req, res);
});

serviceRouter.delete('/service/:id', async function (req, res, next) {
    await serviceController.deleteService(req, res);
});


module.exports= serviceRouter;
