export function handleHeadMaster() {
    console.log("Head Master signed in");

    // Hide the sign-in form
    const signInForm = document.getElementById("signInForm");
    if (signInForm) {
        signInForm.style.display = "none";
    }

    // Select the container div and add content
    const container = document.getElementById("container");
    if (container) {
        container.innerHTML = `
            <h2>Welcome, Head Master!</h2>
           
           <p></p>
        `;
    } else {
        console.error("Container div not found!");
    }


}
