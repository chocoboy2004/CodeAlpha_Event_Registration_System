import mongoose from "mongoose"
import DBName from "../constant.js"

const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DBName}`)
        console.log(`DB connection established successfully :: ${connectionInstance.connection.host}/${DBName}`)
    } catch (error) {
        console.log(`db :: database.connect.js :: ERROR :: ${error?.message}`)
    }
}

export default connectDB