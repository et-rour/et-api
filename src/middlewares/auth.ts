export {};
// const passport = require('passport');
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const admin = require("../config/firebaseAdmin").firebase_admin_connect();

import { User } from "../models/User";

const auth =
  (...requiredRights: any) =>
  async (req: any, res: any, next: any) => {
    //This needs to be changed to firebase
    let token = req.get("authorization").replace("Bearer ", "");

    let info: any;
    await admin
      .auth()
      .verifyIdToken(token)
      .then((decodedToken: any) => {
        info = decodedToken;
        // console.log(info);
      })
      .catch((err: any) => {
        console.log({ err });
        next(
          new ApiError(
            httpStatus.FORBIDDEN,
            "Fallo al cargar tu sección\n intenta recargar la pagina"
          )
        );
      });

    if (!info) {
      return;
    }

    const currentUser = await User.findOne({ email: info.email });
    if (!currentUser) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "The user with email " + info.email + " is not registerd"
      );
    }

    req.currentUser = currentUser;
    // console.log(
    //   '\n\n\n\x1b[44m%s\x1b[0m',
    //   'auth.ts line:46 currentUser',
    //   JSON.stringify(currentUser, null, "\t" )
    // );
    // now we should check for role permissions
    next();
  };

module.exports = auth;
