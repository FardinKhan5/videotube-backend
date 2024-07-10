import { asyncHandler } from "../utills/asyncHandler.js"

const registerUser=asyncHandler(async (req,res,next)=>{
    res.status(200).json({
        message:"fardin khan"
    })
})

export {registerUser}