const form = document.querySelector(".forgot-form");
const messageDiv = document.querySelector("#message");

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageDiv.textContent = "";
    messageDiv.className = "";

    const email = form.querySelector("#email").value.trim();
    if (!email) {
        messageDiv.textContent = "Please enter your email!";
        messageDiv.className = "error";
        return;
    }

    try {
        const res = await fetch("http://localhost:3333/HealRec/forget-password", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });
        const text = await res.text();
        let result;
        try {
            result = JSON.parse(text);
        } catch {
            throw new Error("Invalid response from server: " + text);
        }

        if (result.success) {
            messageDiv.textContent = "Password reset link sent to your email!";
            messageDiv.className = "success";
            form.reset();
        } else {
            messageDiv.textContent =(result.message || "Something went wrong");
            messageDiv.className = "error";
        }

    } catch (error) {
        console.error("Error:", error);
        messageDiv.textContent = "Request failed. Please try again later.";
        messageDiv.className = "error";
    }
});