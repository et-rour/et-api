export {};
/** Node Modules */
const httpStatus = require("http-status");

/** Custom Modules */
const catchAsync = require("../utils/catchAsync");
const request = require("request");

const get = catchAsync(async (req: any, res: any) => {
  console.log(
    "%ccaptcha.controller.ts line:10 req.body",
    "color: #007acc;",
    req.body
  );
  if (!req.body.recaptchaToken) {
    return res.status(400).json({ message: "recaptchaToken is required" });
  }
  const verifyCaptchaOptions = {
    uri: "https://www.google.com/recaptcha/api/siteverify",
    json: true,
    form: {
      secret: process.env.CAPTCHA_SECRET,
      response: req.body.recaptchaToken,
    },
  };

  request.post(
    verifyCaptchaOptions,
    function (err: any, response: any, body: any) {
      if (err) {
        return res
          .status(500)
          .json({ message: "oops, something went wrong on our side" });
      }

      if (!body.success) {
        return res.status(500).json({ message: body["error-codes"].join(".") });
      }

      //Save the user to the database. At this point they have been verified.
      res
        .status(201)
        .json({ message: "Congratulations! We think you are human." });
    }
  );
});

module.exports = {
  get,
};
