import { asyncHandler } from "../utills/asyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { Tweet } from "../models/tweet.model.js";
import mongoose from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;
  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  //TODO: create tweet
  const tweet = await Tweet.create({
    owner: req.user._id,
    content,
  });
  if (!tweet) {
    throw new ApiError(500, "Error while creating tweet");
  }
  res.status(200).json(new ApiResponse(200, tweet, "Tweeted successfully"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  // TODO: get user tweets
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "User does not exists");
  }

  const tweets = await Tweet.find({ owner: userId });
  if (!tweets) {
    throw new ApiError(400, "No tweets found");
  }

  res
    .status(200)
    .json(new ApiResponse(200, tweets, "Tweets fetched successfully"));
});

const updateTweet = asyncHandler(async (req, res) => {
  //TODO: update tweet
  const { tweetId } = req.params;
  const { content } = req.body;
  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }
  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  const tweet = await Tweet.findByIdAndUpdate(
    tweetId,
    {
      $set: { content },
    },
    {
      new: true,
    }
  );

  if (!tweet) {
    throw new ApiError(500, "Error while updating the tweet");
  }

  res
    .status(200)
    .json(new ApiResponse(200, tweet, "Tweet updated successfully"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  //TODO: delete tweet
  const { tweetId } = req.params;
  if (!mongoose.isValidObjectId(tweetId)) {
    throw new ApiError(400, "Invalid tweet id");
  }
  const deleted = await Tweet.findByIdAndDelete(tweetId);
  if (!deleted) {
    throw new ApiError(400, "Error while deleting the tweet");
  }
  res
    .status(200)
    .json(new ApiResponse(200, deleted, "Tweet deleted successfully"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
