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

const EMAIL_USER =
    "balanedenmark.pdm@gmail.com";

const EMAIL_APP_PASSWORD =
    "spajubrkmodovknd";


// ========================================
// APPLICATION URL
// ========================================

const APP_URL =
    "http://localhost:3000";


// ========================================
// MONGODB
// ========================================

const MONGO_USER =
    "balanedenmarkpdm_db_user";

const MONGO_PASSWORD =
    "balane440";

const MONGO_URI =
    `mongodb+srv://${encodeURIComponent(MONGO_USER)}:${encodeURIComponent(MONGO_PASSWORD)}@cluster0.ybe0qzn.mongodb.net/CinnamonRoll?retryWrites=true&w=majority&appName=Cluster0`;


// ========================================
// EXPRESS APP
// ========================================

const app =
    express();


// ========================================
// MIDDLEWARE
// ========================================

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

        if (
            mongoose.connection.readyState === 1
        ) {
            return;
        }

        console.log(
            "Connecting to MongoDB..."
        );

        await mongoose.connect(
            MONGO_URI,
            {
                serverSelectionTimeoutMS: 8000
            }
        );

        console.log(
            "MongoDB connected successfully!"
        );

    } catch (error) {

        console.error(
            "========== MONGODB ERROR =========="
        );

        console.error(
            error.message
        );

        console.error(
            "==================================="
        );

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
        // PASSWORD RESET
        // ====================================

        resetTokenHash: {
            type: String,
            default: null
        },

        resetTokenExpires: {
            type: Date,
            default: null
        }

    });


// ========================================
// USER MODEL
// ========================================

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
// RESET TOKEN GENERATOR
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
        } = req.body || {};


        // ====================================
        // REQUIRED FIELDS
        // ====================================

        if (
            !fullName ||
            !username ||
            !email ||
            !password
        ) {

            return res.status(400).json({
                message:
                    "Please fill in all fields."
            });

        }


        // ====================================
        // PASSWORD LENGTH
        // ====================================

        if (
            String(password).length < 6
        ) {

            return res.status(400).json({
                message:
                    "Password must be at least 6 characters."
            });

        }


        const cleanUsername =
            String(username)
                .trim();


        const cleanEmail =
            String(email)
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

            return res.status(400).json({
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

            return res.status(400).json({
                message:
                    "Email is already registered."
            });

        }


        // ====================================
        // HASH PASSWORD
        // ====================================

        const hashedPassword =
            await bcrypt.hash(
                String(password),
                10
            );


        // ====================================
        // CREATE USER
        // ====================================

        await User.create({

            fullName:
                String(fullName).trim(),

            username:
                cleanUsername,

            email:
                cleanEmail,

            password:
                hashedPassword

        });


        return res.json({
            message:
                "Registered successfully."
        });


    } catch (error) {

        console.error(
            "Registration error:",
            error
        );

        return res.status(500).json({
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

        console.log(
            "LOGIN REQUEST RECEIVED"
        );


        await db();


        const {
            username,
            password
        } = req.body || {};


        if (
            !username ||
            !password
        ) {

            return res.status(400).json({
                message:
                    "Username and password are required."
            });

        }


        const cleanUsername =
            String(username).trim();


        const user =
            await User.findOne({
                username:
                    cleanUsername
            });


        console.log(
            "User found:",
            user ? "YES" : "NO"
        );


        if (!user) {

            return res.status(401).json({
                message:
                    "Invalid username or password."
            });

        }


        // ====================================
        // CHECK PASSWORD FIELD
        // ====================================

        if (
            !user.password ||
            typeof user.password !== "string"
        ) {

            console.error(
                "User has no valid password."
            );

            return res.status(500).json({
                message:
                    "This account has an invalid password record. Please register again."
            });

        }


        // ====================================
        // CHECK PASSWORD
        // ====================================

        const passwordCorrect =
            await bcrypt.compare(
                String(password),
                user.password
            );


        console.log(
            "Password correct:",
            passwordCorrect
        );


        if (!passwordCorrect) {

            return res.status(401).json({
                message:
                    "Invalid username or password."
            });

        }


        console.log(
            "LOGIN SUCCESS"
        );


        return res.json({
            message:
                "Login success"
        });


    } catch (error) {

        console.error(
            "========== LOGIN ERROR =========="
        );

        console.error(
            error
        );

        console.error(
            "================================="
        );


        return res.status(500).json({
            message:
                "Server error during login."
        });

    }
}


// ========================================
// FORGOT PASSWORD
// SEND RESET LINK
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


        // ====================================
        // REQUIRED EMAIL
        // ====================================

        if (!email) {

            return res.status(400).json({
                message:
                    "Email is required."
            });

        }


        // ====================================
        // CHECK GMAIL SETTINGS
        // ====================================

        if (
            EMAIL_USER ===
                "YOUR_GMAIL@gmail.com" ||
            EMAIL_APP_PASSWORD ===
                "YOUR_16_CHARACTER_APP_PASSWORD"
        ) {

            return res.status(500).json({
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
         * Don't reveal whether the account exists.
         */

        if (!user) {

            return res.json({
                message:
                    "If an account with that email exists, a password reset link has been sent."
            });

        }


        // ====================================
        // GENERATE RESET TOKEN
        // ====================================

        const resetToken =
            generateResetToken();


        // ====================================
        // SAVE ONLY TOKEN HASH
        // ====================================

        user.resetTokenHash =
            hashValue(
                resetToken
            );


        user.resetTokenExpires =
            new Date(
                Date.now() +
                15 * 60 * 1000
            );


        await user.save();


        // ====================================
        // CREATE RESET URL
        // ====================================

        const resetUrl =
            `${APP_URL}/reset-password.html?token=${encodeURIComponent(resetToken)}`;


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
                    "CINNAMOROLL BAKERY SHOP - Reset Your Password",

                text:
                    `We received a request to reset your password.

Click the link below to reset your password:

${resetUrl}

This link expires in 15 minutes.

If you did not request a password reset, you can ignore this email.`,

                html: `
                    <div style="
                        font-family: Arial, sans-serif;
                        max-width: 520px;
                        margin: 20px auto;
                        padding: 30px;
                        border: 1px solid #ddd;
                        border-radius: 12px;
                        line-height: 1.6;
                    ">

                        <h2>
                            CINNAMOROLL BAKERY SHOP
                        </h2>

                        <p>
                            We received a request to reset
                            your password.
                        </p>

                        <p>
                            Click the button below to create
                            a new password.
                        </p>

                        <div style="
                            text-align: center;
                            margin: 30px 0;
                        ">

                            <a
                                href="${resetUrl}"
                                style="
                                    display: inline-block;
                                    padding: 12px 24px;
                                    background: #333;
                                    color: #fff;
                                    text-decoration: none;
                                    border-radius: 8px;
                                    font-weight: bold;
                                "
                            >
                                Reset Password
                            </a>

                        </div>

                        <p>
                            This link expires in
                            <strong>15 minutes</strong>.
                        </p>

                        <p>
                            If you did not request this,
                            you can ignore this email.
                        </p>

                    </div>
                `

            });


        } catch (emailError) {

            // Invalidate token if email fails

            user.resetTokenHash =
                null;

            user.resetTokenExpires =
                null;

            await user.save();


            console.error(
                "Email sending error:",
                emailError
            );


            return res.status(500).json({
                message:
                    "Unable to send password reset email. Check your Gmail settings."
            });

        }


        return res.json({
            message:
                "Password reset link has been sent to your email."
        });


    } catch (error) {

        console.error(
            "Forgot password error:",
            error
        );


        return res.status(500).json({
            message:
                "Unable to process password reset request."
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
        } = req.body || {};


        // ====================================
        // CHECK REQUIRED DATA
        // ====================================

        if (
            !resetToken ||
            !password
        ) {

            return res.status(400).json({
                message:
                    "Reset information is incomplete."
            });

        }


        // ====================================
        // PASSWORD LENGTH
        // ====================================

        if (
            String(password).length < 6
        ) {

            return res.status(400).json({
                message:
                    "Password must be at least 6 characters."
            });

        }


        // ====================================
        // HASH TOKEN
        // ====================================

        const tokenHash =
            hashValue(
                String(resetToken)
            );


        // ====================================
        // FIND VALID TOKEN
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

            return res.status(400).json({
                message:
                    "Password reset link is invalid or expired."
            });

        }


        // ====================================
        // CHANGE PASSWORD
        // ====================================

        user.password =
            await bcrypt.hash(
                String(password),
                10
            );


        // ====================================
        // INVALIDATE RESET TOKEN
        // ====================================

        user.resetTokenHash =
            null;

        user.resetTokenExpires =
            null;


        await user.save();


        return res.json({
            message:
                "Password changed successfully."
        });


    } catch (error) {

        console.error(
            "Reset password error:",
            error
        );


        return res.status(500).json({
            message:
                "Unable to change password."
        });

    }
}


// ========================================
// ROUTES
// ========================================


// REGISTER

app.post(
    "/register",
    register
);

app.post(
    "/api/register",
    register
);


// LOGIN

app.post(
    "/login",
    login
);

app.post(
    "/api/login",
    login
);


// FORGOT PASSWORD

app.post(
    "/forgot-password",
    forgotPassword
);

app.post(
    "/api/forgot-password",
    forgotPassword
);


// RESET PASSWORD

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

app.get(
    "/api/health",
    async (req, res) => {

        try {

            await db();

            return res.json({
                ok: true
            });

        } catch (error) {

            console.error(
                "Health check error:",
                error
            );

            return res.status(500).json({
                ok: false,
                error:
                    error.message
            });

        }
    }
);


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

if (
    require.main === module
) {

    const PORT =
        process.env.PORT ||
        3000;


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
            console.error(
                "================================"
            );
            console.error(
                "MONGODB CONNECTION FAILED"
            );
            console.error(
                "================================"
            );
            console.error(
                error.message
            );
            console.error("");

            process.exit(1);

        });

}