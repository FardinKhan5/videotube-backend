import mongoose from "mongoose"
import {DB_NAME} from "../constants.js"

const connectDB=async ()=>{
    try {
        console.log(`${process.env.DATABASE_URI}/${DB_NAME}`)
        const connectionInstance= await mongoose.connect(`${process.env.DATABASE_URI}/${DB_NAME}`)
        console.log("Database Connected!! DB HOST:" + connectionInstance.connection.host)
    } catch (error) {
        console.log("Connection Failed: " + error)
        process.exit(1)
    }
}

export default connectDB;
