import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import authRoute from "./route/auth.route.js";
import { globalErrorHandler } from "./controller/error.controller.js";
import cookieParser from "cookie-parser";

export const app = express();

app.use(helmet());

app.use(rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
}));

app.use(express.json({
    limit: "50kb"
}))

app.use(cookieParser())

app.use(morgan('dev'))

app.use('/api/v1/auth/', authRoute)


app.all('/*splat', (req, res, next) => {
    const error: any = new Error(`No route found for ${req.method} ${req.url}`);
    error.statusCode = 404;
    error.success = false;
    next(error);

});

app.use(globalErrorHandler)


