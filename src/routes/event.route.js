import { Router } from "express";
import {
    deleteEvent,
    registerEvent,
    listEvents,
    getEvent,
    updateEventName,
    updateEventDescription
} from "../controllers/event.controller.js"
import authentication from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/register").post(authentication, registerEvent)
router.route("/delete/:event").delete(authentication, deleteEvent)
router.route("/list").get(listEvents)
router.route("/get-event/:event").get(getEvent)
router.route("/update/event/name/:event").patch(authentication, updateEventName)
router.route("/update/event/description/:event").patch(authentication, updateEventDescription)

export default router