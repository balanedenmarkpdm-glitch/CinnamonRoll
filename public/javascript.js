// ========================================
// CINNAMOROLL BAKERY SHOP
// JAVASCRIPT
// ========================================



// ========================================
// REGISTER
// ========================================

if (
    document.title.trim() === "Register"
) {

    const registerForm =
        document.querySelector("form");


    if (registerForm) {

        registerForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const fullName =
                    document
                        .getElementById("fullName")
                        .value
                        .trim();


                const username =
                    document
                        .getElementById("itxtbox")
                        .value
                        .trim();


                const email =
                    document
                        .getElementById("email")
                        .value
                        .trim()
                        .toLowerCase();


                const password =
                    document
                        .getElementById("ipassbox")
                        .value;


                const confirmPassword =
                    document
                        .getElementById("confirmPassword")
                        .value;


                // Check empty fields

                if (
                    fullName === "" ||
                    username === "" ||
                    email === "" ||
                    password === "" ||
                    confirmPassword === ""
                ) {

                    alert(
                        "Please fill in all fields."
                    );

                    return;

                }


                // Check password

                if (
                    password !== confirmPassword
                ) {

                    alert(
                        "Passwords do not match!"
                    );

                    return;

                }


                // Check password length

                if (
                    password.length < 6
                ) {

                    alert(
                        "Password must be at least 6 characters."
                    );

                    return;

                }


                try {

                    const response =
                        await fetch(
                            "/register",
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        fullName:
                                            fullName,

                                        username:
                                            username,

                                        email:
                                            email,

                                        password:
                                            password

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        alert(
                            "Account created successfully!"
                        );


                        registerForm.reset();


                        window.location.href =
                            "index.html";


                    } else {

                        alert(

                            data.message ||
                            "Registration failed."

                        );

                    }


                } catch (error) {

                    console.error(
                        "Registration error:",
                        error
                    );


                    alert(
                        "Cannot connect to the server."
                    );

                }

            }
        );

    }

}



// ========================================
// LOGIN
// ========================================

if (
    document.title.trim() === "Login"
) {


    const loginForm =
        document.querySelector("form");


    const usernameInput =
        document.getElementById(
            "itxtbox"
        );


    const passwordInput =
        document.getElementById(
            "ipassbox"
        );


    // Your existing checkbox ID

    const rememberMe =
        document.getElementById(
            "chkb2"
        );


    // ====================================
    // LOAD REMEMBERED LOGIN
    // ====================================

    const savedCredentials =
        localStorage.getItem(
            "cinnamorollRememberMe"
        );


    if (savedCredentials) {

        try {

            const credentials =
                JSON.parse(
                    savedCredentials
                );


            usernameInput.value =
                credentials.username || "";


            passwordInput.value =
                credentials.password || "";


            if (rememberMe) {

                rememberMe.checked =
                    true;

            }


        } catch (error) {

            console.error(
                "Could not load remembered login:",
                error
            );


            localStorage.removeItem(
                "cinnamorollRememberMe"
            );

        }

    }


    // ====================================
    // REMOVE SAVED LOGIN WHEN UNCHECKED
    // ====================================

    if (rememberMe) {

        rememberMe.addEventListener(
            "change",
            function () {

                if (!rememberMe.checked) {

                    localStorage.removeItem(
                        "cinnamorollRememberMe"
                    );

                }

            }
        );

    }


    // ====================================
    // LOGIN FORM
    // ====================================

    if (loginForm) {

        loginForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const username =
                    usernameInput
                        .value
                        .trim();


                const password =
                    passwordInput
                        .value;


                // Check empty fields

                if (
                    username === "" ||
                    password === ""
                ) {

                    alert(
                        "Please enter your username and password."
                    );

                    return;

                }


                try {

                    const response =
                        await fetch(
                            "/login",
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        username:
                                            username,

                                        password:
                                            password

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {


                        // =================================
                        // SAVE LOGIN
                        // =================================

                        if (
                            rememberMe &&
                            rememberMe.checked
                        ) {

                            localStorage.setItem(

                                "cinnamorollRememberMe",

                                JSON.stringify({

                                    username:
                                        username,

                                    password:
                                        password

                                })

                            );

                        }


                        // =================================
                        // REMOVE SAVED LOGIN
                        // =================================

                        else {

                            localStorage.removeItem(
                                "cinnamorollRememberMe"
                            );

                        }


                        alert(
                            "Login successful!"
                        );


                        window.location.href =
                            "home.html";


                    } else {

                        alert(

                            data.message ||
                            "Invalid username or password."

                        );

                    }


                } catch (error) {

                    console.error(
                        "Login error:",
                        error
                    );


                    alert(
                        "Cannot connect to the server."
                    );

                }

            }
        );

    }

}



// ========================================
// FORGOT PASSWORD
// ========================================

if (
    document.title.trim() ===
    "Forgot Password"
) {


    // ====================================
    // ELEMENTS
    // ====================================

    const forgotForm =
        document.getElementById(
            "forgotForm"
        );


    const codeForm =
        document.getElementById(
            "codeForm"
        );


    const resetForm =
        document.getElementById(
            "resetForm"
        );


    const emailStep =
        document.getElementById(
            "emailStep"
        );


    const codeStep =
        document.getElementById(
            "codeStep"
        );


    const passwordStep =
        document.getElementById(
            "passwordStep"
        );


    const emailInput =
        document.getElementById(
            "resetEmail"
        );


    const codeInput =
        document.getElementById(
            "resetCode"
        );


    const sentEmail =
        document.getElementById(
            "sentEmail"
        );


    const newPasswordInput =
        document.getElementById(
            "newPassword"
        );


    const confirmNewPasswordInput =
        document.getElementById(
            "confirmNewPassword"
        );


    let resetEmail = "";

    let resetToken = "";



    // ========================================
    // STEP 1
    // SEND VERIFICATION CODE
    // ========================================

    if (forgotForm) {

        forgotForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const email =
                    emailInput
                        .value
                        .trim()
                        .toLowerCase();


                if (email === "") {

                    alert(
                        "Please enter your email."
                    );

                    return;

                }


                try {

                    const response =
                        await fetch(
                            "/forgot-password",
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        email:
                                            email

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        resetEmail =
                            email;


                        sentEmail.textContent =
                            email;


                        emailStep.style.display =
                            "none";


                        codeStep.style.display =
                            "block";


                        alert(
                            "Verification code sent to your email."
                        );


                    } else {

                        alert(

                            data.message ||
                            "Unable to send verification code."

                        );

                    }


                } catch (error) {

                    console.error(
                        "Forgot password error:",
                        error
                    );


                    alert(
                        "Cannot connect to the server."
                    );

                }

            }
        );

    }



    // ========================================
    // STEP 2
    // VERIFY CODE
    // ========================================

    if (codeForm) {

        codeForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const code =
                    codeInput
                        .value
                        .trim();


                if (
                    !/^\d{6}$/.test(code)
                ) {

                    alert(
                        "Please enter the 6-digit verification code."
                    );

                    return;

                }


                try {

                    const response =
                        await fetch(
                            "/verify-reset-code",
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        email:
                                            resetEmail,

                                        code:
                                            code

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {

                        resetToken =
                            data.resetToken;


                        codeStep.style.display =
                            "none";


                        passwordStep.style.display =
                            "block";


                        alert(
                            "Code verified successfully!"
                        );


                    } else {

                        alert(

                            data.message ||
                            "Invalid verification code."

                        );

                    }


                } catch (error) {

                    console.error(
                        "Code verification error:",
                        error
                    );


                    alert(
                        "Cannot connect to the server."
                    );

                }

            }
        );

    }



    // ========================================
    // STEP 3
    // CHANGE PASSWORD
    // ========================================

    if (resetForm) {

        resetForm.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();


                const newPassword =
                    newPasswordInput
                        .value;


                const confirmPassword =
                    confirmNewPasswordInput
                        .value;


                if (
                    newPassword === "" ||
                    confirmPassword === ""
                ) {

                    alert(
                        "Please fill in both password fields."
                    );

                    return;

                }


                if (
                    newPassword !==
                    confirmPassword
                ) {

                    alert(
                        "Passwords do not match!"
                    );

                    return;

                }


                if (
                    newPassword.length < 6
                ) {

                    alert(
                        "Password must be at least 6 characters."
                    );

                    return;

                }


                if (!resetToken) {

                    alert(
                        "Your reset session is invalid. Please start again."
                    );

                    return;

                }


                try {

                    const response =
                        await fetch(
                            "/reset-password",
                            {

                                method: "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify({

                                        resetToken:
                                            resetToken,

                                        password:
                                            newPassword

                                    })

                            }
                        );


                    const data =
                        await response.json();


                    if (response.ok) {


                        // Remove old remembered password

                        localStorage.removeItem(
                            "cinnamorollRememberMe"
                        );


                        alert(
                            "Password changed successfully!"
                        );


                        window.location.href =
                            "index.html";


                    } else {

                        alert(

                            data.message ||
                            "Unable to change password."

                        );

                    }


                } catch (error) {

                    console.error(
                        "Reset password error:",
                        error
                    );


                    alert(
                        "Cannot connect to the server."
                    );

                }

            }
        );

    }

}