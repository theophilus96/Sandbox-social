// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
const functions = require("firebase-functions");
var express = require("express");
const app = express();
const { admin, db } = require("./util/admin");
const firebaseAuth = require("./util/firebaseAuth");
const cors = require('cors');
app.use(cors());

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
  markNotificationsRead,
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
app.get("/user/:handle", getUserDetails);
app.post("/notifications", firebaseAuth, markNotificationsRead);

exports.api = functions.https.onRequest(app);

// exports.helloWorld = functions.https.onRequest((request, response) => {
//   response.send("Hello from Firebase!");
//  });
