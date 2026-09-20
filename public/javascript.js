// ========================================
// CINNAMOROLL BAKERY SHOP
// JAVASCRIPT
// ========================================


// ========================================
// REGISTER
// ========================================

if (document.title.trim() === "Register") {

    const registerForm = document.querySelector("form");

    if (registerForm) {

        registerForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            // Get values
            const fullName =
                document.getElementById("fullName").value.trim();

            const username =
                document.getElementById("itxtbox").value.trim();

            const email =
                document.getElementById("email").value.trim();

            const password =
                document.getElementById("ipassbox").value;

            const confirmPassword =
                document.getElementById("confirmPassword").value;


            // Check empty fields
            if (
                fullName === "" ||
                username === "" ||
                email === "" ||
                password === "" ||
                confirmPassword === ""
            ) {

                alert("Please fill in all fields.");
                return;

            }


            // Check passwords
            if (password !== confirmPassword) {

                alert("Passwords do not match!");
                return;

            }


            try {

                // Send registration data to server
                const response = await fetch("/register", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        fullName: fullName,
                        username: username,
                        email: email,
                        password: password

                    })

                });


                const data = await response.json();


                // Registration successful
                if (response.ok) {

                    alert("Account created successfully!");

                    registerForm.reset();

                    // Go to Login
                    window.location.href = "index (1).html";

                } else {

                    alert(
                        data.message ||
                        "Registration failed."
                    );

                }


            } catch (error) {

                console.error("Registration error:", error);

                alert("Cannot connect to the server.");

            }

        });

    }

}


// ========================================
// LOGIN
// ========================================

if (document.title.trim() === "Login") {

    const loginForm = document.querySelector("form");

    if (loginForm) {

        loginForm.addEventListener("submit", async function (event) {

            event.preventDefault();

            // Get values
            const username =
                document.getElementById("itxtbox").value.trim();

            const password =
                document.getElementById("ipassbox").value;


            // Check empty fields
            if (
                username === "" ||
                password === ""
            ) {

                alert("Please enter your username and password.");
                return;

            }


            try {

                // Send login data to server
                const response = await fetch("/login", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        username: username,
                        password: password

                    })

                });


                const data = await response.json();


                // Login successful
                if (response.ok) {

                    alert("Login successful!");

                    // Go to Home
                    window.location.href = "home (1).html";

                } else {

                    alert(
                        data.message ||
                        "Invalid username or password."
                    );

                }


            } catch (error) {

                console.error("Login error:", error);

                alert("Cannot connect to the server.");

            }

        });

    }

}


// ========================================
// FORGOT PASSWORD
// ========================================

if (document.title.trim() === "Forgot Password") {

    const forgotForm = document.querySelector("form");

    if (forgotForm) {

        forgotForm.addEventListener("submit", function (event) {

            event.preventDefault();


            const emailInput =
                forgotForm.querySelector('input[type="email"]');

            const email =
                emailInput.value.trim();


            // Check empty email
            if (email === "") {

                alert("Please enter your email.");
                return;

            }


            // Current demo behavior
            alert("Reset link request submitted!");

            console.log("Email:", email);

        });

    }

}


// ========================================
// HOME
// ========================================

// No JavaScript is currently needed for Home.

