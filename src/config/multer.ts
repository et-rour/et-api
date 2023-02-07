const multer = require("multer");
const path = require("path");
const upload = multer({
  fileFilter: function (req: any, file: any, callback: any) {
    var ext = path.extname(file.originalname);
    if (
      ext !== ".png" &&
      ext !== ".jpg" &&
      ext !== ".gif" &&
      ext !== ".jpeg" &&
      ext !== ".heic" &&
      ext !== ".HEIC" &&
      ext !== ".webp"
    ) {
      return callback(new Error("Solo se aceptan imagenes"));
    }
    callback(null, true);
  },
  limits: {
    // fileSize: 1024 * 1024,
  },
});

export { upload };
