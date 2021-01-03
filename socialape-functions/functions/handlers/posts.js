const { db } = require("../util/admin");

exports.getAllPost = (req, res) => {
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
    .catch((err) => {
      console.error(err);
      res.status(500).json({ error: err.code });
    });
};

exports.postOnePost = (req, res) => {
  const newScream = {
    body: req.body.body,
    userHandle: req.body.userHandle,
    createdAt: new Date().toISOString(),
    userImage: req.user.imageUrl,
    likeCount: 0,
    commentCount: 0,
  };

  db.collection("posts")
    .add(newScream)
    .then((doc) => {
      const resScream = newScream;
      resScream.screamId = doc.id;

      res.json(resScream);
    })
    .catch((err) => {
      res.status(500).json({ error: "something went wrong" });
      console.error(err);
    });
};
