async function addUser(name, email, password, role, URL) {
    try {
        const data = { name, email, password, role };
        const res = await fetch(URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
        const result = await res.json();
        console.log(result); 
        return result;
    } catch (error) {
        console.error("Error:", error);
        return { success: false, message: "Request failed" };
    }
}

const form = document.querySelector(".register");
const messageDiv = document.querySelector("#message"); 
form.addEventListener("submit", async (e) => {
    e.preventDefault();
    messageDiv.textContent = "";
    messageDiv.className = ""; 
    const name = form.querySelector("#name").value.trim();
    const email = form.querySelector("#email").value.trim();
    const password = form.querySelector("#password").value.trim();
    const role = form.querySelector("#role").value.trim();
    if (!name || !email || !password || !role) {
        messageDiv.textContent = "Please fill all fields!";
        messageDiv.className = "error";
        return;
    }
    const result = await addUser(
        name,
        email,
        password,
        role,
        "http://localhost:3333/HealRec/signup"
    );
    if (result && result.success === true) {
        messageDiv.textContent = "Account created successfully! Redirecting to login...";
        messageDiv.className = "success"; 
        form.reset();
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1000);
    } else {
        messageDiv.textContent =(result.message || "Something went wrong");
        messageDiv.className = "error"; 
    }
});