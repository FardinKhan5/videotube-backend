import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { updateViewsAndHistory, deleteVideo, getVideoById, publishAVideo, togglePublishStatus, updateVideo } from "../controllers/video.controller.js"
import { upload } from "../middlewares/multer.middleware.js"
const router=express.Router()

router.use(verifyJWT)

router.route("/publish").post(upload.fields([
    {
        name:"thumbnail",
        maxCount:1
    },
    {
        name:"videoFile",
        maxCount:1
    }
]),publishAVideo)

router.route("/:videoId")
.get(getVideoById)
.patch(upload.single("thumbnail"),updateVideo)
.delete(deleteVideo)

router.route("/toggle-publish/:videoId").patch(togglePublishStatus);

router.route("/update-views-and-history/:videoId").patch(updateViewsAndHistory)

export default router