        // Check if already logged in
        window.onload = function() {
            initTheme();
            const loggedUser = localStorage.getItem('currentUser');
            if (loggedUser) {
                window.location.href = 'feed.html';
            }
        };

        function login() {
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            if (!email || !password) {
                showNotification('Please fill all fields', 'error');
                return;
            }

            let users = JSON.parse(localStorage.getItem('users')) || [];
            const user = users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                showNotification('Invalid email or password', 'error');
                return;
            }

            localStorage.setItem('currentUser', JSON.stringify(user));
            showNotification('Login successful!', 'success');
            setTimeout(() => window.location.href = 'feed.html', 1000);
        }

        function showNotification(message, type) {
            const notification = document.createElement('div');
            notification.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg text-white transform transition-all duration-300 z-50 ${
                type === 'success' ? 'bg-green-500' : 'bg-red-500'
            }`;
            notification.textContent = message;
            document.body.appendChild(notification);
            
            setTimeout(() => notification.remove(), 3000);
        }