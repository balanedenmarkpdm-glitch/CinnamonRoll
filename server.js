const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();


// ========================================
// MIDDLEWARE
// ========================================

app.use(cors());
app.use(express.json());

// Serve HTML, CSS, JavaScript, and images
app.use(express.static(__dirname));


// ========================================
// MONGODB CONNECTION
// ========================================

// For Vercel, use the MONGODB_URI environment variable.
// For local testing, you can put your working connection
// string in a .env file.

mongoose.connect(process.env.MONGODB_URI)
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
// HOME PAGE
// ========================================

app.get("/", (req, res) => {

    res.sendFile(__dirname + "/home.html");

});


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


        // Check if username already exists
        const usernameExists = await User.findOne({
            username: username
        });

        if (usernameExists) {

            return res.status(400).json({
                message: "Username already exists."
            });

        }


        // Check if email already exists
        const emailExists = await User.findOne({
            email: email
        });

        if (emailExists) {

            return res.status(400).json({
                message: "Email already exists."
            });

        }


        // Create user
        const newUser = new User({

            fullName: fullName,
            username: username,
            email: email,
            password: password

        });


        // Save user
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


        // Find user
        const user = await User.findOne({

            username: username,
            password: password

        });


        // User not found
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
// START SERVER
// ========================================

// Use Vercel's port when deployed,
// otherwise use 3000 locally.

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

    console.log(`Server running on port ${PORT}`);

});
