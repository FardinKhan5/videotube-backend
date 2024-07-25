import express from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription } from "../controllers/subscription.controller.js"
const router=express.Router()

router.use(verifyJWT)
// router.route("/subscribe").post(subscribe)
router.route("/subscribers").get(getUserChannelSubscribers)
router.route("/subscribedTo").get(getSubscribedChannels)
router.route("/:channelId").patch(toggleSubscription)

export default router