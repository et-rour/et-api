export {};
// const passport = require('passport');
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const admin = require("../config/firebaseAdmin").firebase_admin_connect();

import { User } from "../models/User";

const chatMiddleware =
  (...requiredRights: any) =>
  async (req: any, res: any, next: any) => {
    const reqMessages = req.body.messages;

    // CHECK IF USER SENDED MORE THAN 6 MESSAGES
    if (reqMessages.length <= 6) {
      next();
      return;
    }

    //This needs to be changed to firebase
    const token = req.get("authorization").replace("Bearer ", "");

    if (!token || token === null || token === "null") {
      return res.status(httpStatus.OK).json({
        response: {
          choices: [
            {
              message: {
                role: "assistant",
                content:
                  "Superaste el limite de mensages, inicia secion para continuar chateando",
                limit: true,
              },
            },
          ],
        },
      });
    }

    console.log(
      "%cHello chat.ts line:25 LIMITE SUPERADO",
      "background: green; color: white; display: block;"
    );
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

    const currentUser = await User.findOne({ email: info.email });
    if (!currentUser) {
      throw new ApiError(
        httpStatus.NOT_FOUND,
        "The user with email " + info.email + " is not registerd"
      );
    }
    req.currentUser = currentUser;
    next();
  };

module.exports = chatMiddleware;
