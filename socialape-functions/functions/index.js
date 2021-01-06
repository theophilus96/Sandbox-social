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

exports.api = functions.region("us-central1").https.onRequest(app);

exports.createNotificationOnLike = functions
  .region("us-central1")
  .firestore.document("likes/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            postId: doc.id,
          });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });

exports.deleteNotificationOnUnlike = functions
  .region("us-central1")
  .firestore.document("likes/{id}")
  .onDelete((snapshot) => {
    return db
      .doc(`/notifications/${snapshot.id}`)
      .delete()
      .catch((err) => {
        console.error(err);
        return;
      });
  });

exports.createNotificationOnComment = functions
  .region("us-central1")
  .firestore.document("comments/{id}")
  .onCreate((snapshot) => {
    return db
      .doc(`/posts/${snapshot.data().postId}`)
      .get()
      .then((doc) => {
        if (
          doc.exists &&
          doc.data().userHandle !== snapshot.data().userHandle
        ) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            postId: doc.id,
          });
        }
      })
      .catch((err) => {
        console.error(err);
        return;
      });
  });
