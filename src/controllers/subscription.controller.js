import { asyncHandler } from "../utills/asyncHandler.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { Subscription } from "../models/subscription.model.js";
import { User } from "../models/user.model.js";
import mongoose from "mongoose";
import { ApiError } from "../utills/ApiError.js";

// const subscribe=asyncHandler(async (req,res)=>{
//     const {channelId}=req.body
//     if(!mongoose.isValidObjectId(channelId)){
//         throw new ApiError(400,"Invalid channel id")
//     }
//     const subscription=await Subscription.create({
//         subscriber:req.user?._id,
//         channel:channelId
//     })

//     if(!subscription){
//         throw new ApiError(400,"Error while subscribing")
//     }
//     res.status(200).json(new ApiResponse(200,subscription,"Subscribed"))
// })
const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription
  if (!mongoose.isValidObjectId(channelId)) {
    throw new ApiError(400, "Invalid channel id");
  }
  let subscription = await Subscription.findOne({
    $and: [{ channel: channelId }, { subscriber: req.user?._id }],
  });

  if (!subscription) {
    subscription = await Subscription.create({
      subscriber: req.user?._id,
      channel: channelId,
    });
    return res
      .status(200)
      .json(new ApiResponse(200, subscription, "Subscribed"));
  }
  const deleted = await Subscription.deleteOne({
    $and: [{ channel: channelId }, { subscriber: req.user?._id }],
  });
  if (!deleted) {
    throw new ApiError(400, "Deletion failed");
  }
  res.status(200).json(new ApiResponse(200, deleted, "Unsubscribed"));
});
// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const result = await Subscription.aggregate([
    {
      $match: {
        channel: req.user?._id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "subscriber",
        foreignField: "_id",
        as: "result",
        pipeline: [
          {
            $project: {
              fullName: 1,
              email: 1,
              userName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        username: {
          $first: "$result.userName",
        },
        fullName: {
          $first: "$result.fullName",
        },

        email: {
          $first: "$result.email",
        },
        avatar: {
          $first: "$result.avatar",
        },
      },
    },
    {
      $project: {
        channel: 1,
        username: 1,
        fullName: 1,
        email: 1,
        avatar: 1,
      },
    },
  ]);
  if (!result) {
    throw new ApiError(400, "Error whhil fetching subscriber details");
  }
  res
    .status(200)
    .json(new ApiResponse(200, result, "Subscribers fetched successfully"));
});

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const result = await Subscription.aggregate([
    {
      $match: {
        subscriber: req.user?._id,
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "result",
        pipeline: [
          {
            $project: {
              fullName: 1,
              email: 1,
              userName: 1,
              avatar: 1,
              coverImage: 1,
            },
          },
        ],
      },
    },
    {
      $addFields: {
        username: {
          $first: "$result.userName",
        },
        fullName: {
          $first: "$result.fullName",
        },

        email: {
          $first: "$result.email",
        },
        avatar: {
          $first: "$result.avatar",
        },
        coverImage: {
          $first: "$result.coverImage",
        },
      },
    },
    {
      $project: {
        channel: 1,
        username: 1,
        fullName: 1,
        email: 1,
        avatar: 1,
        coverImage: 1,
      },
    },
  ]);
  if (!result) {
    throw new ApiError(400, "Error whhil fetching channel details");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, result, "Subscribed channels fetched successfully")
    );
});

export { toggleSubscription, getUserChannelSubscribers, getSubscribedChannels };
