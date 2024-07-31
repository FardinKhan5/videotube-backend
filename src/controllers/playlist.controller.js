import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utills/asyncHandler.js";
import { ApiError } from "../utills/ApiError.js";
import { ApiResponse } from "../utills/ApiResponse.js";
import { Playlist } from "../models/playlist.model.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  //TODO: create playlist
  if (!name || !description) {
    throw new ApiError(400, "Name and description is required for playlist");
  }

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user?._id,
  });

  if (!playlist) {
    throw new ApiError(500, "Error while creating the playlist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist created successfully"));
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  //TODO: get user playlists
  if (!isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  const playlist = await Playlist.findOne({ owner: userId });
  if (!playlist) {
    throw new ApiError(500, "Error while fetching the user's playlist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "User playlist fetched successfully"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  //TODO: get playlist by id

  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  const playlist = await Playlist.findById(playlistId);
  if (!playlist) {
    throw new ApiError(500, "Error while fetching the playlist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist id or video id");
  }
  const video = await Playlist.findOne({ videos: videoId });
  if (video) {
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { alreadyExists: true },
          "Video already exists in the playlist"
        )
      );
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $push: { videos: videoId },
    },
    { new: true }
  );

  if (!playlist) {
    throw new ApiError(500, "Error while adding video in the playlist");
  }

  res
    .status(200)
    .json(
      new ApiResponse(200, playlist, "video added to the playlist successfully")
    );
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, videoId } = req.params;
  // TODO: remove video from playlist
  if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
    throw new ApiError(400, "Invalid playlist id or video id");
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $pull: { videos: videoId },
    },
    { new: true }
  );
  if (!playlist) {
    throw new ApiError(500, "Error while removing video from the playlist");
  }

  res
    .status(200)
    .json(
      new ApiResponse(
        200,
        playlist,
        "video removed from the playlist successfully"
      )
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  // TODO: delete playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  const playlist = await Playlist.findByIdAndDelete(playlistId);
  if (!playlist) {
    throw new ApiError(500, "Error while deleting the playlist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;
  //TODO: update playlist
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }
  if (!name && !description) {
    throw new ApiError(400, "Name or description is required for playlist");
  }
  const data = {};
  if (name) {
    data.name = name;
  }
  if (description) {
    data.description = description;
  }
  const playlist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $set: data,
    },
    { new: true }
  );
  if (!playlist) {
    throw new ApiError(500, "Error while updating the playlist");
  }

  res
    .status(200)
    .json(new ApiResponse(200, playlist, "playlist updated successfully"));
});

const getAllVideosInPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  if (!isValidObjectId(playlistId)) {
    throw new ApiError(400, "Invalid playlist id");
  }

  const videos = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "videos",
        foreignField: "_id",
        as: "videos",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
            },
          },
          {
            $unwind: "$owner",
          },
        ],
      },
    },
    {
      $unwind: "$videos",
    },
    {
      $match: {
        "videos.isPublished": true,
      },
    },
    {
      $project: {
        title: "$videos.title",
        videoFile: "$videos.videoFile",
        thumbnail: "$videos.thumbnail",
        duration: "$videos.duration",
        owner: "$videos.owner",
        videoId: "$videos._id",
        isPublished: "$videos.isPublished",
        owner: {
          fullName: "$videos.owner.fullName",
          userName: "$videos.owner.userName",
          avatar: "$videos.owner.avatar",
          channelId: "$videos.owner._id",
        },
      },
    },
  ]);

  if (!videos) {
    throw new ApiError(500, "Error while fetching videos from the playlist");
  }
  res
    .status(200)
    .json(
      new ApiResponse(200, videos, "Videos from playlist fetched successfully")
    );
});

export {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  deletePlaylist,
  updatePlaylist,
  getAllVideosInPlaylist,
};
