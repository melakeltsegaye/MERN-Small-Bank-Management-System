import helmet from "helmet"
import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import {notFound, errorHandler} from "./middleware/errorHandler.js"
import authRoutes from "./routes/authRoute.js"
import userRoutes from "./routes/userRoutes.js";
import accountRoutes from "./routes/accountRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import loanRoutes from "./routes/loanRoutes.js";
import path from "path"


const app = express()

const __dirname = path.resolve()

app.use(helmet())
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}))
app.use(express.json())
app.use(cookieParser())

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);


app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/loans", loanRoutes);

if(ENV.NODE_ENV === "production") {
     const frontendPath = path.join(__dirname, "../frontend/dist");

    console.log(frontendPath);

    app.use(express.static(frontendPath));

    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(frontendPath, "index.html"));
    });
}

app.use(notFound)
app.use(errorHandler)

export default app;