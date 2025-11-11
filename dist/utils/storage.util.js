"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const path = require("path");
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
;
const storage = new CloudinaryStorage({
    cloudinary,
    params: (_, file) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const resourceType = ["pdf", "doc", "docx"].includes(ext.slice(1)) ? "raw" : "auto";
        const result = {
            folder: "CloudinaryDemo",
            resource_type: "auto",
            allowedFormats: ["jpeg", "png", "jpg", "mp4", "avi", "mov", "pdf", "doc", "docx"]
        };
        if (resourceType === "raw") {
            result.resource_type = "raw";
            result.public_id = file.originalname;
        }
        return result;
    }
});
exports.default = storage;
