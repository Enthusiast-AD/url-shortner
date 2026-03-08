import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { ApiError } from "./utils/ApiError.js";
import urlRouter from './routes/url.routes.js';
import indexRouter from './routes/index.routes.js';

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit: "16kb"}))
app.use(express.urlencoded({extended: true, limit: "16kb"}))
app.use(express.static("public"))
app.use(cookieParser())

// Routes - Order matters: Specific routes first, then parameterized/wildcard routes
// This ensures that /api/v1/url/shorten is matched before /:shortId, preventing conflicts.
app.use("/api/v1/url", urlRouter)
app.use("/", indexRouter) 

// Error Handling Middleware
app.use((err, req, res, next) => {
    if (err instanceof ApiError) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors
        });
    }

    console.error(err); 
    return res.status(500).json({
        success: false,
        message: "Internal Server Error"
    });
});

export { app }
