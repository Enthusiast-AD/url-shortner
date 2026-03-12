import path from "path";
import {asyncHandler} from "../utils/asyncHandler.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {Url} from "../models/url.js";
import {encode} from "../utils/base62.js";
import {generate} from "../utils/snowflake.js"; 

// Get Machine ID from env or default to 1
// In a real distributed system, this must be unique per instance
const MACHINE_ID = parseInt(process.env.MACHINE_ID) || 1;

/**
 * Controller to shorten a URL
 * @route POST /api/v1/url/shorten
 */
const shortenUrl = asyncHandler(async (req, res) => {
    const { originalUrl } = req.body;

    if (!originalUrl) {
        throw new ApiError(400, "Original URL is required");
    }

    // specific validation for URL format
    if (!isValidUrl(originalUrl)) {
        throw new ApiError(400, "Invalid URL format");
    }
    
    // Generate unique ID using Snowflake algorithm (returns BigInt)
    const id = generate(MACHINE_ID);
    
    // Encode the ID to Base62 string for shortness
    const shortId = encode(id);

    // Create and save to DB
    const newUrl = await Url.create({
        shortId,
        originalUrl
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201, 
                { 
                    shortUrl: `${req.protocol}://${req.get('host')}/${shortId}`,
                    shortId,
                    originalUrl 
                }, 
                "URL shortened successfully"
            )
        );
});

/**
 * Controller to redirect to original URL
 * @route GET /:shortId
 */
const redirectUrl = asyncHandler(async (req, res) => {
    const { shortId } = req.params;

    if (!shortId) {
        throw new ApiError(400, "Short ID is required");
    }

    // Find URL in DB
    const urlDoc = await Url.findOne({ shortId });

    if (!urlDoc) {
        return res.status(404).sendFile('not-found.html', { root: 'public' });
    }

    // Async update clicks (don't await if performance is critical, but good for data integrity)
    // Using $inc for atomic update and $push for analytics
    await Url.updateOne(
        { _id: urlDoc._id },
        { 
            $inc: { clicks: 1 },
            $push: { 
                analytics: { 
                    timestamp: new Date(),
                    ip: req.ip,
                    userAgent: req.get('User-Agent')
                } 
            }
        }
    );

    // Redirect to original URL
    // Ensure protocol is present
    let redirectUrl = urlDoc.originalUrl;
    if (!redirectUrl.startsWith('http://') && !redirectUrl.startsWith('https://')) {
        redirectUrl = 'http://' + redirectUrl;
    }

    // 301 is permanent, 302 is temporary. 
    // browsers cache 301.
    return res.redirect(302, redirectUrl);
});

/**
 * Helper to validate URL
 */
function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

/**
 * Controller to delete a URL
 * @route DELETE /api/v1/url/:shortId
 */
const deleteUrl = asyncHandler(async (req, res) => {
    const { shortId } = req.params;

    if (!shortId) {
        throw new ApiError(400, "Short ID is required");
    }

    const deletedUrl = await Url.findOneAndDelete({ shortId });

    if (!deletedUrl) {
        throw new ApiError(404, "URL not found");
    }

    return res
        .status(200)
        .json(
            new ApiResponse(200, {}, "URL deleted successfully")
        );
});

export { shortenUrl, redirectUrl, deleteUrl };