const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());


// ========================================
// MONGODB CONNECTION
// ========================================

mongoose.connect(
    "mongodb+srv://balanedenmarkpdm_db_user:balane440@cluster0.ybe0qzn.mongodb.net/registerdb?appName=Cluster0"
)
.then(() => {
    console.log("MongoDB connected");
})
.catch((error) => {
    console.log("MongoDB connection error:", error);
});


// ========================================
// USER SCHEMA
// ========================================

const userSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true
    },

    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true
    },

    password: {
        type: String,
        required: true
    }

});


// ========================================
// USER MODEL
// ========================================

const User = mongoose.model("User", userSchema);


// ========================================
// REGISTER
// ========================================

app.post("/register", async (req, res) => {

    try {

        const {
            fullName,
            username,
            email,
            password
        } = req.body;


        // Check empty fields
        if (
            !fullName ||
            !username ||
            !email ||
            !password
        ) {

            return res.status(400).json({
                message: "Please fill in all fields."
            });

        }


        // Check username
        const usernameExists = await User.findOne({
            username: username
        });

        if (usernameExists) {

            return res.status(400).json({
                message: "Username already exists."
            });

        }


        // Check email
        const emailExists = await User.findOne({
            email: email
        });

        if (emailExists) {

            return res.status(400).json({
                message: "Email already exists."
            });

        }


        // Create new user
        const newUser = new User({

            fullName: fullName,
            username: username,
            email: email,
            password: password

        });


        // Save to MongoDB
        await newUser.save();

        console.log("New user registered:", username);


        res.status(201).json({
            message: "Registration successful!"
        });


    } catch (error) {

        console.log("Registration error:", error);

        res.status(500).json({
            message: "Registration failed."
        });

    }

});


// ========================================
// LOGIN
// ========================================

app.post("/login", async (req, res) => {

    try {

        const {
            username,
            password
        } = req.body;


        // Check empty fields
        if (!username || !password) {

            return res.status(400).json({
                message: "Please enter your username and password."
            });

        }


        // Find matching user
        const user = await User.findOne({
            username: username,
            password: password
        });


        // Invalid login
        if (!user) {

            return res.status(401).json({
                message: "Invalid username or password."
            });

        }


        console.log("User logged in:", username);


        res.status(200).json({
            message: "Login successful!"
        });


    } catch (error) {

        console.log("Login error:", error);

        res.status(500).json({
            message: "Login failed."
        });

    }

});


// ========================================
// TEST SERVER
// ========================================

app.get("/", (req, res) => {

    res.send("Cinnamoroll Bakery server is running!");

});


// ========================================
// START SERVER
// ========================================

app.listen(3000, () => {

    console.log("Server running at http://localhost:3000");

});