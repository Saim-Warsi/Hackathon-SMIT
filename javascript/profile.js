tailwind.config = { darkMode: "class" };

let currentUser = null;

function initTheme() {
  const theme = localStorage.getItem("theme") || "light";
  applyTheme(theme);
}

function applyTheme(theme) {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark", "bg-gray-900");
    document.body.classList.remove(
      "bg-gradient-to-br",
      "from-blue-50",
      "to-purple-50"
    );
    document.getElementById("themeIcon").textContent = "light_mode";
  } else {
    document.documentElement.classList.remove("dark");
    document.body.classList.remove("dark", "bg-gray-900");
    document.body.classList.add(
      "bg-gradient-to-br",
      "from-blue-50",
      "to-purple-50"
    );
    document.getElementById("themeIcon").textContent = "dark_mode";
  }
}

function toggleTheme() {
  const currentTheme = localStorage.getItem("theme") || "light";
  const newTheme = currentTheme === "light" ? "dark" : "light";
  localStorage.setItem("theme", newTheme);
  applyTheme(newTheme);
}

function logout() {
  localStorage.removeItem("currentUser");
  window.location.href = "login.html";
}

window.onload = function () {
  initTheme();
  const loggedUser = localStorage.getItem("currentUser");
  if (!loggedUser) {
    window.location.href = "login.html";
    return;
  }
  currentUser = JSON.parse(loggedUser);
  loadProfile();
};

function loadProfile() {
  // Display user info
  document.getElementById("userName").textContent = currentUser.name;
  document.getElementById("userEmail").textContent = currentUser.email;
  document.getElementById("userInitial").textContent = currentUser.name
    .charAt(0)
    .toUpperCase();

  if (currentUser.joinedDate) {
    const joinDate = new Date(currentUser.joinedDate);
    document.getElementById("joinedDate").textContent =
      "Joined " + joinDate.toLocaleDateString();
  }

  // Calculate stats
  const posts = JSON.parse(localStorage.getItem("posts")) || [];
  const userPosts = posts.filter((p) => p.authorEmail === currentUser.email);

  document.getElementById("postCount").textContent = userPosts.length;

  // Count reactions given
  let reactionsGiven = 0;
  posts.forEach((post) => {
    if (post.reactions) {
      Object.values(post.reactions).forEach((users) => {
        if (users.includes(currentUser.email)) reactionsGiven++;
      });
    }
  });
  document.getElementById("reactionCount").textContent = reactionsGiven;

  // Count reactions received
  let reactionsReceived = 0;
  userPosts.forEach((post) => {
    if (post.reactions) {
      reactionsReceived += Object.values(post.reactions).flat().length;
    }
  });
  document.getElementById("receivedReactions").textContent = reactionsReceived;

  // Display user posts
  renderUserPosts(userPosts);
}

function renderUserPosts(userPosts) {
  const container = document.getElementById("userPosts");
  container.innerHTML = "";

  if (userPosts.length === 0) {
    container.innerHTML =
      '<p class="text-center text-gray-500 dark:text-gray-400 py-8">No posts yet</p>';
    return;
  }

  userPosts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  userPosts.forEach((post) => {
    const postDiv = document.createElement("div");
    postDiv.className =
      "bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700";

    const date = new Date(post.timestamp);
    const formattedDate =
      date.toLocaleDateString() + " " + date.toLocaleTimeString();

    const reactionsCount = post.reactions
      ? Object.values(post.reactions).flat().length
      : 0;

    postDiv.innerHTML = `
                    <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">${formattedDate}${
      post.edited ? " • Edited" : ""
    }</p>
                    <p class="text-gray-800 dark:text-white whitespace-pre-wrap">${
                      post.text
                    }</p>
                    ${
                      post.image
                        ? `<img src="${post.image}" class="w-full rounded-lg mt-3 shadow-md" style="max-height: 400px; object-fit: cover;">`
                        : ""
                    }
                    <p class="text-sm text-gray-600 dark:text-gray-400 mt-3">${reactionsCount} reaction${
      reactionsCount !== 1 ? "s" : ""
    }</p>
                `;

    container.appendChild(postDiv);
  });
}
