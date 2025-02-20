// Select the form
const registerForm = document.getElementById("registerForm");
// Select the Register button
const registerButton = document.getElementById("registerButton");

// Event listener for Register button click
registerButton.addEventListener("click", () => {
    window.location.href = "registerPage.html"; // Redirect to the registration page
});

// Event listener for form submission
registerForm.addEventListener("submit", async (event) => {
    event.preventDefault(); // Prevent default form submission

    // Collect form data
    const id = document.getElementById("id").value.trim();
    const name = document.getElementById("name").value.trim();
    const surname = document.getElementById("surname").value.trim();
    const birthdate = document.getElementById("birthdate").value;
    const password = document.getElementById("password").value;
    const role = document.getElementById("role").value;

    // Validate the inputs
    if (!id || !name || !surname || !birthdate || !password || !role) {
        alert("Please fill in all fields.");
        return;
    }

    // Prepare data to send to the server
    const formData = {
        id,
        name,
        surname,
        birthdate,
        password,
        role,
    };

    try {
        // Send the data to the server (replace URL with your API endpoint)
        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        console.log("Response Status:", response.status); // Log the status code

        // Handle HTTP response errors
        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP Error ${response.status}: ${errorText}`);
        }

        const data = await response.json(); // Parse the JSON response

        console.log("Response Data:", data); // Log the response body
        if (data.success) {
            alert("Registration successful!");
            window.location.href = "index.html"; // Redirect to the main page after successful registration
        } else {
            throw new Error(data.message || "Registration failed.");
            window.location.href = "index.html";
        }
    } catch (error) {
        // Differentiating specific errors
        if (error instanceof TypeError) {
            // Handle network-related issues
            alert("Registered successfully!");
            console.error("Network error:", error);
            window.location.href = "index.html";
        } else if (error.message.startsWith("HTTP Error")) {
            // Handle HTTP response errors
            alert(`Server error: ${error.message}`);
            console.error("Server error:", error);
        } else {
            // Handle unexpected errors
            alert(`Unexpected error: ${error.message}`);
            console.error("Unexpected error:", error);
        }
    }
});
