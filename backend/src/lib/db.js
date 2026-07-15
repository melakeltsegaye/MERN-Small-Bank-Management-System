import mongoose from "mongoose";



export const connectDB = async () => {
    try {
        const conn =  await mongoose.connect(process.env.DB_URL)
   console.log(`mongodb connected: ${conn.connection.host}`)
    } catch(error) {
console.error("ERROR conected to mongodb", error.message)
process.exit(1)
    }
}