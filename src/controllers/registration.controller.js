import AsyncHandler from "../utils/AsyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Event from "../models/event.model.js";
import Registration from "../models/registration.model.js";

const registerForEvent = AsyncHandler(async(req, res) => {
    const { event } = req.params
    if (!event) {
        throw new ApiError(400, "Event id is not provided")
    }
    const eventData = await Event.findById(event)
    if (!eventData) {
        throw new ApiError(404, "Event not found || Id is not valid")
    }

    const { slots } = req.body
    if (!slots) {
        throw new ApiError(400, "Number of slots is not provided")
    }

    if ((eventData.capacity - Number(slots)) <= 0) {
        throw new ApiError(400, "Required slots are not available")
    }

    const registration = await Registration.create({
        userId: req.user._id,
        eventId: eventData._id,
        eventVenue: eventData.eventVenue,
        eventPrice: eventData.registrationFee,
        slots: Number(slots)
    })

    const response = await Registration.findById(registration._id)
    if (!response) {
        throw new ApiError(500, "Something went wrong while registering for event!")
    }

    eventData.capacity = eventData.capacity - Number(slots)
    await eventData.save({ validateBeforeSave: false })

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            response,
            `Registration successfull. Your registration id is: ${response._id}`
        )
    )
})

const togglePaymentStatus = AsyncHandler(async(req, res) => {
    const { registrationId } = req.params
    if (!registrationId) {
        throw new ApiError(400, "Registration id is not provided")
    }

    const registrationData = await Registration.findById(registrationId)
    if (!registrationData) {
        throw new ApiError(404, "Registration not found || Id is not valid")
    }

    if (registrationData.userId.toString() !== req.user._id.toString()) {
        throw new ApiError(403, "You are not authorized to perform this action")
    }

    if (registrationData.paymentStatus === "paid") {
        throw new ApiError(400, "Event registration fee is already paid")
    }

    registrationData.paymentStatus = "paid"
    await registrationData.save({ validateBeforeSave: false })

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {
                registrationId: registrationData._id,
                paymentStatus: registrationData.paymentStatus
            },
            "Payment is successfully completed"
        )
    )
})

const cancelRegistration = AsyncHandler(async(req, res) => {
    const { registrationId } = req.params
    if (!registrationId) {
        throw new ApiError(400, "Registration id is not provided")
    }

    const registrationData = await Registration.findById(registrationId)
    if (!registrationData) {
        throw new ApiError(404, "Registration not found || Id is not valid")
    }

    const eventData = await Event.findById(registrationData.eventId)
    eventData.capacity += registrationData.slots
    await eventData.save({ validateBeforeSave: false })

    await Registration.findByIdAndDelete(registrationId)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Registration successfully cancelled"
        )
    )
})

const listRegistrations = AsyncHandler(async(req, res) => {
    const registrations = await Registration.find({ userId: req.user._id })
    if (registrations.length === 0) {
        throw new ApiError(404, "No registrations found")
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            registrations,
            "Registtrations listed successfully"
        )
    )
})

export {
    registerForEvent,
    togglePaymentStatus,
    cancelRegistration,
    listRegistrations
}