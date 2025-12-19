// ====== ELEMENTS ======
const loginForm = document.getElementById("loginForm");
const loginBtn = document.querySelector(".login-btn");
const roleInput = document.getElementById("loginRole");
const rBtn = document.getElementById("roleRestaurant");
const aBtn = document.getElementById("roleAdmin");

// ====== ROLE SWITCH ======
rBtn.onclick = () => {
    roleInput.value = "owner";
    rBtn.classList.add("active");
    aBtn.classList.remove("active");
};

aBtn.onclick = () => {
    roleInput.value = "admin";
    aBtn.classList.add("active");
    rBtn.classList.remove("active");
};

// ====== LOGIN SUBMIT ======
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();
    const role = roleInput.value;

    if (!email || !password) {
        showError("Email and password are required");
        return;
    }

    setLoading(true, loginBtn);

    try {
        let data;
        let success = false;

        // Backend Login
        try {
            const res = await fetch("/api/v1/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password, role })
            });
            data = await res.json();
            success = res.ok && data.success;
        } catch (fetchError) {
            console.error(fetchError);
            throw new Error("Could not connect to backend server");
        }

        if (!success) throw new Error(data?.message || "Login failed");

        // Save User Session (Critical for Data Isolation)
        if (data.user && data.token) {
            localStorage.setItem('user', JSON.stringify(data.user));
            localStorage.setItem('token', data.token);
        }

        // REDIRECT STRATEGY
        window.parent.postMessage({ type: 'LOGIN_SUCCESS', redirect: data.redirect }, '*');
        if (window.top === window.self) {
            window.location.href = "../testing-page/dashboard.html";
        }

    } catch (err) {
        showError(err.message);
    } finally {
        setLoading(false, loginBtn, "Sign in");
    }
});

// ====== SIGNUP LOGIC ======
const signupForm = document.getElementById("signupForm");
const showSignup = document.getElementById("showSignup");
const showLogin = document.getElementById("showLogin");
const loginContainer = document.getElementById("login-container");
const signupContainer = document.getElementById("signup-container");
const signupBtn = signupForm.querySelector("button");

// Toggle Forms
const roleButtons = document.querySelector(".role-buttons");

showSignup.onclick = (e) => {
    e.preventDefault();
    loginContainer.style.display = "none";
    signupContainer.style.display = "block";
    // Hide Role Switcher for Signup
    if (roleButtons) roleButtons.style.display = "none";

    // Default to restaurant role for signup? Or keep what was selected?
    roleInput.value = 'owner';
    rBtn.click(); // visually select restaurant
};

showLogin.onclick = (e) => {
    e.preventDefault();
    signupContainer.style.display = "none";
    loginContainer.style.display = "block";
    // Show Role Switcher for Login
    if (roleButtons) roleButtons.style.display = "flex";
};

// Signup Submit
signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value.trim();

    // Simple validation
    if (password.length < 6) return showError("Password must be at least 6 characters");

    setLoading(true, signupBtn, "Submitting...");

    try {
        const res = await fetch("/api/v1/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name, email, password, role: 'owner' })
        });
        const data = await res.json();

        if (data.success) {
            showNotification(data.message, "success");
            signupForm.reset();
            setTimeout(() => showLogin.click(), 2000);
        } else {
            throw new Error(data.message || "Registration failed");
        }
    } catch (err) {
        showError(err.message);
    } finally {
        setLoading(false, signupBtn, "Submit Request");
    }
});

// ====== UI HELPERS ======
function setLoading(isLoading, btn, text) {
    if (isLoading) {
        btn.disabled = true;
        btn.textContent = text || "Processing...";
    } else {
        btn.disabled = false;
        btn.textContent = text || "Submit";
    }
}

function showError(message) {
    showNotification(message, "error");
}

function showNotification(message, type = "info") {
    const toast = document.createElement('div');
    const bgColor = type === "error" ? "#ff4444" : "#C9A24D";
    toast.style = `position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:${bgColor}; color:white; padding:12px 24px; border-radius:12px; z-index:10000; font-family:Inter, sans-serif; font-size:14px; font-weight:600; box-shadow:0 10px 40px rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.2); transition: all 0.5s ease; opacity:0;`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.opacity = "1";
        toast.style.bottom = "40px";
    }, 10);

    // Animate out
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 500);
    }, 3500);
}

// ====== VANTA (UI ONLY) ======
VANTA.BIRDS({
    el: "#vanta-birds",
    backgroundAlpha: 0.2,
    color1: 0xC9A24D,
    color2: 0xE6C27A,
    birdSize: 1.0,
    wingSpan: 4.0,
    speedLimit: 5.8,
    separation: 20.0,
    quantity: 2.0
});

// ====== CONTACT MODAL ======
const contactModal = document.getElementById("contactModal");
const contactBtn = document.getElementById("contactSupportBtn");
const closeContactBtn = document.getElementById("closeContactModal");

if (contactBtn && contactModal) {
    contactBtn.addEventListener("click", (e) => {
        e.preventDefault();
        contactModal.classList.add("active");
    });
}

if (closeContactBtn && contactModal) {
    closeContactBtn.addEventListener("click", () => {
        contactModal.classList.remove("active");
    });
}

// Close on outside click
if (contactModal) {
    contactModal.addEventListener("click", (e) => {
        if (e.target === contactModal) {
            contactModal.classList.remove("active");
        }
    });
}
