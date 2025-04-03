const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");
const dotenv = require("dotenv");

dotenv.config();

// ✅ Cloudinary Setup
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer Storage (Supports All Files)
const storage = new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
        folder: "chat_uploads",
        resource_type: "auto",
        public_id: Date.now().toString(),
    }),
});

const upload = multer({ storage });

// ✅ Add Error Handling
const uploadMiddleware = (req, res, next) => {
    upload.single("file")(req, res, (err) => {
        if (err) {
            console.error("Multer error:", err);
            return res.status(500).json({ error: "Multer Error", details: err.message });
        }
        console.log("File Uploaded Successfully:", req.file);
        next();
    });
};

module.exports = {uploadMiddleware};
