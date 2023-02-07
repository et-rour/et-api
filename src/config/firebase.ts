import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const config = require("./config");

const firebase_connect = () => {
  let firebase: any;
  if (getApps().length === 0) {
    try {
      firebase = initializeApp(config.firebase);
    } catch (e) {
      console.log(e);
    }
  } else {
    firebase = getApp();
  }
  return firebase;
};

exports.firebase_connect = firebase_connect;
export const storage = getStorage;
export const storageRef = ref;
export const storageUploadBytes = uploadBytes;
export const storeGetDownloadURL = getDownloadURL;
