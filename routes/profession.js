const professionController = require('../controllers/professionController')
const express = require('express')
const professionRouter = express.Router();


professionRouter.get('/', function(req, res, next) {
    res.send('respond with a resource');
  });


professionRouter.get('/professions', async function (req, res, next) {
    await professionController.getAll(req, res);
});

professionRouter.post('/professions', async (req, res,next) => {
    await professionController.createProfession(req, res);
});

professionRouter.get('/professions/:id', async function (req, res, next) {
    await professionController.getProfessionById(req, res);
});

professionRouter.put('/professions/:id', async function (req, res, next) {
    await professionController.updateProfession(req, res);
});

professionRouter.delete('/professions/:id', async function (req, res, next) {
    await professionController.deleteProfession (req, res);
});


module.exports= professionRouter;
