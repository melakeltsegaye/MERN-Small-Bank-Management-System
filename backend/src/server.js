import { connectDB } from "./lib/db.js"
import dotenv from "dotenv"
import app from "./app.js"
import express from "express"
import path from "path";



dotenv.config()


const PORT = process.env.PORT || 3000

const __dirname = path.resolve();


if (process.env.NODE_ENV === "production") {
    const frontendPath = path.join(
        __dirname,
        "../frontend/dist"
    );

    app.use(express.static(frontendPath));

     app.get("/{*splat}", (req, res) => {
        res.sendFile(
            path.join(frontendPath, "index.html")
        );
    });
}

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