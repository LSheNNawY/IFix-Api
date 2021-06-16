const professionController = require('../controllers/professionController')
const express = require('express')
const professionRouter = express.Router();
const multer = require('multer');


//multer
const fileStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9 )+ ".png";
        cb(null, file.fieldname + '-' + uniqueSuffix  )
    }
})



const upload = multer({storage:fileStorage})

professionRouter.get('/', function(req, res, next) {
    res.send('respond with a resource');
});

professionRouter.get('/professions', async function (req, res, next) {
    await professionController.getAll(req, res);
});

professionRouter.post('/professions',upload.single("img"), async (req, res,next) => {

    console.log(req.file)
    console.log(req.body)

    await professionController.createProfession(req, res);
});

professionRouter.get('/professions/:id', async function (req, res, next) {
    await professionController.getProfessionById(req, res);
});

professionRouter.put('/professions/:id',upload.single("img"), async function (req, res, next) {
    await professionController.updateProfession(req, res);
});

professionRouter.delete('/professions/:id', async function (req, res, next) {
    await professionController.deleteProfession (req, res);
});


module.exports= professionRouter;
