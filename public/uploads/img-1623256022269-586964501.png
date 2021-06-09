const Todo=require('../Models/Blogs');
const customError=require('../Helpers/CustomError');
module.exports=async(req,res,next)=>{
    const BlogId=req.params.id;
    const UserId=req.user.id;
    console.log(UserId);
    const blog=await Blog.findById(BlogId);
    console.log(blog.UserId);
    if(!blog.UserId.equals(UserId)){
        throw customError('Not Authorized',403);
}
     next();

}