import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"

const app = express()

app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(cookieParser())

app.use(express.json({ limit: "5mb" }))
app.use(express.urlencoded({ extended: true }))




import userRoute from "./routes/user.route.js"


app.use("/api/v1/user", userRoute)



export default app