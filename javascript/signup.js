function signup() {
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim();
  const password = document.getElementById("signupPassword").value.trim();

  if (!name || !email || !password) {
    showNotification("Please fill all fields", "error");
    return;
  }

  if (password.length < 6) {
    showNotification("Password must be at least 6 characters", "error");
    return;
  }

  let users = JSON.parse(localStorage.getItem("users")) || [];
  const userExists = users.find((u) => u.email === email);

  if (userExists) {
    showNotification("User already exists", "error");
    return;
  }

  const newUser = {
    name,
    email,
    password,
    joinedDate: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));

  showNotification("Account created successfully!", "success");
  setTimeout(() => (window.location.href = "login.html"), 1500);
}

function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300 z-50 ${
    type === "success" ? "bg-green-500" : "bg-red-500"
  }`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => notification.remove(), 3000);
}
