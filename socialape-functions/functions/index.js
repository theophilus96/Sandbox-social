const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const app = express();
const firebase = require("firebase");

admin.initializeApp();

const config = {
  apiKey: "AIzaSyDq3IUd5YMvRd1y6Qc1ofRs8GhCj2zNyqU",
  authDomain: "sandbox-social.firebaseapp.com",
  projectId: "sandbox-social",
  storageBucket: "sandbox-social.appspot.com",
  messagingSenderId: "542485794464",
  appId: "1:542485794464:web:5cf9d8448d436c1b1a03c5",
  measurementId: "G-LYL6C2BHQH",
};

firebase.initializeApp(config);
const db = admin.firestore();

app.get("/screams", (req, res) => {
  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then((data) => {
      let screams = [];
      data.forEach((doc) => {
        screams.push({
          screamId: doc.id,

          ...doc.data(),
        });
      });

      return res.json(screams);
    })
    .catch((err) => console.error(err));
});

app.post("/scream", (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
  };

  db.collection("posts")
    .add(newScream)
    .then((doc) => {
      res
        .json({
          message: `document ${doc.id} created successfully`,
        })
        .catch((err) => {
          res.status(500).json({ error: "something went wrong" });
          console.error(err);
        });
    });
});

//Signup route
app.post("/signup", (req, res) => {
  const newUser = {
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
    handle: req.body.handle,
  };

  //validate data

  firebase
    .auth()
    .createUserWithEmailAndPassword(newUser.email, newUser.password)
    .then((data) => {
      return res
        .status(201)
        .json({
          message: `user ${data.user.uid} signed up successfullly`,
        })
        .catch((err) => {
          console.error(err);
          return res.status(500).json({ error: err.code });
        });
    });
});

exports.api = functions.region("asia-southeast1-a").https.onRequest(app);
