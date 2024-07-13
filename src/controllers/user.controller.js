import { asyncHandler } from "../utills/asyncHandler.js"
import { ApiError } from "../utills/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utills/cloudinary.js"
import { ApiResponse } from "../utills/ApiResponse.js"
import fs from "fs"
const registerUser = asyncHandler(async (req, res, next) => {
    // get user details from frontend
    // validation - not empty
    // check if user already exists: username, email
    // check for images, check for avatar
    // upload them to cloudinary, avatar
    // create user object - create entry in db
    // remove password and refresh token field from response
    // check for user creation
    // return res
    const { userName, email, fullName, password } = req.body
    if ([userName, email, fullName, password].some((field) => {
        return field?.trim() === ""
    })) {
        throw new ApiError(400, "Fields cannot be empty")
    }
    const isUserAlreadyExists = await User.findOne({
        $or:[{userName},{email}]
    })

    if (isUserAlreadyExists) {
        if(req.files.avatar[0].path){
            fs.unlinkSync(req.files?.avatar[0]?.path)
        }
        if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
            fs.unlinkSync(req.files.coverImage[0].path)
        }
        throw new ApiError(409, "User with email or uesername already existed")
    }

    const avatarLocalPath=req.files?.avatar[0]?.path
    // const coverImageLocalPath=req.files?.coverImage[0]?.path

    if(!avatarLocalPath){
        throw new ApiError(400,"Avatar file is required")
    }

    let coverImageLocalPath
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath=req.files.coverImage[0].path
    }

    const avatar=await uploadOnCloudinary(avatarLocalPath)
    const coverImage=await uploadOnCloudinary(coverImageLocalPath)

    const user=await User.create({
        userName: userName.toLowerCase() ,
        email,
        fullName,
        avatar:avatar.url,
        coverImage: coverImage?.url || "",
        password
    })
    
    // const createdUser=await User.findById(user._id).select("-password -refreshToken") old
    const createdUser=await User.findById(user._id).select("-password -refreshToken")

    if(!createdUser){
        throw new ApiError(500,"Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200,createdUser,"User is registered successfully")
    )

})




export { registerUser }