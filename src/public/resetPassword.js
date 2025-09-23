const pathSegments = window.location.pathname.split("/");
const token = pathSegments[pathSegments.length - 1];
async function resetPassword(token, password, URL) {
    try {
        const res = await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password }),
        });
        const result = await res.json();
        console.log(result);
        return result;
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "Request failed" };
    }
}
const form = document.querySelector(".reset-form");
const messageDiv = document.querySelector("#message");
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageDiv.textContent = "";
    messageDiv.className = "";
    const password = form.querySelector("#password").value.trim();
    const confirmPassword = form.querySelector("#confirm-password").value.trim();
    if (!password || !confirmPassword) {
        messageDiv.textContent = "Please fill all fields!";
        messageDiv.className = "error";
        return;
    }
    if (password !== confirmPassword) {
        messageDiv.textContent = "Passwords do not match!";
        messageDiv.className = "error";
        return;
    }
    if (!token) {
        messageDiv.textContent = "Invalid or missing token!";
        messageDiv.className = "error";
        return;
    }
    const result = await resetPassword(
        token,
        password,
        `http://localhost:3333/HealRec/reset-password/${token}`
    );
    if (result && result.success) {
        messageDiv.textContent = "✅ Password reset successfully! Redirecting to login...";
        messageDiv.className = "success";
        form.reset();
        setTimeout(() => {
            window.location.href = "login.html";
        }, 2000);
    } else {
        messageDiv.textContent =(result.message || "Unable to reset password");
        messageDiv.className = "error";
    }
});
