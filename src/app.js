import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(cookieParser())

app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ extended: true }))




import userRoute from "./routes/user.route.js"
import eventRoute from "./routes/event.route.js"
import registrationRoute from "./routes/registration.route.js"


app.use("/api/v1/user", userRoute)
app.use("/api/v1/event", eventRoute)
app.use("/api/v1/registration", registrationRoute)



export default app