const User = require("../models/User")

const getAll = async(req,res,next) => {
    try{
        const users = await User.find({});
        return res.status(200).json(users);
    }
    catch(error){
        console.log(error);
        return res.status(400).send('error in get users');
    }
} 

const createUser = async(req,res,next) => {
    const user = req.body;
    try{
        await User.create(user);
        return res.status(200).send('create user successfully');
    }
    catch(error){
        console.log(error);
        return res.status(400).send('error in create user');
    }
}

const getUserById = async(req, res, next) => {
    const id = req.params.id.toString();
    try {
        const user = await User.findById(id);
        return res.status(200).send(user)
    } catch (error) {
        console.error(error);
        return res.status(400).send("User not found");
    }
}

const updateUser = async (req, res, next) => {
    const id = req.params.id.toString();
    try {
        await User.findOneAndUpdate({_id: id}, req.body);
        return res.status(200).send('Updated Successfully')
    } catch (error) {
        console.error(error);
        return res.status(400).send('Error encountred');
    }
}

const deleteUser = async(req,res,next) => {
    try{
        const user = await User.findById(req.params.id);
        if (user){
            await user.remove();
            return res.status(200).json({message: "Delete user done"});
        }
        return res.status(400).json({message: "Error deleting user"});

    }
    catch(error){
        console.log(error);
        return res.status(400).send('error in delete user')
    }
}



module.exports = {createUser , getAll ,getUserById,updateUser, deleteUser}

