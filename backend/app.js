import helmet from "helmet"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import authRoute from "./src/routes/authRoute.js"
import {notFound, errorHandler} from "./src/middleware/errorHandler.js"


const app = express()

app.use(helmet())
app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials: true
}))
app.use(cookieParser())

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);


app.use("/regester", authRoute)

app.use(notFound)
app.use(errorHandler)

export default app;