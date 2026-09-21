const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const path = require("path");


// ========================================
// EMAIL CREDENTIALS
// ========================================

// Put the Gmail address that will SEND the code here.

const EMAIL_USER =
    "yourgmail@gmail.com";


// Put your Google App Password here.
// NOT your normal Gmail password.

const EMAIL_APP_PASSWORD =
    "YOUR_16_CHARACTER_APP_PASSWORD";


// ========================================


// ========================================
// MONGODB
// ========================================

const MONGO_USER = "balanedenmarkpdm_db_user";
const MONGO_PASSWORD = "balane440";

const MONGO_URI =
    `mongodb+srv://${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASSWORD)}@cluster0.ybe0qzn.mongodb.net/CinnamonRoll?retryWrites=true&w=majority&appName=Cluster0`;


// ========================================
// EXPRESS APP
// ========================================

const app =
    express();


app.use(
    cors()
);


app.use(
    express.json()
);


app.use(
    express.urlencoded({
        extended: true
    })
);


// ========================================
// PUBLIC FOLDER
// ========================================

const PUBLIC =
    path.join(
        process.cwd(),
        "public"
    );


app.use(
    express.static(PUBLIC)
);


// ========================================
// MONGODB CONNECTION
// ========================================

async function db() {
    try {
        if (mongoose.connection.readyState === 1) {
            return;
        }

        console.log("Connecting to MongoDB...");

        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 8000
        });

        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("========== MONGODB ERROR ==========");
        console.error(error.message);
        console.error("===================================");
        throw error;
    }
}



// ========================================
// USER SCHEMA
// ========================================

const userSchema =
    new mongoose.Schema({

        fullName: {

            type: String,

            required: false,

            trim: true

        },


        username: {

            type: String,

            required: true,

            unique: true,

            trim: true

        },


        email: {

            type: String,

            required: false,

            unique: true,

            sparse: true,

            lowercase: true,

            trim: true

        },


        password: {

            type: String,

            required: true

        },


        // ====================================
        // PASSWORD RESET DATA
        // ====================================

        resetCodeHash: {

            type: String,

            default: null

        },


        resetCodeExpires: {

            type: Date,

            default: null

        },


        resetCodeAttempts: {

            type: Number,

            default: 0

        },


        resetTokenHash: {

            type: String,

            default: null

        },


        resetTokenExpires: {

            type: Date,

            default: null

        }

    });


// Reuse model if it already exists

const User =
    mongoose.models.User ||
    mongoose.model(
        "User",
        userSchema
    );


// ========================================
// NODEMAILER
// ========================================

const transporter =
    nodemailer.createTransport({

        service: "gmail",

        auth: {

            user:
                EMAIL_USER,

            pass:
                EMAIL_APP_PASSWORD

        }

    });


// ========================================
// CODE GENERATOR
// ========================================

function generateVerificationCode() {

    return crypto
        .randomInt(
            100000,
            1000000
        )
        .toString();

}


// ========================================
// TOKEN GENERATOR
// ========================================

function generateResetToken() {

    return crypto
        .randomBytes(32)
        .toString("hex");

}


// ========================================
// HASH FUNCTION
// ========================================

function hashValue(value) {

    return crypto
        .createHash("sha256")
        .update(value)
        .digest("hex");

}



// ========================================
// REGISTER
// ========================================

async function register(
    req,
    res
) {

    try {

        await db();


        const {
            fullName,
            username,
            email,
            password
        } = req.body;


        // Check required fields

        if (
            !fullName ||
            !username ||
            !email ||
            !password
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Please fill in all fields."

                });

        }


        // Check password length

        if (
            password.length < 6
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Password must be at least 6 characters."

                });

        }


        const cleanUsername =
            username
                .trim();


        const cleanEmail =
            email
                .trim()
                .toLowerCase();


        // ====================================
        // CHECK USERNAME
        // ====================================

        const existingUsername =
            await User.findOne({

                username:
                    cleanUsername

            });


        if (existingUsername) {

            return res
                .status(400)
                .json({

                    message:
                        "Username already exists."

                });

        }


        // ====================================
        // CHECK EMAIL
        // ====================================

        const existingEmail =
            await User.findOne({

                email:
                    cleanEmail

            });


        if (existingEmail) {

            return res
                .status(400)
                .json({

                    message:
                        "Email is already registered."

                });

        }


        // ====================================
        // HASH PASSWORD
        // ====================================

        const hashedPassword =
            await bcrypt.hash(
                password,
                10
            );


        // ====================================
        // CREATE USER
        // ====================================

        await User.create({

            fullName:
                fullName.trim(),

            username:
                cleanUsername,

            email:
                cleanEmail,

            password:
                hashedPassword

        });


        res.json({

            message:
                "Registered successfully."

        });


    } catch (error) {

console.error("Registration error:");
console.error(error);

        res
            .status(500)
            .json({

                message:
                    "Server error during registration."

            });

    }

}



// ========================================
// LOGIN
// ========================================

async function login(
    req,
    res
) {

    try {

        await db();


        const {
            username,
            password
        } = req.body;


        if (
            !username ||
            !password
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Username and password are required."

                });

        }


        const cleanUsername =
            username
                .trim();


        const user =
            await User.findOne({

                username:
                    cleanUsername

            });


        if (!user) {

            return res
                .status(401)
                .json({

                    message:
                        "Invalid username or password."

                });

        }


        const passwordCorrect =
            await bcrypt.compare(

                password,

                user.password

            );


        if (!passwordCorrect) {

            return res
                .status(401)
                .json({

                    message:
                        "Invalid username or password."

                });

        }


        res.json({

            message:
                "Login success"

        });


    } catch (error) {

        console.error(
            "Login error:",
            error
        );


        res
            .status(500)
            .json({

                message:
                    "Server error during login."

                });

    }

}



// ========================================
// FORGOT PASSWORD
// SEND CODE
// ========================================

async function forgotPassword(
    req,
    res
) {

    try {

        await db();


        const email =
            String(
                req.body.email || ""
            )
            .trim()
            .toLowerCase();


        if (!email) {

            return res
                .status(400)
                .json({

                    message:
                        "Email is required."

                });

        }


        // ====================================
        // CHECK EMAIL SETTINGS
        // ====================================

        if (
            EMAIL_USER ===
            "yourgmail@gmail.com" ||

            EMAIL_APP_PASSWORD ===
            "YOUR_16_CHARACTER_APP_PASSWORD"
        ) {

            return res
                .status(500)
                .json({

                    message:
                        "Please configure your Gmail credentials in server.js."

                });

        }


        // ====================================
        // FIND USER
        // ====================================

        const user =
            await User.findOne({

                email:
                    email

            });


        /*
         * We use a generic response for an
         * unknown email instead of revealing
         * whether the account exists.
         */

        if (!user) {

            return res.json({

                message:
                    "If an account with that email exists, a verification code has been sent."

            });

        }


        // ====================================
        // GENERATE CODE
        // ====================================

        const code =
            generateVerificationCode();


        // ====================================
        // SAVE HASHED CODE
        // ====================================

        user.resetCodeHash =
            hashValue(code);


        user.resetCodeExpires =
            new Date(

                Date.now() +
                10 * 60 * 1000

            );


        user.resetCodeAttempts =
            0;


        // Clear previous token

        user.resetTokenHash =
            null;


        user.resetTokenExpires =
            null;


        await user.save();


        // ====================================
        // SEND EMAIL
        // ====================================

        try {

            await transporter.sendMail({

                from:
                    EMAIL_USER,

                to:
                    user.email,

                subject:
                    "CINNAMOROLL BAKERY SHOP - Password Reset Code",

                text:
                    `Your CINNAMOROLL BAKERY SHOP password reset verification code is ${code}. This code expires in 10 minutes.`,

                html: `

                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 500px;
                        margin: 20px auto;
                        padding: 25px;
                        border: 1px solid #ddd;
                        border-radius: 12px;
                    ">

                        <h2>
                            CINNAMOROLL BAKERY SHOP
                        </h2>

                        <p>
                            We received a request to
                            reset your password.
                        </p>

                        <p>
                            Your verification code is:
                        </p>

                        <div style="
                            text-align: center;
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 8px;
                            margin: 25px 0;
                        ">

                            ${code}

                        </div>

                        <p>
                            This code expires in
                            <strong>10 minutes</strong>.
                        </p>

                        <p>
                            If you did not request a
                            password reset, you can ignore
                            this email.
                        </p>

                    </div>

                `

            });


        } catch (emailError) {

            // Remove unusable reset code
            // if email could not be sent.

            user.resetCodeHash =
                null;

            user.resetCodeExpires =
                null;

            user.resetCodeAttempts =
                0;

            await user.save();


            console.error(
                "Email sending error:",
                emailError
            );


            return res
                .status(500)
                .json({

                    message:
                        "Unable to send verification email. Check your Gmail settings."

                });

        }


        res.json({

            message:
                "Verification code sent."

        });


    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );


        res
            .status(500)
            .json({

                message:
                    "Unable to send verification code."

                });

    }

}



// ========================================
// VERIFY RESET CODE
// ========================================

async function verifyResetCode(
    req,
    res
) {

    try {

        await db();


        const email =
            String(
                req.body.email || ""
            )
            .trim()
            .toLowerCase();


        const code =
            String(
                req.body.code || ""
            )
            .trim();


        if (
            !email ||
            !code
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Email and verification code are required."

                });

        }


        // ====================================
        // FIND USER
        // ====================================

        const user =
            await User.findOne({

                email:
                    email

            });


        if (!user) {

            return res
                .status(400)
                .json({

                    message:
                        "Invalid verification code."

                });

        }


        // ====================================
        // CHECK CODE EXISTS
        // ====================================

        if (
            !user.resetCodeHash ||
            !user.resetCodeExpires
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Verification code is invalid or expired."

                });

        }


        // ====================================
        // CHECK ATTEMPTS
        // ====================================

        if (
            user.resetCodeAttempts >= 5
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Too many incorrect attempts. Request a new code."

                });

        }


        // ====================================
        // CHECK EXPIRATION
        // ====================================

        if (
            Date.now() >
            user.resetCodeExpires.getTime()
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Verification code has expired."

                });

        }


        // ====================================
        // COMPARE CODE
        // ====================================

        const suppliedHash =
            hashValue(code);


        if (
            suppliedHash !==
            user.resetCodeHash
        ) {

            user.resetCodeAttempts += 1;

            await user.save();


            return res
                .status(400)
                .json({

                    message:
                        "Invalid verification code."

                });

        }


        // ====================================
        // CREATE RESET TOKEN
        // ====================================

        const resetToken =
            generateResetToken();


        user.resetTokenHash =
            hashValue(
                resetToken
            );


        user.resetTokenExpires =
            new Date(

                Date.now() +
                15 * 60 * 1000

            );


        // ====================================
        // INVALIDATE CODE
        // ====================================

        user.resetCodeHash =
            null;


        user.resetCodeExpires =
            null;


        user.resetCodeAttempts =
            0;


        await user.save();


        res.json({

            message:
                "Code verified successfully.",

            resetToken:
                resetToken

        });


    } catch (error) {

        console.error(
            "Verify code error:",
            error
        );


        res
            .status(500)
            .json({

                message:
                    "Unable to verify verification code."

                });

    }

}



// ========================================
// RESET PASSWORD
// ========================================

async function resetPassword(
    req,
    res
) {

    try {

        await db();


        const {
            resetToken,
            password
        } = req.body;


        if (
            !resetToken ||
            !password
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Reset information is incomplete."

                });

        }


        // ====================================
        // PASSWORD LENGTH
        // ====================================

        if (
            password.length < 6
        ) {

            return res
                .status(400)
                .json({

                    message:
                        "Password must be at least 6 characters."

                });

        }


        // ====================================
        // HASH TOKEN
        // ====================================

        const tokenHash =
            hashValue(
                resetToken
            );


        // ====================================
        // FIND VALID RESET SESSION
        // ====================================

        const user =
            await User.findOne({

                resetTokenHash:
                    tokenHash,

                resetTokenExpires:
                    {
                        $gt:
                            new Date()
                    }

            });


        if (!user) {

            return res
                .status(400)
                .json({

                    message:
                        "Reset session is invalid or expired."

                });

        }


        // ====================================
        // HASH NEW PASSWORD
        // ====================================

        user.password =
            await bcrypt.hash(
                password,
                10
            );


        // ====================================
        // DELETE RESET TOKEN
        // ====================================

        user.resetTokenHash =
            null;


        user.resetTokenExpires =
            null;


        await user.save();


        res.json({

            message:
                "Password changed successfully."

        });


    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );


        res
            .status(500)
            .json({

                message:
                    "Unable to change password."

                });

    }

}



// ========================================
// ROUTES
// ========================================

// Registration

app.post(
    "/register",
    register
);

app.post(
    "/api/register",
    register
);


// Login

app.post(
    "/login",
    login
);

app.post(
    "/api/login",
    login
);


// Forgot Password

app.post(
    "/forgot-password",
    forgotPassword
);

app.post(
    "/api/forgot-password",
    forgotPassword
);


// Verify code

app.post(
    "/verify-reset-code",
    verifyResetCode
);

app.post(
    "/api/verify-reset-code",
    verifyResetCode
);


// Reset password

app.post(
    "/reset-password",
    resetPassword
);

app.post(
    "/api/reset-password",
    resetPassword
);



// ========================================
// HEALTH CHECK
// ========================================

app.get("/api/health", async (req, res) => {
    console.log("Health check requested...");

    try {
        await db();

        console.log("MongoDB connection OK!");

        res.json({
            ok: true
        });

    } catch (error) {
        console.error("Health check error:");
        console.error(error);

        res.status(500).json({
            ok: false,
            error: error.message
        });
    }
});



// ========================================
// HOME PAGE
// ========================================

app.get(
    "/",
    (req, res) => {

        res.sendFile(

            path.join(
                PUBLIC,
                "home.html"
            )

        );

    }
);



// ========================================
// HTML PAGES
// ========================================

app.get(
    "/:page.html",
    (req, res) => {

        res.sendFile(

            path.join(
                PUBLIC,
                req.params.page +
                ".html"
            ),

            error => {

                if (error) {

                    res
                        .status(404)
                        .send(
                            "Page not found"
                        );

                }

            }

        );

    }
);



// ========================================
// EXPORT
// ========================================

module.exports =
    app;



// ========================================
// LOCAL SERVER
// ========================================

if (require.main === module) {

    const PORT =
        process.env.PORT || 3000;

    db()
        .then(() => {

            app.listen(
                PORT,
                () => {
                    console.log(
                        "Running on http://localhost:" +
                        PORT
                    );
                }
            );

        })
        .catch(error => {

            console.error("");
            console.error("================================");
            console.error("MONGODB CONNECTION FAILED");
            console.error("================================");
            console.error(error.message);
            console.error("");

            process.exit(1);
        });
}