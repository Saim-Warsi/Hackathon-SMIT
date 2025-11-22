   tailwind.config = {
        darkMode: "class",
      };

      let currentUser = null;
      let posts = JSON.parse(localStorage.getItem("posts")) || [];
      let currentSort = "latest";
      let selectedImage = null;
      let editingPostId = null;
      let reactingPostId = null;

      // Theme Management
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
          document.documentElement.classList.remove("dark"); // ← YOU'RE MISSING THIS
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

      // Initialize
      window.onload = function () {
// Then reload the page
        initTheme();
        const loggedUser = localStorage.getItem("currentUser");
        if (!loggedUser) {
          window.location.href = "login.html";
          return;
        }
        currentUser = JSON.parse(loggedUser);
        // document.getElementById("userName").textContent =
        //   "Hi, " + currentUser.name;
        renderPosts();
      };

      function logout() {
        localStorage.removeItem("currentUser");
        showNotification("Logged out successfully", "success");
        setTimeout(() => (window.location.href = "login.html"), 1000);
      }

      // Image Handling
      function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
          showNotification("Please select an image file", "error");
          return;
        }

       

        const reader = new FileReader();
        reader.onload = function (e) {
          selectedImage = e.target.result;
          document.getElementById("imagePreview").src = selectedImage;
          document.getElementById("imagePreview").classList.remove("hidden");
          document.getElementById("imageName").textContent = file.name;
        };
        reader.readAsDataURL(file);
      }

      function handleImageUrl() {
        const url = document.getElementById("imageUrlInput").value.trim();
        if (!url) return;

        selectedImage = url;
        document.getElementById("imagePreview").src = url;
        document.getElementById("imagePreview").classList.remove("hidden");
        document.getElementById("imageName").textContent = "Image from URL";
        document.getElementById("imageUrlInput").value = "";
      }

      // Post Management
      function createPost() {
        const text = document.getElementById("postText").value.trim();

        if (!text) {
          showNotification("Please write something", "error");
          return;
        }

        const post = {
          id: Date.now(),
          author: currentUser.name,
          authorEmail: currentUser.email,
          text: text,
          image: selectedImage,
          reactions: {},
          timestamp: new Date().toISOString(),
           comments: []
        };

        posts.unshift(post);
        localStorage.setItem("posts", JSON.stringify(posts));

        document.getElementById("postText").value = "";
        document.getElementById("imagePreview").classList.add("hidden");
        document.getElementById("imageName").textContent = "";
        document.getElementById("imageUpload").value = "";
        selectedImage = null;

        showNotification("Post created!", "success");
        renderPosts();
      }

      function openEditModal(id) {
        const post = posts.find((p) => p.id === id);
        if (!post) return;

        editingPostId = id;
        document.getElementById("editPostText").value = post.text;
        document.getElementById("editModal").classList.remove("hidden");
      }

      function closeEditModal() {
        editingPostId = null;
        document.getElementById("editModal").classList.add("hidden");
      }

      function saveEdit() {
        const newText = document.getElementById("editPostText").value.trim();
        if (!newText) {
          showNotification("Post cannot be empty", "error");
          return;
        }

        const post = posts.find((p) => p.id === editingPostId);
        if (post) {
          post.text = newText;
          post.edited = true;
          localStorage.setItem("posts", JSON.stringify(posts));
          showNotification("Post updated!", "success");
          renderPosts();
        }
        closeEditModal();
      }

      function deletePost(id) {
        if (confirm("Delete this post?")) {
          posts = posts.filter((p) => p.id !== id);
          localStorage.setItem("posts", JSON.stringify(posts));
          showNotification("Post deleted", "success");
          renderPosts();
        }
      }

      // Reactions
      function openReactionModal(id) {
        reactingPostId = id;
        document.getElementById("reactionModal").classList.remove("hidden");
      }

      function closeReactionModal() {
        reactingPostId = null;
        document.getElementById("reactionModal").classList.add("hidden");
      }

      function addReaction(emoji) {
        const post = posts.find((p) => p.id === reactingPostId);
        if (!post) return;

        if (!post.reactions) post.reactions = {};

        const userReaction = Object.keys(post.reactions).find((reaction) =>
          post.reactions[reaction].includes(currentUser.email)
        );

        if (userReaction) {
          post.reactions[userReaction] = post.reactions[userReaction].filter(
            (email) => email !== currentUser.email
          );
          if (post.reactions[userReaction].length === 0) {
            delete post.reactions[userReaction];
          }
        }

        if (!post.reactions[emoji]) {
          post.reactions[emoji] = [];
        }
        post.reactions[emoji].push(currentUser.email);

        localStorage.setItem("posts", JSON.stringify(posts));
        // localStorage.removeItem("posts", JSON.stringify(posts));
        renderPosts();
        closeReactionModal();
      }

      // Search & Sort
      function searchPosts() {
        renderPosts();
      }

      function sortPosts(type) {
        currentSort = type;
        renderPosts();
      }

      // Render
      function renderPosts() {
        const searchTerm = document
          .getElementById("searchInput")
          .value.toLowerCase();
        let filteredPosts = posts.filter(
          (p) =>
            p.text.toLowerCase().includes(searchTerm) ||
            p.author.toLowerCase().includes(searchTerm)
        );

        if (currentSort === "latest") {
          filteredPosts.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
          );
        } else if (currentSort === "oldest") {
          filteredPosts.sort(
            (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
          );
        } else if (currentSort === "likes") {
          filteredPosts.sort((a, b) => {
            const aCount = Object.values(a.reactions || {}).flat().length;
            const bCount = Object.values(b.reactions || {}).flat().length;
            return bCount - aCount;
          });
        }

        const container = document.getElementById("postsContainer");
        container.innerHTML = "";

        filteredPosts.forEach((post) => {
          const postDiv = document.createElement("div");
          postDiv.className =
            "bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transform hover:scale-[1.01] transition";

          const date = new Date(post.timestamp);
          const formattedDate =
            date.toLocaleDateString() + " " + date.toLocaleTimeString();


const reactionsHtml = post.reactions
  ? Object.keys(post.reactions)
      .map(
        (emoji) => `
          <span class="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-sm">
            <span class="material-symbols-outlined text-[16px] text-gray-800 dark:text-white">${emoji}</span>
            <span class="text-gray-600 dark:text-gray-400">${post.reactions[emoji].length}</span>
          </span>
        `
      )
      .join("")
  : "";


          postDiv.innerHTML = `
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <p class="font-bold text-gray-800 dark:text-white">${
                              post.author
                            }</p>
                            <p class="text-xs text-gray-500 dark:text-gray-400">${formattedDate}${
            post.edited ? " • Edited" : ""
          }</p>
                        </div>
                        ${
                          post.authorEmail === currentUser.email
                            ? `<div class="flex gap-2">
                                <button onclick="openEditModal(${post.id})" class="text-blue-500 hover:text-blue-600 text-sm font-semibold"><span class="material-symbols-outlined">
edit
</span></button>
                                <button onclick="deletePost(${post.id})" class="text-red-500 hover:text-red-600 text-sm font-semibold">
                                    <span class="material-symbols-outlined">
delete
</span></button>
                            </div>`
                            : ""
                        }
                    </div>
                    <p class="mb-3 text-gray-800 dark:text-white whitespace-pre-wrap">${
                      post.text
                    }</p>
                    ${
                      post.image
                        ? `<img src="${post.image}" class="w-full rounded-lg mb-3 shadow-md" style="max-height: 500px; object-fit: cover;" onerror="this.style.display='none'">`
                        : ""
                    }
                    <div class="flex items-center gap-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                     <button
  onclick="openReactionModal(${post.id})"
  class="flex items-center justify-center p-2 rounded-full 
         hover:bg-gray-100 dark:hover:bg-gray-700 
         transition cursor-pointer"
>
  <span class="material-symbols-outlined text-gray-600 dark:text-gray-300 text-[22px]">
    add_reaction
  </span>
</button>

                        <div class="flex gap-2 flex-wrap">
                            <span class="material-symbols-outlined">

                             ${reactionsHtml}
</span>
                        </div>
                    </div>
                <!-- Comments Section - ADD THIS -->
    <div class="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
        <h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Comments</h4>
        
        <!-- Comment Input -->
        <div class="flex gap-2 mb-3">
            <input 
                type="text" 
                id="commentInput-${post.id}" 
                placeholder="Write a comment..." 
                class="flex-1 px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white outline-none"
            />
            <button 
                onclick="addComment(${post.id})" 
                class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition">
                Post
            </button>
        </div>
        
        <!-- Comments List -->
        <div id="comments-${post.id}" class="space-y-2">
            ${post.comments ? post.comments.map(comment => `
                <div class="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg">
                    <div class="flex justify-between items-start">
                        <p class="text-sm font-semibold text-gray-800 dark:text-white">${comment.author}</p>
                        ${comment.authorEmail === currentUser.email ? 
                            `<button onclick="deleteComment(${post.id}, ${comment.id})" class="text-red-500 hover:text-red-600">
                                <span class="material-symbols-outlined text-[18px]">delete</span>
                            </button>` 
                            : ''}
                    </div>
                    <p class="text-sm text-gray-700 dark:text-gray-300 mt-1">${comment.text}</p>
                    <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">${new Date(comment.timestamp).toLocaleString()}</p>
                </div>
            `).join('') : '<p class="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>'}
        </div>
    </div>
                
                    `;

          container.appendChild(postDiv);
        });

        if (filteredPosts.length === 0) {
          container.innerHTML =
            '<div class="text-center text-gray-500 dark:text-gray-400 py-8">No posts found</div>';
        }
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
      // Comment Management
function addComment(postId) {
    const commentInput = document.getElementById(`commentInput-${postId}`);
    const text = commentInput.value.trim();
    
    if (!text) {
        showNotification('Please write a comment', 'error');
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    if (!post.comments) {
        post.comments = [];
    }
    
    const comment = {
        id: Date.now(),
        author: currentUser.name,
        authorEmail: currentUser.email,
        text: text,
        timestamp: new Date().toISOString()
    };
    
    post.comments.push(comment);
    localStorage.setItem('posts', JSON.stringify(posts));
    
    commentInput.value = '';
    showNotification('Comment added!', 'success');
    renderPosts();
}

function deleteComment(postId, commentId) {
    if (confirm('Delete this comment?')) {
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        
        post.comments = post.comments.filter(c => c.id !== commentId);
        localStorage.setItem('posts', JSON.stringify(posts));
        
        showNotification('Comment deleted', 'success');
        renderPosts();
    }
}