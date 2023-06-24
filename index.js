const { initializeApp } = require("firebase/app");
const {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyC13fG-PiofDhUYsBPtShstbrk8D9_sE7I",
  authDomain: "personal-finance-tracker-6b9cc.firebaseapp.com",
  projectId: "personal-finance-tracker-6b9cc",
  storageBucket: "personal-finance-tracker-6b9cc.appspot.com",
  messagingSenderId: "118222825414",
  appId: "1:118222825414:web:e0a366a0537d38103cb4c7",
};

const express = require("express");
const bodyParser = require("body-parser");
const app = express();
const PORT = process.env.PORT || 8000;
const mongoose = require("mongoose");
const { resolve } = require("path/posix");
app.use(express.static("public"));

async function main() {
    await mongoose.connect(
      "mongodb+srv://siddhartha:sidd12345@cluster0.2niimgt.mongodb.net/?retryWrites=true&w=majority"
    );
    console.log("Connected to MongoDB");
  }
  main();
  const transactionSchema = new mongoose.Schema({
    userID: String,
    type: String,
    amount: Number,
    balance: Number,
    purpose: String,
    date: String,
  });
  const transaction = mongoose.model(
    "transaction",
    transactionSchema,
    "transaction-posts"
  );

app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));

const app2 = initializeApp(firebaseConfig);
const auth = getAuth(app2);

const currentDate = new Date();
const day = String(currentDate.getDate()).padStart(2, "0");
const month = String(currentDate.getMonth() + 1).padStart(2, "0");
const year = currentDate.getFullYear();
const date = `${day}-${month}-${year}`;

function update_signup(userId,res,balance)
{
    console.log("Entered");
    console.log(userId);
    transaction.find({userID: userId})
        .then(datas => {
            console.log(datas);
            res.render("home",{ userId: userId, date:date,balance:balance, data:datas });

        })
        .catch(error => {
            console.error('Error retrieving orders:', error);
            res.status(500).send('Error retrieving orders');
        });
}

function update(userId,res)
{
    console.log(userId);
    transaction.find({userID: userId})
        .then(datas => {
            console.log(datas);
            res.render("home",{ userId: userId, date:date, data:datas });
            // res.redirect(req.originalUrl);

        })
        .catch(error => {
            console.error('Error retrieving orders:', error);
            res.status(500).send('Error retrieving orders');
        });
}

app.post("/signup", function (req, res) {
  var email = req.body.email;
  var pass1 = req.body.pass1;
  var pass2 = req.body.pass2;
  if (pass1 === pass2) {
    createUserWithEmailAndPassword(auth, email, pass1)
      .then((userCredential) => {
        const user = userCredential.user;
        const userId = user.uid;
        update_signup(userId,res,0);
        // res.render("home", { userId: userId, date:date, balance: Number(0), data:[] });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        if (errorCode === "auth/email-already-in-use") {
          res.send("Account Already Exist Please Log IN");
        } else {
          if (errorCode === "auth/weak-password") {
            res.send(
              "Weak Password : Password should be greater than six charecters."
            );
          } else {
            res.send("Unknown Error Occured! Contact Admin");
          }
        }
      });
  } else {
    res.send("Password Mismatch Recheck the entered Credentials");
  }
});

app.get("/login", function (req, res) {
  res.render("login");
});
app.post("/login", function (req, res) {
  var email = req.body.email;
  var pass = req.body.pass1;
  signInWithEmailAndPassword(auth, email, pass)
    .then((userCredential) => {
      const user = userCredential.user;
      const userId = user.uid;
      update(userId,res);
    })
    .catch((error) => {
      const signInErrorCode = error.code;
      const signInErrorMessage = error.message;
      if (signInErrorCode === "auth/wrong-password") {
        res.send("The Entered Password is Incorrect");
      } else if (signInErrorCode === "auth/user-not-found") {
        res.send(
          "User not Registered with us Please create an Account and Log In"
        );
      } else {
        res.send("Unknown Error Occered during Log In, Contact Admin");
      }
    });
});
app.get("/", function (req, res) {
  res.render("signup");
});

app.post("/post", function (req, res) {
  const userId = req.body.userId;
  var balance = Number(req.body.balance); 
  const amount = Number(req.body.amount); 
  const type = req.body.type;
  const purpose = req.body.purpose;
  const currentDate = new Date();
  const day = String(currentDate.getDate()).padStart(2, "0");
  const month = String(currentDate.getMonth() + 1).padStart(2, "0");
  const year = currentDate.getFullYear();
  const date = `${day}-${month}-${year}`;
  if(type === 'income')
  {
    balance += amount;
  }
  else if(type ==='expense')
  {
    balance-= amount;
  }
  const newTransaction = new transaction({
    balance: Number(balance),
    userID: userId,
    type: type,
    amount: amount,
    purpose: purpose,
    date: date,
  });
  async function saveTransactionPost() {
    await newTransaction.save();
  }
  saveTransactionPost().then(() => {
    console.log(newTransaction);
    update(userId, res); // Reload the EJS file with updated data
  });
});

app.listen(PORT, function (req, res) {
  console.log(`Server started on port ${PORT}`);
});

