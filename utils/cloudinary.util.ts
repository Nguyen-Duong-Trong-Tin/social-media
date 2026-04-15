const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

type RawUrlParts = {
  publicId: string;
  format?: string;
};

const parseCloudinaryRawUrl = (url?: string): RawUrlParts | null => {
  if (!url) return null;

  const match = url.match(/\/raw\/upload\/(?:v\d+\/)?([^?]+)(?:\?.*)?$/i);
  if (!match) return null;

  const pathPart = match[1];
  const extMatch = pathPart.match(/\.([a-z0-9]+)$/i);
  const format = extMatch ? extMatch[1] : undefined;
  const publicId = format ? pathPart.slice(0, -(format.length + 1)) : pathPart;

  if (!publicId) return null;
  return { publicId, format };
};

const buildSignedRawUrl = ({ publicId, format }: RawUrlParts) => {
  return cloudinary.url(publicId, {
    resource_type: "raw",
    secure: true,
    sign_url: true,
    type: "upload",
    ...(format ? { format } : {}),
  });
};

const buildSignedRawUrlFromSource = (sourceUrl?: string) => {
  const parts = parseCloudinaryRawUrl(sourceUrl);
  if (!parts) return null;
  return buildSignedRawUrl(parts);
};

const uploadImageFromUrl = async ({
  sourceUrl,
  folder = "google-avatars",
}: {
  sourceUrl: string;
  folder?: string;
}) => {
  const uploaded = await cloudinary.uploader.upload(sourceUrl, {
    folder,
    resource_type: "image",
    overwrite: true,
    access_mode: "public",
  });

  return uploaded.secure_url as string;
};

export {
  buildSignedRawUrl,
  buildSignedRawUrlFromSource,
  parseCloudinaryRawUrl,
  uploadImageFromUrl,
};
