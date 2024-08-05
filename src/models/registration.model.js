import mongoose, { Schema } from "mongoose";

const registrationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    eventId: {
        type: Schema.Types.ObjectId,
        ref: "Event",
        required: true
    },
    eventVenue: {
        type: String,
        required: true
    },
    eventPrice: {
        type: Number,
        required: true
    },
    slots: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ["pending", "paid"],
        default: "pending"
    }
}, { timestamps: true })

const Registration = mongoose.model("Registration", registrationSchema)

export default Registration