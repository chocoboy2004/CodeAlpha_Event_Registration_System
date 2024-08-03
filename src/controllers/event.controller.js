import AsyncHandler from "../utils/AsyncHandler.js"
import ApiResponse from "../utils/ApiResponse.js"
import ApiError from "../utils/ApiError.js"
import Event from "../models/event.model.js"

const registerEvent = AsyncHandler(async(req, res) => {
    const {
        eventName,
        eventDescription,
        eventVenue,
        startingDate,
        startingTime,
        endingDate,
        endingTime,
        capacity,
        registrationFee
    } = req.body

    if (!eventName || !eventDescription || !eventVenue || !startingDate || !startingTime || !endingDate || !endingTime || !capacity ||!registrationFee){
        throw new ApiError(400, "All fields are required")
    }
    if (eventName.trim().length < 5) {
        throw new ApiError(400, "Event name should be at least 5 characters long!")
    }
    if (eventDescription.trim().length < 20) {
        throw new ApiError(400, "Event description should be at least 20 characters long!")
    }
    if (eventVenue.trim().length < 5){
        throw new ApiError(400, "Event venue should be at least 5 characters long!")
    }
    if (/^(((0[1-9]|[12][0-9]|3[01])[- /.](0[13578]|1[02])|(0[1-9]|[12][0-9]|30)[- /.](0[469]|11)|(0[1-9]|1\d|2[0-8])[- /.]02)[- /.]\d{4}|29[- /.]02[- /.](\d{2}(0[48]|[2468][048]|[13579][26])|([02468][048]|[1359][26])00))$/.test(startingDate) === null){
        throw new ApiError(400, "Invalid date format for starting date!")  // format: DD/MM/YYYY
    }
    if (/([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?/.test(startingTime.trim()) === null) {
        throw new ApiError(400, "Invalid starting time")  // format: 23:50:00 14:00 23:00 9:30 19:30
    }
    if (/^(((0[1-9]|[12][0-9]|3[01])[- /.](0[13578]|1[02])|(0[1-9]|[12][0-9]|30)[- /.](0[469]|11)|(0[1-9]|1\d|2[0-8])[- /.]02)[- /.]\d{4}|29[- /.]02[- /.](\d{2}(0[48]|[2468][048]|[13579][26])|([02468][048]|[1359][26])00))$/.test(endingDate.trim()) === null){
        throw new ApiError(400, "Invalid date format for ending date!")
    }
    if (/([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?/.test(endingTime.trim()) === null) {
        throw new ApiError(400, "Invalid ending time")
    }
    if (capacity < 100) {
        throw new ApiError(400, "Capacity must be at least 100")
    }
    if (registrationFee < 1) {
        throw new ApiError(400, "Invalid registration fee")
    }

    const venue = await Event.findOne({ eventVenue: eventVenue.trim() })
    if (venue && (venue.startingDate === startingDate && venue.endingDate === endingDate)) {
        throw new ApiError(400, "Venue is already booked for this date!")
    }
    if (venue && (startingDate > venue.startingDate && startingDate < venue.endingDate)) {
        throw new ApiError(400, "Venue is already booked for this date!")
    }

    const event = await Event.create({
        eventName: eventName.trim(),
        eventDescription: eventDescription.trim(),
        eventVenue: eventVenue.trim(),
        eventOrganizer: req.user._id,
        startingDate: startingDate.trim(),
        startingTime: startingTime.trim(),
        endingDate: endingDate.trim(),
        endingTime: endingTime.trim(),
        capacity: Number(capacity),
        registrationFee: Number(registrationFee)
    })

    const response = await Event.findById(event._id)
    if (!response) {
        throw new ApiError(500, "Something went wrong while creating event!")
    }

    return res
    .status(201)
    .json(
        new ApiResponse(
            200,
            response,
            "Event registered successfully"
        )
    )
})

const deleteEvent = AsyncHandler(async(req, res) => {
    const { event } = req.params

    if (!event) {
        throw new ApiError(400, "Event id is required")
    }

    const isExistedEvent = await Event.findById(event)
    if (!isExistedEvent) {
        throw new ApiError(404, "Event not found")
    }

    if (req.user._id.toString() !== isExistedEvent.eventOrganizer.toString()) {
        throw new ApiError(403, "You are not authorized to delete this event")
    }

    await Event.findByIdAndDelete(event)

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Event deleted successfully"
        )
    )
})

export {
    registerEvent,
    deleteEvent
}