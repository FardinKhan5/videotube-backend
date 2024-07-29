import mongoose, { isValidObjectId } from "mongoose"
import { asyncHandler } from "../utills/asyncHandler.js"
import { ApiError } from "../utills/ApiError.js"
import { ApiResponse } from "../utills/ApiResponse.js"
import { Like } from "../models/like.model.js"

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: toggle like on video
    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid video id")
    }
    let like=await Like.findOne({likedBy:req.user?._id})
    if(!like){
        like=await Like.create({
            video:videoId,
            likedBy:req.user?._id
        })
        return res.status(200).json(new ApiResponse(200,like,"Liked video successfully"))
    }

    like=await Like.findOne({video:videoId})
    if(!like){
        like=await Like.findOneAndUpdate({likedBy:req.user?._id},{
            $push:{video:videoId}
        },{new:true})
        
        return res.status(200).json(new ApiResponse(200,like,"Liked video successfully"))
    }
    like=await Like.findOneAndUpdate({likedBy:req.user?._id},{
        $pull:{video:videoId}
    },{new:true})

    if(!like){
        throw new ApiError(500,"Error while removing like from the video")
    }
    res.status(200).json(new ApiResponse(200,like,"Removed like from the video successfully"))
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    //TODO: toggle like on comment
    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Invalid comment id")
    }
    let like=await Like.findOne({likedBy:req.user?._id})
    if(!like){
        like=await Like.create({
            comment:commentId,
            likedBy:req.user?._id
        })
        return res.status(200).json(new ApiResponse(200,like,"Liked comment successfully"))
    }

    like=await Like.findOne({comment:commentId})
    if(!like){
        like=await Like.findOneAndUpdate({likedBy:req.user?._id},{
            $push:{comment:commentId}
        },{new:true})
        
        return res.status(200).json(new ApiResponse(200,like,"Liked comment successfully"))
    }
    like=await Like.findOneAndUpdate({likedBy:req.user?._id},{
        $pull:{comment:commentId}
    },{new:true})

    if(!like){
        throw new ApiError(500,"Error while removing like from the comment")
    }
    res.status(200).json(new ApiResponse(200,like,"Removed like from the comment successfully"))

})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    //TODO: toggle like on tweet
    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet id")
    }
    let like=await Like.findOne({likedBy:req.user?._id})
    if(!like){
        like=await Like.create({
            tweet:tweetId,
            likedBy:req.user?._id
        })
        return res.status(200).json(new ApiResponse(200,like,"Liked tweet successfully"))
    }

    like=await Like.findOne({tweet:tweetId})
    if(!like){
        like=await Like.findOneAndUpdate({likedBy:req.user?._id},{
            $push:{tweet:tweetId}
        },{new:true})
        
        return res.status(200).json(new ApiResponse(200,like,"Liked tweet successfully"))
    }
    like=await Like.findOneAndUpdate({likedBy:req.user?._id},{
        $pull:{tweet:tweetId}
    },{new:true})

    if(!like){
        throw new ApiError(500,"Error while removing like from the tweet")
    }
    res.status(200).json(new ApiResponse(200,like,"Removed like from the tweet successfully"))
}
)

const getLikedVideos = asyncHandler(async (req, res) => {
    //TODO: get all liked videos
    const videos=await Like.aggregate([
        {
          $match: {
            likedBy:req.user?._id
          }
        },
        {
          $lookup: {
            from: "videos",
            localField: "video",
            foreignField: "_id",
            as: "videos",
            pipeline:[
              {
                $project:{
                  videoFile:1,
                  thumbnail:1,
                  title:1,
                  duration:1,
                  owner:1
                }
              }
            ]
          }
        },
        {
          $unwind: {
            path: "$videos"
          }
        },
        {
          $project: {
            title:"$videos.title",
            videoFile:"$videos.videoFile",
            thumbnail:"$videos.thumbnail",
            duration:"$videos.duration",
            owner:"$videos.owner",
            videoId:"$videos._id"
          }
        }
      ])

      if(!videos){
        throw new ApiError(500,"Error while fetching liked videos")
      }

      res.status(200).json(new ApiResponse(200,videos,"Liked videos fetched successfully"))
})

export {
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}