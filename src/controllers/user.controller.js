import { asyncHandler } from "../utills/asyncHandler.js"
import { ApiError } from "../utills/ApiError.js"
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utills/cloudinary.js"
import { ApiResponse } from "../utills/ApiResponse.js"
import fs from "fs"
import cookieParser from "cookie-parser"

const generateAccessAndRefreshToken = async (userId) => {
    try {
        const user = await findById(userId)
        const accessToken = await user.generateAccessToken()
        const refreshToken = await user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
}

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
        $or: [{ userName }, { email }]
    })

    if (isUserAlreadyExists) {
        if (req.files.avatar[0].path) {
            fs.unlinkSync(req.files?.avatar[0]?.path)
        }
        if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
            fs.unlinkSync(req.files.coverImage[0].path)
        }
        throw new ApiError(409, "User with email or uesername already existed")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath=req.files?.coverImage[0]?.path

    if (!avatarLocalPath) {
        throw new ApiError(400, "Avatar file is required")
    }

    let coverImageLocalPath
    if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
        coverImageLocalPath = req.files.coverImage[0].path
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    const user = await User.create({
        userName: userName.toLowerCase(),
        email,
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        password
    })

    // const createdUser=await User.findById(user._id).select("-password -refreshToken") old
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User is registered successfully")
    )

})

const loginUser = asyncHandler(async (req, res, next) => {
    // req body -> data
    // username or email
    //find the user
    //password check
    //access and referesh token
    //send cookie
    const { userName, email, password } = req.body

    if (!userName && !email) {
        throw new ApiError(400, "Username or email is required")
    }

    const user = await User.findOne({
        $or: [{ userName }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exists")
    }

    const checkPassword = user.isPasswordCorrect(password)
    if (!checkPassword) {
        throw new ApiError(401, "Invalid password")
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(user._id)

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, loggedInUser, "User logged in successfully")
        )
})


export { registerUser }