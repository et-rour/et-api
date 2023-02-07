const express = require("express");
const morgan = require("./config/morgan");
const helmet = require("helmet");
const xss = require("xss-clean");
const compression = require("compression");
const cors = require("cors");
var cookieParser = require("cookie-parser");
const routes = require("./routes");
const ApiError = require("./utils/ApiError");
const httpStatus = require("http-status");
import "reflect-metadata";
const { errorConverter, errorHandler } = require("./middlewares/error");
const config = require("./config/config");
import "./utils/scheduleJobs"

const app = express();
app.use(morgan.successHandler);
app.use(morgan.errorHandler);

// parse json request body
// app.use(express.json());

app.use(
  express.json({
    verify: (req: any, res: any, buf: any) => {
      req.rawBody = buf;
    },
  })
);

var bodyParser = require("body-parser");
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 50000,
  })
);

// // view engine setup - it is api only
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'jade');
// app.use(express.static(path.join(__dirname, 'public')));

// set security HTTP headers
app.use(helmet());

// parse urlencoded request body
app.use(express.urlencoded({ extended: false }));

// sanitize request data
app.use(xss());

// gzip compression
app.use(compression());

// enable cors
// app.use(cors());
// app.options("*", cors());
app.use(
  cors({
    origin: "*",
  })
);

// parse cookies
app.use(cookieParser());

// This is to route other routes
app.use("/", routes);

// catch 404 and forward to error handler
app.use(function (req: any, res: any, next: any) {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// convert error to ApiError, if needed
app.use(errorConverter);

// handle error
app.use(errorHandler);

// console.log(app._router.stack)

export default app;
