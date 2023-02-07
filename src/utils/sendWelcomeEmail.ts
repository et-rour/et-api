const nodemailer = require("nodemailer");
var hbs = require("nodemailer-express-handlebars");
const { NODEMILER_EMAIL, NODEMILER_PASSWORD } = process.env;
var options = {
  viewEngine: {
    layoutsDir: "src/templates/",
    extname: ".html",
    defaultLayout: "index",
  },
  viewPath: "src/templates/",
  extName: ".html",
};

const hbsTransporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: NODEMILER_EMAIL, // generated ethereal user
    pass: NODEMILER_PASSWORD, // generated ethereal password
    // lmyjlznqyzqqomlb
  },
});

hbsTransporter.use("compile", hbs(options));

// send mail with defined transport object
export const transporter = hbsTransporter;
