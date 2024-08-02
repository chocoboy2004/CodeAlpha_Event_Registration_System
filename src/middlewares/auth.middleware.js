import AsyncHandler from "../utils/AsyncHandler.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken"
import ApiError from "../utils/ApiError.js";

const authentication = AsyncHandler(async(req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")
        if (!token) {
            throw new ApiError(404, "You have not logged in! or login session is expired")
        }
    
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
        const user = await User.findById(decodedToken._id).select("-password -refreshToken")
        if (!user) {
            throw new ApiError(404, "Invalid session token")
        }

        req.user = user
        next()
    } catch (error) {
        throw new ApiError(401, "Invalid token")
    }
})

export default authentication