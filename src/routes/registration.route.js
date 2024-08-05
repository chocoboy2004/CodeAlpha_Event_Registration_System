import { Router } from "express"
import authentication from "../middlewares/auth.middleware.js"
import {
    registerForEvent,
    togglePaymentStatus,
    cancelRegistration,
    listRegistrations
} from "../controllers/registration.controller.js"

const router = Router()

router.use(authentication)

router.route("/register/id=:event").post(registerForEvent)
router.route("/payment/id=:registrationId").patch(togglePaymentStatus)
router.route("/cancel-registration/id=:registrationId").delete(cancelRegistration)
router.route("/list").get(listRegistrations)

export default router