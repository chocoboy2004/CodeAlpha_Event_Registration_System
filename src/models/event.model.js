import mongoose, { Schema } from "mongoose";

const eventSchema = new Schema({
    eventName: {
        type: String,
        required: true
    },
    eventDescription: {
        type: String,
        required: true
    },
    eventVenue: {
        type: String,
        required: true
    },
    startingDate: {
        type: String,
        required: true
    },
    startingTime: {
        type: String,
        required: true
    },
    endingDate: {
        type: String,
        required: true
    },
    endingTime: {
        type: String,
        required: true
    },
    eventOrganizer: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    registrationFee: {
        type: Number,
        required: true
    }
}, { timestamps: true })

const Event = mongoose.model("Event", eventSchema)

export default Event