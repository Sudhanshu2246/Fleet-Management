const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

const uploadFromBuffer = (buffer, folder = "fleet_docs") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

module.exports = { uploadFromBuffer };
