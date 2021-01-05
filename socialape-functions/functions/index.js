const functions = require("firebase-functions");
const express = require("express");
const app = express();
const firebase = require("firebase");
const { admin, db } = require("./util/admin");
const firebaseAuth = require("./util/firebaseAuth");

const {
  getAllPost,
  postOnePost,
  getPost,
  commentOnPost,
  likePost,
  unlikePost,
  deletePost,
} = require("./handlers/posts");
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
app.get("/scream/:postId", firebaseAuth, getPost);
app.post("/scream/:postId/comment", firebaseAuth, commentOnPost);
app.delete("/scream/:postId", firebaseAuth, deletePost);
app.get("/scream/:postId/like", firebaseAuth, likePost);
app.get("/scream/:postId/unlike", firebaseAuth, unlikePost);

//users routes
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", firebaseAuth, uploadImage);
app.post("/user", firebaseAuth, addUserDetails);
app.get("/user", firebaseAuth, getAuthenticatedUser);

exports.api = functions.region("us-central1").https.onRequest(app);
