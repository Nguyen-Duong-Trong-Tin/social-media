"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadImageFromUrl = exports.parseCloudinaryRawUrl = exports.buildSignedRawUrlFromSource = exports.buildSignedRawUrl = void 0;
const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
const parseCloudinaryRawUrl = (url) => {
    if (!url)
        return null;
    const match = url.match(/\/raw\/upload\/(?:v\d+\/)?([^?]+)(?:\?.*)?$/i);
    if (!match)
        return null;
    const pathPart = match[1];
    const extMatch = pathPart.match(/\.([a-z0-9]+)$/i);
    const format = extMatch ? extMatch[1] : undefined;
    const publicId = format ? pathPart.slice(0, -(format.length + 1)) : pathPart;
    if (!publicId)
        return null;
    return { publicId, format };
};
exports.parseCloudinaryRawUrl = parseCloudinaryRawUrl;
const buildSignedRawUrl = ({ publicId, format }) => {
    return cloudinary.url(publicId, Object.assign({ resource_type: "raw", secure: true, sign_url: true, type: "upload" }, (format ? { format } : {})));
};
exports.buildSignedRawUrl = buildSignedRawUrl;
const buildSignedRawUrlFromSource = (sourceUrl) => {
    const parts = parseCloudinaryRawUrl(sourceUrl);
    if (!parts)
        return null;
    return buildSignedRawUrl(parts);
};
exports.buildSignedRawUrlFromSource = buildSignedRawUrlFromSource;
const uploadImageFromUrl = (_a) => __awaiter(void 0, [_a], void 0, function* ({ sourceUrl, folder = "google-avatars", }) {
    const uploaded = yield cloudinary.uploader.upload(sourceUrl, {
        folder,
        resource_type: "image",
        overwrite: true,
        access_mode: "public",
    });
    return uploaded.secure_url;
});
exports.uploadImageFromUrl = uploadImageFromUrl;
