import { asyncHandler } from "../utills/asyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import mongoose from "mongoose";

const getVideoComments = asyncHandler(async (req, res) => {
  //TODO: get all comments for a video
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }
  const options = {
    page,
    limit,
  };
  const comments = await Comment.aggregatePaginate(
    [
      {
        $match: {
          video: new mongoose.Types.ObjectId(videoId),
        },
      },
    ],
    options,
    function (err, results) {
      if (err) {
        throw new ApiError(500, "Error while fetching videos");
      } else {
        return results;
      }
    }
  );

  res
    .status(200)
    .json(new ApiResponse(200, comments, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
  // TODO: add a comment to a video
  const { videoId } = req.params;
  const { content } = req.body;
  if (!mongoose.isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid video id");
  }

  const comment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });
  if (!comment) {
    throw new ApiError(500, "Error while creating comment");
  }
  res
    .status(200)
    .json(new ApiResponse(200, comment, "Commented on video Successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
  // TODO: update a comment
  const { commentId } = req.params;
  const { content } = req.body;
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }
  if (!content) {
    throw new ApiError(400, "Content is required");
  }
  const originalComment = await Comment.findById(commentId);
  if (!originalComment) {
    throw new ApiError(404, "Comment does not exists");
  }
  const userId = new mongoose.Types.ObjectId(req.user._id);
  if (!userId.equals(originalComment.owner)) {
    throw new ApiError(401, "You are not owner of this comment");
  }
  const updatedComment = await Comment.findByIdAndUpdate(
    commentId,
    {
      $set: { content },
    },
    { new: true }
  );

  if (!updatedComment) {
    throw new ApiError(500, "Error while updating the comment");
  }

  res
    .status(200)
    .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
});

const deleteComment = asyncHandler(async (req, res) => {
  // TODO: delete a comment
  const { commentId } = req.params;
  if (!mongoose.isValidObjectId(commentId)) {
    throw new ApiError(400, "Invalid comment id");
  }
  const originalComment = await Comment.findById(commentId);
  if (!originalComment) {
    throw new ApiError(404, "Comment does not exists");
  }
  const userId = new mongoose.Types.ObjectId(req.user._id);
  if (!userId.equals(originalComment.owner)) {
    throw new ApiError(401, "You are not owner of this comment");
  }
  const deletedComment = await Comment.findByIdAndDelete(commentId);
  if (!deletedComment) {
    throw new ApiError(500, "Error while deleting the comment");
  }
  res
    .status(200)
    .json(new ApiResponse(200, deletedComment, "Comment deleted successfully"));
});

export { getVideoComments, addComment, updateComment, deleteComment };
