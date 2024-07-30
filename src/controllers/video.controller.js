import { asyncHandler } from "../utills/asyncHandler.js"
import { ApiError } from "../utills/ApiError.js"
import { removeFromCloudinary, uploadOnCloudinary } from "../utills/cloudinary.js"
import { ApiResponse } from "../utills/ApiResponse.js"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import mongoose from "mongoose"
const getAllVideos = asyncHandler(async (req, res) => {
    // const { page = 1, limit = 10, query, sortBy, sortType, userId } = req.query
    const { channelId, page = 1, limit = 10, query = "", sortBy = "createdAt", sortType = 1 } = req.query
    if(!channelId && !query){
        throw new ApiError(400,"Channel Id or Query is required")
    }
    const options = {
        page: page,
        limit: limit
    };
    let matchStage={}
    if(query && !channelId){
        matchStage={title:{$regex:query,$options:"i"},isPublished:true}
    }else if(query && channelId){
        matchStage=matchStage={
            owner:new mongoose.Types.ObjectId(channelId),
            $or:[
                {title:{$regex:query,$options:"i"}}
            ],
            isPublished:true
        }
    }else{
        matchStage={owner:new mongoose.Types.ObjectId(channelId),isPublished:true}
    }

    const sortStage={}
    sortStage[sortBy]=Number.parseInt(sortType)
    const videos=await Video.aggregatePaginate(
        [
            {
              $match: matchStage
            },
            {
              $lookup: {
                from: "users",
                localField: "owner",
                foreignField: "_id",
                as: "channel"
              }
            },
            {
              $unwind: {
                path: "$channel"
              }
            },
            {
              $project: {
                videoFile: 1,
                thumbnail: 1,
                owner: 1,
                title: 1,
                description: 1,
                duration: 1,
                views: 1,
                isPublished: 1,
                channel: {
                  userName: "$channel.userName",
                  fullName: "$channel.fullName",
                  avatar: "$channel.avatar",
                  channelId: "$channel._id"
                },
                createdAt: 1,
                updatedAt: 1
              }
            },
            {
                $sort:sortStage
            }
          ],
        options,
        function (err,results){
            if(err){
                console.error(err)
            }else{
                return results
            }
        }
    )


    if (!videos) {
        throw new ApiError(400, "Error while fetching videos")
    }

    res.status(200).json(new ApiResponse(200, videos, "Videos fetched successfully"))

})

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    if (!title || !description) {
        throw new ApiError(400, "Title and Description are required")
    }
    // console.log(req.files)
    // TODO: get video, upload to cloudinary, create video
    const thumbnailLocalPath = req.files.thumbnail[0].path
    if (!thumbnailLocalPath) {
        throw new ApiError(400, "Thumbnail is required")
    }
    const videoLocalPath = req.files.videoFile[0].path
    if (!videoLocalPath) {
        throw new ApiError(400, "Video is required")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if (!thumbnail) {
        throw new ApiError(400, "Thumbnail not uploaded on cloudinary")
    }
    const video = await uploadOnCloudinary(videoLocalPath)
    if (!video) {
        throw new ApiError(400, "Video not uploaded on cloudinary")
    }

    const videoData = await Video.create({
        videoFile: video.url,
        thumbnail: thumbnail.url,
        owner: req.user?.id,
        title,
        description,
        duration: video.duration,
        isPublished: true
    })

    if (!videoData) {
        throw new ApiError(500, "Something went wrong while saving video in database")
    }
    res.status(200).json(new ApiResponse(200, { videoData }, "Video uploaded successfully"))

})

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: get video by id
    const video = await Video.findById(videoId)
    if (!video) {
        throw new ApiError(400, "Error while fetching video")
    }
    res.status(200).json(new ApiResponse(200, video, "Video fetched successfully"))
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    if (!videoId) {
        throw new ApiError(400, "Video ID is required")
    }
    const { title, description } = req.body
    if (!title || !description) {
        throw new ApiError(400, "Title and Description is required")
    }
    //TODO: update video details like title, description, thumbnail
    const thumbnailLocalPath = req.file?.path
    let thumbnail = ""
    if (thumbnailLocalPath) {
        thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
        if (!thumbnail) {
            throw new ApiResponse("Error while uploading thumbnail on cloudinary")
        }
    }

    const updateFields = {
        title,
        description
    }
    if (thumbnail != "") {
        updateFields.thumbnail = thumbnail.url
    }

    let video = await Video.findByIdAndUpdate(videoId, {
        $set: updateFields
    })

    if (!video) {
        throw new ApiError(500, "Something went wrong while updating video")
    }
    if (video.thumbnail) {
        await removeFromCloudinary(video.thumbnail)
    }
    video = await Video.findById(videoId)
    res.status(200).json(new ApiResponse(200, video, "Video updated successfully"))

})


const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video
    const videoBefore = await Video.findById(videoId)
    if (!videoBefore) {
        throw new ApiError(400, "Invalid video ID")
    }
    const video = await Video.findByIdAndDelete(videoId)
    if (!video) {
        throw new ApiError(400, "Error occur while deleting video")
    }
    if (videoBefore.thumbnail && videoBefore.videoFile) {
        await removeFromCloudinary(videoBefore.thumbnail)
        await removeFromCloudinary(videoBefore.videoFile)
    }
    res.status(200).json(new ApiResponse(200, video, "Video deleted successfully"))
})

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const videoBefore = await Video.findById(videoId)
    if (!videoBefore) {
        throw new ApiError(400, "Invalid video ID")
    }
    const isPublished = !videoBefore.isPublished

    const video = await Video.findByIdAndUpdate(videoId, {
        $set: { isPublished }
    }, { new: true })

    if (!video) {
        throw new ApiError(500, "Something went wrong while toggling Publish status")
    }

    res.status(200).json(new ApiResponse(200, video, "Publish status toggled successfully"))
})

const updateViewsAndHistory = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const isValid = await Video.findById(videoId)
    if (!isValid) {
        throw new ApiError(400, "Invalid video ID")
    }

    const user = await User.findByIdAndUpdate(req.user?._id, {
        $push: { watchHistory: videoId }
    }, { new: true })

    if (!user) {
        throw new ApiError(400, "Error while updating user watch history")
    }

    const video = await Video.findByIdAndUpdate(videoId, { $inc: { views: 1 } }, { new: true })
    if (!video) {
        throw new ApiError(400, "Error while updating video views")
    }
    res.status(200).json(new ApiResponse(200, {
        views: video.views,
        userWatchHistory: user.watchHistory
    }, "Video added to user Watch history successfully"))
})


export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus,
    updateViewsAndHistory
}