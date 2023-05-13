document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("https://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
  	throw new Error("Login failed");
    }

    const data = await response.json();
    console.log("Logged in successfully", data);

    // redirect to home page
    window.location.href = "/home.html";

  } catch (error) {
    console.error("Error:", error);
  }
});
