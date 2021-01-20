const functions = require("firebase-functions");
const express = require("express");
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


exports.api = functions.region('asia-southeast2').https.onRequest(app);


exports.createNotificationOnLike = functions.firestore
.document("likes/{id}")
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
    .catch((err) => console.error(err));
});
exports.deleteNotificationOnUnLike = functions.firestore
.document("likes/{id}")
.onDelete((snapshot) => {
  return db
    .doc(`/notifications/${snapshot.id}`)
    .delete()
    .catch((err) => {
      console.error(err);
      return;
    });
});
exports.createNotificationOnComment = functions.firestore
.document("comments/{id}")
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

exports.onUserImageChange = functions.firestore
.document("/users/{userId}")
.onUpdate((change) => {
  console.log(change.before.data());
  console.log(change.after.data());
  if (change.before.data().imageUrl !== change.after.data().imageUrl) {
    console.log("image has changed");
    const batch = db.batch();
    return db
      .collection("posts")
      .where("userHandle", "==", change.before.data().handle)
      .get()
      .then((data) => {
        data.forEach((doc) => {
          const post = db.doc(`/posts/${doc.id}`);
          batch.update(post, { userImage: change.after.data().imageUrl });
        });
        return batch.commit();
      });
  } else return true;
});

exports.onPostDelete = functions.firestore
.document("/post/{postId}")
.onDelete((snapshot, context) => {
  const postId = context.params.postId;
  const batch = db.batch();
  return db
    .collection("comments")
    .where("postId", "==", postId)
    .get()
    .then((data) => {
      data.forEach((doc) => {
        batch.delete(db.doc(`/comments/${doc.id}`));
      });
      return db.collection("likes").where("postId", "==", postId).get();
    })
    .then((data) => {
      data.forEach((doc) => {
        batch.delete(db.doc(`/likes/${doc.id}`));
      });
      return db
        .collection("notifications")
        .where("postId", "==", postId)
        .get();
    })
    .then((data) => {
      data.forEach((doc) => {
        batch.delete(db.doc(`/notifications/${doc.id}`));
      });
      return batch.commit();
    })
    .catch((err) => console.error(err));
});
