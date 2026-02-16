import multer from "multer";
import path from "path";

//path
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "upload/user"); 
  },
  filename: function (req, file, cb) {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, unique + path.extname(file.originalname)); 
  },
});

// filter file
function fileFilter(req, file, cb) {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only images are allowed"), false);
  }
}

export const upload = multer({ storage, fileFilter });
