import { handleHeadMaster } from "/signIn/headMaster.js";
//import { handleCoach } from "./coach.js";
import { handleAthlete } from "./athlete.js";
// Select the Sign In button
const signInButton = document.getElementById("signInButton");

if (signInButton) {
    // Event listener for Sign In button click
    signInButton.addEventListener("click", () => {
        window.location.href = "/signIn/signIn.html";
    });
}
const signInForm = document.getElementById("signInForm");

if (signInForm) {
    signInForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        const idInput = document.getElementById("personID"); // DÜZELTİLDİ
        const passwordInput = document.getElementById("password");

        if (!idInput || !passwordInput) {
            console.error("Form inputs not found!");
            return;
        }

        const id = idInput.value;
        const password = passwordInput.value;

        try {
            const response = await fetch('/signInStart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, password })
            });

            console.log("Response received:", response);
            const data = await response.json();

            if (response.ok) {
                if (data.role === "head master") {
                    handleHeadMaster();
                } else if (data.role === "coach") {
                    handleCoach();
                } else if (data.role === "athlete") {
                    handleAthlete();
                }
            } else {
                alert(data.error || "An error occurred!");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Failed to sign in. Please try again.");
        }
    });
}