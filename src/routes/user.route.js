import { Router } from "express";
import { 
    signup,
    login, 
    logout,
    updateName,
    updateEmail,
    updatePhone,
    updatePassword
} from "../controllers/user.controller.js"
import authentication from "../middlewares/auth.middleware.js";

const router = Router()

router.route("/signup").post(signup)
router.route("/login").post(login)
router.route("/logout").post(authentication, logout)
router.route("/update/name").patch(authentication, updateName)
router.route("/update/email").patch(authentication, updateEmail)
router.route("/update/phone").patch(authentication, updatePhone)
router.route("/update/password").patch(authentication, updatePassword)

export default router