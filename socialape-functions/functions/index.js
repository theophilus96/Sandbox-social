const functions = require("firebase-functions");
const express = require("express");
const app = express();
const firebase = require("firebase");
const { admin, db } = require("./util/admin");
const firebaseAuth = require("./util/firebaseAuth");

const { getAllPost, postOnePost } = require("./handlers/posts");
const {
  signup,
  login,
  getAuthenticatedUser,
  getUserDetails,
  uploadImage,
  addUserDetails,
} = require("./handlers/users");

//post routes
app.get("/screams", getAllPost);
app.post("/scream", firebaseAuth, postOnePost);
//app.get("/scream/:screamId");

//users routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", firebaseAuth, uploadImage);
app.post("/user", firebaseAuth, addUserDetails);
app.get("/user", firebaseAuth, getAuthenticatedUser);

exports.api = functions.region("us-central1").https.onRequest(app);
