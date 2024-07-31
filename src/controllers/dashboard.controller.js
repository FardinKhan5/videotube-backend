import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { Subscription } from "../models/subscription.model.js";
import { asyncHandler } from "../utills/asyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const getChannelStats = asyncHandler(async (req, res) => {
  // TODO: Get the channel stats like total video views, total subscribers, total videos, total likes etc.
  const totalViews = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $group: {
        _id: "$owner",
        totalViews: {
          $sum: "$views",
        },
      },
    },
  ]);
  if (!totalViews) {
    throw new ApiError(500, "Error while counting total views");
  }

  const totalSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $group: {
        _id: "$channel",
        totalSubscribers: {
          $count: {},
        },
      },
    },
  ]);
  if (!totalSubscribers) {
    throw new ApiError(500, "Error while counting total subscribers");
  }
  const totalVideos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $group: {
        _id: "$owner",
        totalVideos: {
          $count: {},
        },
      },
    },
  ]);
  if (!totalVideos) {
    throw new ApiError(500, "Error while counting total videos");
  }
  const allVideosLikes = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "video",
        as: "likers",
      },
    },
    {
      $unwind: {
        path: "$likers",
      },
    },
    {
      $project: {
        liker: "$likers.likedBy",
      },
    },
    {
      $count: "allVideosLikes",
    },
  ]);

  if (!allVideosLikes) {
    throw new ApiError(500, "Error while counting all videos likes");
  }
  const allUserCommentsLikes = await Comment.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "comment",
        as: "likers",
      },
    },
    {
      $unwind: {
        path: "$likers",
      },
    },
    {
      $project: {
        liker: "$likers._id",
      },
    },
    {
      $count: "allUserCommentsLike",
    },
  ]);
  if (!allUserCommentsLikes) {
    throw new ApiError(500, "Error while counting all your comments likes");
  }
  const allUserTweetsLikes = await Tweet.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "likes",
        localField: "_id",
        foreignField: "tweet",
        as: "likers",
      },
    },
    {
      $unwind: {
        path: "$likers",
      },
    },
    {
      $project: {
        liker: "$likers._id",
      },
    },
    {
      $count: "allUserTweetsLikes",
    },
  ]);

  if (!allUserTweetsLikes) {
    throw new ApiError(500, "Error while counting all your tweets likes");
  }

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos: totalVideos[0]?.totalVideos || 0,
        totalViews: totalViews[0]?.totalViews || 0,
        totalSubscribers: totalSubscribers[0]?.totalSubscribers || 0,
        allVideosLikes: allVideosLikes[0]?.allVideosLikes || 0,
        allYourCommentsLikes:
          allUserCommentsLikes[0]?.allUserCommentsLikes || 0,
        allYourTweetsLikes: allUserTweetsLikes[0]?.allUserTweetsLikes || 0,
      },
      "Stats fetched successfully"
    )
  );
});

const getChannelVideos = asyncHandler(async (req, res) => {
  // TODO: Get all the videos uploaded by the channel
  const videos = await Video.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user?._id),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "channel",
      },
    },
    {
      $unwind: {
        path: "$channel",
      },
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
          channelId: "$channel._id",
        },
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $sort: {
        createdAt: 1,
      },
    },
  ]);

  if (!videos) {
    throw new ApiError(500, "Error while fetching the channel videos");
  }

  res
    .status(200)
    .json(new ApiResponse(200, videos, "Channel videos fetched successfully"));
});

export { getChannelStats, getChannelVideos };
