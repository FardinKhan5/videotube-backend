import { asyncHandler } from "../utills/asyncHandler.js"
import { ApiError } from "../utills/ApiError.js"
import { uploadOnCloudinary } from "../utills/cloudinary.js"
const registerUser=asyncHandler(async (req,res,next)=>{
    // get the user details
    // validate no space
    //upload images avtar ,cover
    // check pic uploaded
    // create user object
    // check user already exists or not
    // save in db
    // check it saved
    // return object without password and token
    const {userName,email,fullName,password} = req.body
    
    if([userName,email,fullName,password].some((field)=>{
        return field?.trim()===""
    })){
        throw new ApiError(409,"Fields Cannot be Empty")
    }


    
})

export {registerUser}