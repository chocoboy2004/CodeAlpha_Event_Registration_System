import { Router } from "express";
import {
    deleteEvent,
    registerEvent
} from "../controllers/event.controller.js"
import authentication from "../middlewares/auth.middleware.js";

const router = Router()

router.use(authentication)
router.route("/register").post(registerEvent)
router.route("/delete/:event").delete(deleteEvent)

export default router