import mongoose, {Schema} from "mongoose";

const urlSchema = new Schema(
    {
        shortId: {
            type: String,
            required: true,
            unique: true,
            index: true, 
            trim: true
        },
        originalUrl: {
            type: String,
            required: true,
            trim: true,
        },
        clicks: {
            type: Number,
            default: 0,
        },
        analytics: [
            {
                timestamp: { type: Date, default: Date.now },
                ip: String,
                userAgent: String
            }
        ]
    },
    {timestamps: true}
)

export const Url = mongoose.model("Url", urlSchema);
