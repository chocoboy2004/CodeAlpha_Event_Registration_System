import connectDB from "./db/database.connect.js";
import dotenv from "dotenv"
import app from "./app.js";

dotenv.config()

connectDB()
.then(() => {
    console.log(`Database connected!`)

    app.on("error", (error) => {
        console.log(`index.js :: app.on :: ERROR: ${error?.message}`)
    })

    app.listen(process.env.PORT || 4000, () => {
        console.log(`Server is running on port ${process.env.PORT || 4000}...`)
    })
})
.catch((error) => {
    console.log(`index.js :: connectDB :: ERROR: ${error?.message}`)
})