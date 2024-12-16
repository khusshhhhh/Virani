const BASE_URL = "https://api.paramountlandscaping.au";

// Login
document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      credentials: "include", // Include session cookies
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Login failed");
    }

    const data = await response.json();
    alert("Login successful");
    window.location.href = data.redirect; // Redirect to dashboard
  } catch (error) {
    console.error("Error during login:", error);
    document.getElementById("error-message").textContent = error.message;
  }
});

// Logout
async function logout() {
  try {
    await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });
    alert("Logged out successfully");
    window.location.href = "index.html";
  } catch (error) {
    console.error("Error during logout:", error);
  }
}
