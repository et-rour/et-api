export {};
/** Node Modules */
const httpStatus = require("http-status");
const {
  getAuth,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
} = require("firebase/auth");

const admin = require("../config/firebaseAdmin").firebase_admin_connect();
const catchAsync = require("../utils/catchAsync");
const ApiError = require("../utils/ApiError");
const pick = require("../utils/pick");

import { User } from "../models/User";
const { transporter } = require("../utils/sendWelcomeEmail");

const register = catchAsync(async (req: any, res: any) => {
  let {
    firstname,
    lastname,
    email,
    password,
    country,
    isOwner,
    phone,
    whatsapp,
  } = req.body;

  const userPass: any[] = [];
  await admin
    .auth()
    .createUser({
      email: email,
      password: password,
      displayName: firstname + " " + lastname,
      disabled: false,
    })
    .then((userCredential: any) => {
      // Signed in
      userPass.push(userCredential.providerData[0].uid);
      userPass.push(userCredential.uid);
    })
    .catch((error: any) => {
      let code = httpStatus.INTERNAL_SERVER_ERROR;
      let message = error.message;
      if (error.code === "auth/email-already-exists") {
        code = httpStatus.CONFLICT;
        message = `${email} ya está en uso, por favor seleccione otro o contacte a soporte`;
      } else if (error.code === "auth/invalid-email") {
        code = httpStatus.BAD_REQUEST;
        message = error.message;
      } else if (error.code === "auth/operation-not-allowed") {
        code = httpStatus.FORBIDDEN;
        message = error.message;
      } else if (error.code === "auth/weak-password") {
        code = httpStatus.BAD_REQUEST;
        message =
          "Tu contraseña no es lo suficientemente fuerte, asegurate que contenga al menos 8 caracteres, números y letras";
      }
      throw new ApiError(code, message);
    });

  const user = new User();
  user.firstName = firstname;
  user.lastName = lastname;
  user.email = email.toLowerCase();
  user.isOwner = isOwner ? true : false;
  user.phone = phone;
  user.isClient = false;
  user.country = country;
  user.whatsapp = whatsapp;
  user.uuid = userPass[1];
  user.isVerified = false;
  user.isActive = true;
  user.didReview = false;

  await user.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  let token = "";
  let uid;
  const auth = getAuth();
  await signInWithEmailAndPassword(auth, email, password)
    .then((userCredential: any) => {
      token = userCredential.user.accessToken;
      uid = userCredential.user.uid;
      return sendEmailVerification(auth.currentUser);
    })
    .catch((error: any) => {
      let code = httpStatus.INTERNAL_SERVER_ERROR;
      let message = error.message;
      if (error.code === "auth/wrong-password") {
        code = httpStatus.UNAUTHORIZED;
        message = error.message;
      } else if (error.code === "auth/too-many-requests") {
        code = httpStatus.TOO_MANY_REQUESTS;
        message = error.message;
      }
      throw new ApiError(code, error.message);
    });

  await transporter.sendMail({
    from: '"Espacio temporal -" <foo@example.com>', // sender address
    to: email, // list of receivers
    subject: "Bienvenido a Espacio Temporal", // Subject line
    template: "index",
  });

  if (token === "")
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not retrieve token."
    );

  let storageTokenAuthFirebase = "";
  await admin
    .auth()
    .createCustomToken(uid)
    .then((resCustomToken: any) => {
      // Send token back to client
      storageTokenAuthFirebase = resCustomToken;
    })
    .catch((error: any) => {
      console.log("Error creating custom token:", error);
    });

  res.status(httpStatus.OK).json({
    user: pick(user, [
      "id",
      "firstName",
      "lastName",
      "email",
      "country",
      "isAdmin",
      "isOwner",
      "phone",
      "country",
      "companyName",
      "identityCard",
      "representativeName",
      "rut",
    ]),
    token: token,
    storageTokenAuthFirebase,
  });
});

const login = catchAsync(async (req: any, res: any) => {
  const { email, password } = req.body;

  const currentUser = await User.findOne({ email: email });
  if (!currentUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "The user with email " + email + " is not registerd"
    );
  }

  let token = "";
  let uid = "";
  let isVerified = false;
  const auth = getAuth();
  await signInWithEmailAndPassword(auth, email, password)
    .then((userCredential: any) => {
      token = userCredential.user.accessToken;
      uid = userCredential.user.uid;
      isVerified = userCredential.user.emailVerified;
    })
    .catch((error: any) => {
      let code = httpStatus.INTERNAL_SERVER_ERROR;
      let message = error.message;
      if (error.code === "auth/wrong-password") {
        code = httpStatus.UNAUTHORIZED;
        message = error.message;
      } else if (error.code === "auth/too-many-requests") {
        code = httpStatus.TOO_MANY_REQUESTS;
        message = error.message;
        throw new ApiError(code, error.message);
      }
      throw new ApiError(code, error.message);
    });

  if (token === "")
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could not retrieve token."
    );

  if (!currentUser.isVerified && isVerified) {
    currentUser.isVerified = true;
    await currentUser.save().catch((error: any) => {
      throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
    });
  }

  let storageTokenAuthFirebase = "";
  await admin
    .auth()
    .createCustomToken(uid)
    .then((resCustomToken: any) => {
      // Send token back to client
      storageTokenAuthFirebase = resCustomToken;
    })
    .catch((error: any) => {
      console.log("Error creating custom token:", error);
    });
  res.status(httpStatus.OK).json({
    user: pick(currentUser, [
      "id",
      "firstName",
      "lastName",
      "email",
      "country",
      "isAdmin",
      "isOwner",
      "phone",
      "country",
      "companyName",
      "identityCard",
      "representativeName",
      "rut",
    ]),
    token: token,
    storageTokenAuthFirebase,
  });
});

const refresh = catchAsync(async (req: any, res: any) => {
  res.status(httpStatus.OK).json({
    user: pick(req.currentUser, ["firstName", "lastName", "email", "country"]),
    token: req.get("authorization").replace("Bearer ", ""),
  });
});

const logout = catchAsync(async (req: any, res: any) => {
  const admin = require("../config/firebaseAdmin").firebase_admin_connect();
  const response = await admin.auth().revokeRefreshTokens(req.currentUser.uuid);
  res.status(httpStatus.OK).json({ response, message: "user left" });
});

const restorePassword = catchAsync(async (req: any, res: any) => {
  const { email } = req.body;

  await sendPasswordResetEmail(getAuth(), email)
  .catch((error: any) => {
    let code = httpStatus.INTERNAL_SERVER_ERROR;
    let message = error.message;
    if (error.code === "auth/invalid-email") {
      code = httpStatus.UNAUTHORIZED;
      message = "Email envalido";
    } else if (error.code === "auth/user-not-found") {
      code = httpStatus.UNAUTHORIZED;
      message = "Email no encontrado";
    } 
    throw new ApiError(code, message);
  });

  res.status(httpStatus.OK).json({ email });
});

const listUsers = catchAsync(async (req: any, res: any) => {
  if (!req.currentUser || req.currentUser.isAdmin !== true) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "You must be an admin" });
  }
  const users = await User.find({
    relations: ["locations", "createdReviews", "receivedReviews"],
  });

  if (!users.length) {
    return res.status(httpStatus.OK).json({ users: [] });
  }

  res.status(httpStatus.OK).json({ users });
});

const changeStatus = catchAsync(async (req: any, res: any) => {
  const { id, status } = req.body;

  const user = await User.find({
    where: {
      id: id,
    },
  });

  user[0].isActive = status;

  await user[0].save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  res.status(httpStatus.OK).json(user[0]);
});

const update = catchAsync(async (req: any, res: any) => {
  let { firstname, lastname, email, password, country, isOwner, id } = req.body;

  const selectedUser = await User.findOne({
    where: {
      id: id,
    },
    relations: ["locations"],
  });

  if (selectedUser) {
    if (firstname) {
      selectedUser.firstName = firstname;
    }
    if (lastname) {
      selectedUser.lastName = lastname;
    }
    if (email) {
      selectedUser.email = email;
    }
    if (country) {
      selectedUser.country = country;
    }
    if (isOwner) {
      selectedUser.isOwner = isOwner;
    }
  } else {
    throw new ApiError(
      httpStatus.INTERNAL_SERVER_ERROR,
      "Could find the user."
    );
  }
  await selectedUser.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(selectedUser);
});

const updateExtraData = catchAsync(async (req: any, res: any) => {
  let { companyName, identityCard, representativeName, rut,} = req.body;
  console.log('%cauth.controller.ts line:322 req.currentUser', 'color: white; background-color: #007acc;', req.currentUser);
  const selectedUser = await User.findOne({
    where: {
      id: req.currentUser.id,
    },
  });

  if (!selectedUser) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "No se encontro el usuario."
    );
  }
  console.log('%cauth.controller.ts line:335 selectedUser', 'color: #26bfa5;', selectedUser);

  selectedUser.companyName = companyName;
  selectedUser.identityCard = identityCard;
  selectedUser.representativeName = representativeName;
  selectedUser.rut = rut;

  await selectedUser.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(selectedUser);
});

const changeUserIsActiveProperty = catchAsync(async (req: any, res: any) => {
  const { idUser } = req.params;
  const { active } = req.body;

  const user = await User.findOne({ id: idUser });

  if (!user) {
    return res.status(httpStatus.NOT_FOUND).json({ message: "User not found" });
  }

  if (!req.currentUser || req.currentUser.isAdmin !== true) {
    return res
      .status(httpStatus.UNAUTHORIZED)
      .json({ message: "You must be an admin" });
  }
  user.isActive = active;

  await user.save().catch((error: any) => {
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  });

  return res.status(httpStatus.OK).json(user);
});

module.exports = {
  register,
  login,
  logout,
  refresh,
  restorePassword,
  listUsers,
  changeStatus,
  update,
  changeUserIsActiveProperty,
  updateExtraData
};
