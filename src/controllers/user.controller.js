import AsyncHandler from "../utils/AsyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/user.model.js";

const generateTokens = async (id) => {
    try {
        const user = await User.findById(id).select("-password")
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
    
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })
    
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Error occured while generating tokens" + error)
    }
}

const signup =AsyncHandler(async(req, res) => {
    const { firstname, lastname, email, phone, password } = req.body
    
    if (!firstname ||!lastname ||!email ||!phone ||!password) {
        throw new ApiError(400, "All fields are required")
    }
    if (firstname.trim().length <= 0) {
        throw new ApiError(400, "Firstname must not be empty")
    }
    if (lastname.trim().length <= 0) {
        throw new ApiError(400, "Lastname must not be empty")
    }
    if (/^([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}$/.test(email) === null) {
        throw new ApiError(400, "Invalid email format")
    }
    if (phone.trim().length < 10) {
        throw new ApiError(400, "Phone number must be 10 digits long")
    }
    if (password.trim().length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long")
    }

    const existedUser = await User.findOne({
        $or: [ {email}, {phone} ]
    })

    if (existedUser) {
        throw new ApiError(400, "Email or phone number already exists! Go for login")
    }

    const user = await User.create({
        firstname: firstname.trim(),
        lastname: lastname.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        password: password.trim()
    })

    const response = await User.findById(user._id).select("-password")
    if (!response) {
        throw new ApiError(500, "Internal server error")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            response,
            "User successfully registered"
        )
    )
})

const login = AsyncHandler(async(req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        throw new ApiError(400, "All fields are required")
    }
    if (/^([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}$/.test(email) === null) {
        throw new ApiError(400, "Invalid email format")
    }
    if (password.trim().length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long")
    }

    const existedUser = await User.findOne({email})
    if (!existedUser) {
        throw new ApiError(404, "User not found")
    }

    const isCorrectPassword = await existedUser.validatePassword(password)
    if (!isCorrectPassword) {
        throw new ApiError(401, "Invalid password")
    }

    const {accessToken, refreshToken} = await generateTokens(existedUser._id)
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {},
            "User successfully logged in"
        )
    )
})

const logout = AsyncHandler(async(req, res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: null
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            {},
            "User successfully logged out"
        )
    )
})

const updateName = AsyncHandler(async(req, res) => {
    const { firstname, lastname } = req.body
    if (!firstname && !lastname) {
        throw new ApiError(400, "Firstname or Lastname is required")
    }

    if (firstname && firstname.trim() === "") {
        throw new ApiError(400, "Firstname must not be empty")
    }
    if (lastname && lastname.trim() === "") {
        throw new ApiError(400, "Lastname must not be empty")
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                firstname: firstname ? firstname.trim() : req.user.firstname,
                lastname: lastname ? lastname.trim() : req.user.lastname
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "User name updated successfully"
        )
    )
})

const updateEmail = AsyncHandler(async(req, res) => {
    const {email} = req.body
    if (!email) {
        throw new ApiError(400, "Email is required")
    }
    if (/^([\w\.\-_]+)?\w+@[\w-_]+(\.\w+){1,}$/.test(email) === null) {
        throw new ApiError(400, "Invalid email format")
    }
    if (email.trim() === req.user.email) {
        throw new ApiError(400, "Email already in use! Please enter a new email")
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                email: email.trim().toLowerCase()
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {},
            "User email updated successfully"
        )
    )
})

const updatePhone = AsyncHandler(async(req, res) => {
    const {phone} = req.body
    if (!phone) {
        throw new ApiError(400, "Phone no is required")
    }
    if (phone.toString().trim().length < 10) {
        throw new ApiError(400, "Invalid Phone number")
    }
    if (phone.toString() === req.user.phone) {
        throw new ApiError(400, "Phone number already in use! Please enter a new phone number")
    }

    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                phone: phone.toString().trim()
            }
        },
        {
            new: true
        }
    )

    return res
    .status(200)
    .json(
        new ApiResponse(
            200, 
            {},
            "User phone no updated successfully"
        )
    )
})

const updatePassword = AsyncHandler(async(req, res) => {
    const {password} = req.body
    if (!password) {
        throw new ApiError(400, "Password is required")
    }

    if (password.trim().length < 8) {
        throw new ApiError(400, "Password must be at least 8 characters long")
    }

    const userData = await User.findById(req.user._id).select("-refreshToken")
    userData.password = password.trim()
    await userData.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "User password updated successfully"
        )
    )
})

export {
    signup,
    login,
    logout,
    updateName,
    updateEmail,
    updatePhone,
    updatePassword
}