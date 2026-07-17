import { connectDB } from "./lib/db.js"
import dotenv from "dotenv"
import app from "./app.js"




dotenv.config()


const PORT = process.env.PORT || 3000


const startServer = async () => {
    await connectDB()

    app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || "development"} mode on port ${PORT}`);
  })

  process.on("unhandledRejection", (err) => {
    console.error(`Unhandled rejection: ${err.message}`);
    server.close(() => process.exit(1));
  });
}

startServer()