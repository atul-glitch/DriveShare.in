import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a local file to Cloudinary, then delete the temp file.
 * @param {string} localFilePath
 * @param {string} folder  - Cloudinary folder name
 * @returns {object|null}  - Cloudinary response or null on failure
 */
const uploadOnCloudinary = async (localFilePath, folder = "vehicle-rental") => {
  if (!localFilePath) return null;
  try {
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      folder,
    });
    fs.unlinkSync(localFilePath); // remove temp file
    return response;
  } catch (error) {
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    console.error("Cloudinary upload error:", error.message);
    return null;
  }
};

/**
 * Delete a file from Cloudinary by its public_id.
 * @param {string} publicId
 */
const deleteFromCloudinary = async (publicId) => {
  if (!publicId) return null;
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error("Cloudinary delete error:", error.message);
    return null;
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
