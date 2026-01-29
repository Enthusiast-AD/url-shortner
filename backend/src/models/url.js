import mongoose, {Schema} from "mongoose";

const urlSchema = new Schema(
	{
	    _id: string,
	    originalUrl: {
		type: String,
		required: true,
		lowercase: true.
		trim: true,
	    },
	},
	{timestamps: true}
)

export const Url = mongoose.model("Url", urlSchema);
