const functions = require("firebase-functions");
//const admin = require("firebase-admin");
const express = require("express");
const app = express();
const firebase = require("firebase");
const { admin, db } = require("./util/admin");
const firebaseAuth = require("./util/firebaseAuth");

const { getAllPost, postOnePost } = require("./handlers/posts");
const {
  signup,
  login,
  uploadImage,
  addUserDetail,
  getAuthenticatedUser,
} = require("./handlers/users");

//post routes
app.get("./screams", getAllPost);
app.post("./scream", firebaseAuth, postOnePost);
app.get("./scream/:screamId");

//users routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/imgage", firebaseAuth, uploadImage);
app.post("/user", firebaseAuth, addUserDetail);
app.get("/user", firebaseAuth, getAuthenticatedUser);

exports.api = functions.region("asia-southeast1-a").https.onRequest(app);
