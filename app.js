(() => {
  // Initial Data keys
  const STORAGE_KEYS = {
    USERS: 'blog_users',
    POSTS: 'blog_posts',
    CATEGORIES: 'blog_categories',
    COMMENTS: 'blog_comments',
    SESSION: 'blog_session',
    ADMIN: 'blog_admin',
  };

  // Predefined admin account
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'admin123';

  // Cached DOM elements
  const loginSection = document.getElementById('login-section');
  const registerSection = document.getElementById('register-section');
  const postsSection = document.getElementById('posts-section');
  const postDetailSection = document.getElementById('post-detail-section');
  const adminPanelSection = document.getElementById('admin-panel');
  const btnLogin = document.getElementById('btn-login');
  const btnRegister = document.getElementById('btn-register');
  const userInfoDiv = document.getElementById('user-info');
  const currentUsernameSpan = document.getElementById('current-username');
  const btnLogout = document.getElementById('btn-logout');
  const btnAdminPanel = document.getElementById('btn-admin-panel');

  const postListDiv = document.getElementById('post-list');
  const categoryListDiv = document.getElementById('category-list');

  const postDetailArticle = document.getElementById('post-detail');
  const btnBack = document.getElementById('btn-back');
  const commentsListDiv = document.getElementById('comments-list');
  const commentForm = document.getElementById('comment-form');
  const commentAuthorInput = document.getElementById('comment-author');
  const commentTextInput = document.getElementById('comment-text');

  const adminPanelBtnPosts = document.getElementById('admin-view-posts-btn');
  const adminPanelBtnCategories = document.getElementById('admin-view-categories-btn');
  const btnAdminLogout = document.getElementById('btn-admin-logout');

  const adminPostsSection = document.getElementById('admin-posts-section');
  const adminCategoriesSection = document.getElementById('admin-categories-section');

  const adminPostListDiv = document.getElementById('admin-post-list');
  const btnNewPost = document.getElementById('btn-new-post');
  const adminPostFormSection = document.getElementById('admin-post-form-section');
  const adminPostForm = document.getElementById('admin-post-form');
  const postFormTitle = document.getElementById('post-form-title');
  const postTitleInput = document.getElementById('post-title');
  const postCategorySelect = document.getElementById('post-category-select');
  const postContentInput = document.getElementById('post-content');
  const btnCancelPost = document.getElementById('btn-cancel-post');

  const adminCategoryForm = document.getElementById('admin-category-form');
  const newCategoryNameInput = document.getElementById('new-category-name');
  const adminCategoryListDiv = document.getElementById('admin-category-list');

  // Login and Register forms and messages
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  const showRegisterLink = document.getElementById('show-register');
  const showLoginLink = document.getElementById('show-login');
  const loginErrorMsg = document.getElementById('login-error-msg');
  const registerErrorMsg = document.getElementById('register-error-msg');

  // Message banner
  const messageBanner = document.getElementById('message-banner');

  // Current logged in user info
  let currentUser = null;
  let isAdminLoggedIn = false;

  // Current filter category (null = all)
  let currentCategoryFilter = null;

  // Currently viewed post id
  let currentPostId = null;

  // Admin form editing post id
  let adminEditingPostId = null;

  // Utility Functions
  function saveToStorage(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
  }
  function loadFromStorage(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  function showMessage(msg, duration = 3000) {
    messageBanner.textContent = msg;
    messageBanner.style.display = 'block';
    setTimeout(() => {
      messageBanner.style.display = 'none';
    }, duration);
  }

  // Initialize default admin user if not present
  function initAdminUser() {
    let adminExists = false;
    const users = loadFromStorage(STORAGE_KEYS.USERS) || [];
    for (const user of users) {
      if (user.username === ADMIN_USERNAME) {
        adminExists = true;
        break;
      }
    }
    if (!adminExists) {
      users.push({ username: ADMIN_USERNAME, password: ADMIN_PASSWORD, isAdmin: true });
      saveToStorage(STORAGE_KEYS.USERS, users);
    }
  }

  // User Authentication Functions
  function loginUser(username, password) {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      currentUser = { username: ADMIN_USERNAME, isAdmin: true };
      isAdminLoggedIn = true;
      saveToStorage(STORAGE_KEYS.SESSION, currentUser);
      return true;
    }
    const users = loadFromStorage(STORAGE_KEYS.USERS) || [];
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      currentUser = { username: user.username, isAdmin: user.isAdmin || false };
      isAdminLoggedIn = user.isAdmin || false;
      saveToStorage(STORAGE_KEYS.SESSION, currentUser);
      return true;
    }
    return false;
  }

  function logoutUser() {
    currentUser = null;
    isAdminLoggedIn = false;
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  function registerUser(username, password) {
    if (username === ADMIN_USERNAME) {
      registerErrorMsg.textContent = 'Username is reserved.';
      return false;
    }
    let users = loadFromStorage(STORAGE_KEYS.USERS) || [];
    if (users.some(u => u.username === username)) {
      registerErrorMsg.textContent = 'Username already taken.';
      return false;
    }
    users.push({ username, password, isAdmin: false });
    saveToStorage(STORAGE_KEYS.USERS, users);
    registerErrorMsg.textContent = '';
    return true;
  }

  // Session Load on start
  function loadSession() {
    const session = loadFromStorage(STORAGE_KEYS.SESSION);
    if (session && session.username) {
      currentUser = session;
      isAdminLoggedIn = session.isAdmin || false;
    } else {
      currentUser = null;
      isAdminLoggedIn = false;
    }
  }

  // Categories functions
  function getCategories() {
    let categories = loadFromStorage(STORAGE_KEYS.CATEGORIES);
    if (!categories || categories.length === 0) {
      categories = ['General', 'Technology', 'Lifestyle', 'Education', 'News'];
      saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    }
    return categories;
  }

  function addCategory(name) {
    let categories = getCategories();
    const normalized = name.trim();
    if (!normalized || categories.includes(normalized)) {
      return false;
    }
    categories.push(normalized);
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);
    return true;
  }

  function removeCategory(name) {
    let categories = getCategories();
    categories = categories.filter(cat => cat !== name);
    saveToStorage(STORAGE_KEYS.CATEGORIES, categories);

    // Remove category from posts
    let posts = getPosts();
    posts = posts.map(p => {
      if (p.category === name) {
        p.category = 'General'; // fallback to General
      }
      return p;
    });
    saveToStorage(STORAGE_KEYS.POSTS, posts);
  }

  // Posts functions
  function getPosts() {
    return loadFromStorage(STORAGE_KEYS.POSTS) || [];
  }

  function savePosts(posts) {
    saveToStorage(STORAGE_KEYS.POSTS, posts);
  }

  function createPost(title, category, content) {
    const posts = getPosts();
    const newPost = {
      id: Date.now().toString(),
      title,
      category,
      content,
      createdAt: new Date().toISOString(),
    };
    posts.push(newPost);
    savePosts(posts);
    return newPost;
  }

  function updatePost(id, title, category, content) {
    const posts = getPosts();
    const index = posts.findIndex(p => p.id === id);
    if (index === -1) return false;
    posts[index].title = title;
    posts[index].category = category;
    posts[index].content = content;
    savePosts(posts);
    return true;
  }

  function deletePost(id) {
    let posts = getPosts();
    posts = posts.filter(p => p.id !== id);
    savePosts(posts);
    // Also delete comments for post
    let comments = getComments();
    comments = comments.filter(c => c.postId !== id);
    saveToStorage(STORAGE_KEYS.COMMENTS, comments);
  }

  function findPostById(id) {
    const posts = getPosts();
    return posts.find(p => p.id === id);
  }

  // Comments functions
  function getComments() {
    return loadFromStorage(STORAGE_KEYS.COMMENTS) || [];
  }

  function saveComments(comments) {
    saveToStorage(STORAGE_KEYS.COMMENTS, comments);
  }

  function addComment(postId, author, text) {
    const comments = getComments();
    const newComment = {
      id: Date.now().toString(),
      postId,
      author,
      text,
      createdAt: new Date().toISOString(),
    };
    comments.push(newComment);
    saveComments(comments);
    return newComment;
  }

  function getCommentsForPost(postId) {
    return getComments().filter(c => c.postId === postId);
  }

  // Rendering Functions
  function renderCategories() {
    const categories = getCategories();
    categoryListDiv.innerHTML = '';

    // Add "All" category filter
    const allBtn = document.createElement('button');
    allBtn.textContent = 'All';
    allBtn.classList.toggle('active', currentCategoryFilter === null);
    allBtn.onclick = () => {
      currentCategoryFilter = null;
      renderCategories();
      renderPosts();
    };
    categoryListDiv.appendChild(allBtn);

    categories.forEach(cat => {
      const btn = document.createElement('button');
      btn.textContent = cat;
      btn.classList.toggle('active', currentCategoryFilter === cat);
      btn.onclick = () => {
        currentCategoryFilter = cat;
        renderCategories();
        renderPosts();
      };
      categoryListDiv.appendChild(btn);
    });
  }

  function renderPosts() {
    const posts = getPosts();
    postListDiv.innerHTML = '';
    const filteredPosts = currentCategoryFilter ? posts.filter(p => p.category === currentCategoryFilter) : posts;
    if (filteredPosts.length === 0) {
      postListDiv.textContent = 'No articles to display in this category.';
      return;
    }

    filteredPosts.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));

    filteredPosts.forEach(post => {
      const card = document.createElement('div');
      card.className = 'post-card';
      card.tabIndex = 0;
      card.setAttribute('role', 'button');
      card.setAttribute('aria-pressed', 'false');
      card.setAttribute('aria-label', `Read article ${post.title}`);
      card.onclick = () => openPostDetail(post.id);
      card.onkeypress = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPostDetail(post.id); } };

      const title = document.createElement('h3');
      title.textContent = post.title;
      const meta = document.createElement('div');
      meta.className = 'meta';
      const dateStr = new Date(post.createdAt).toLocaleDateString();
      meta.textContent = `${post.category} - ${dateStr}`;
      const excerpt = document.createElement('div');
      excerpt.className = 'excerpt';
      excerpt.textContent = post.content.length > 150 ? post.content.substring(0, 150) + '...' : post.content;

      card.appendChild(title);
      card.appendChild(meta);
      card.appendChild(excerpt);

      postListDiv.appendChild(card);
    });
  }

  function openPostDetail(postId) {
    currentPostId = postId;
    const post = findPostById(postId);
    if (!post) return;
    loginSection.style.display = 'none';
    registerSection.style.display = 'none';
    postsSection.style.display = 'none';
    postDetailSection.style.display = 'block';
    adminPanelSection.style.display = 'none';

    postDetailArticle.innerHTML = '';
    const h2 = document.createElement('h2');
    h2.textContent = post.title;
    const meta = document.createElement('div');
    meta.className = 'meta';
    meta.textContent = `${post.category} - ${new Date(post.createdAt).toLocaleDateString()}`;
    const contentDiv = document.createElement('div');
    contentDiv.className = 'content';
    contentDiv.textContent = post.content;

    postDetailArticle.appendChild(h2);
    postDetailArticle.appendChild(meta);
    postDetailArticle.appendChild(contentDiv);

    renderComments();
    // Clear comment form author if user logged in
    if (currentUser) {
      commentAuthorInput.value = currentUser.username;
      commentAuthorInput.disabled = true;
    } else {
      commentAuthorInput.value = '';
      commentAuthorInput.disabled = false;
    }
    commentTextInput.value = '';
  }

  function renderComments() {
    const comments = getCommentsForPost(currentPostId);
    commentsListDiv.innerHTML = '';
    if (comments.length === 0) {
      commentsListDiv.textContent = 'No comments yet. Be the first to comment!';
      return;
    }
    comments.sort((a,b) => new Date(a.createdAt) - new Date(b.createdAt));
    comments.forEach(c => {
      const div = document.createElement('div');
      div.className = 'comment';
      const author = document.createElement('div');
      author.className = 'author';
      author.textContent = c.author;
      const date = document.createElement('div');
      date.className = 'date';
      date.textContent = new Date(c.createdAt).toLocaleString();
      const text = document.createElement('div');
      text.className = 'text';
      text.textContent = c.text;

      div.appendChild(author);
      div.appendChild(date);
      div.appendChild(text);
      commentsListDiv.appendChild(div);
    });
  }

  // Authentication UI Handlers
  function showLogin() {
    loginSection.style.display = 'block';
    registerSection.style.display = 'none';
    postsSection.style.display = 'none';
    postDetailSection.style.display = 'none';
    adminPanelSection.style.display = 'none';
    loginErrorMsg.textContent = '';
    registerErrorMsg.textContent = '';
    userInfoDiv.style.display = 'none';
    btnLogin.style.display = 'none';
    btnRegister.style.display = 'none';
  }

  function showRegister() {
    loginSection.style.display = 'none';
    registerSection.style.display = 'block';
    postsSection.style.display = 'none';
    postDetailSection.style.display = 'none';
    adminPanelSection.style.display = 'none';
    loginErrorMsg.textContent = '';
    registerErrorMsg.textContent = '';
    userInfoDiv.style.display = 'none';
    btnLogin.style.display = 'none';
    btnRegister.style.display = 'none';
  }

  function showPosts() {
    loginSection.style.display = 'none';
    registerSection.style.display = 'none';
    postsSection.style.display = 'block';
    postDetailSection.style.display = 'none';
    adminPanelSection.style.display = 'none';
    userInfoDiv.style.display = 'block';
    btnLogin.style.display = 'none';
    btnRegister.style.display = 'none';
    currentUsernameSpan.textContent = currentUser.username;
    btnAdminPanel.style.display = isAdminLoggedIn ? 'block' : 'none';
    renderCategories();
    renderPosts();
  }

  function showLoggedOut() {
    loginSection.style.display = 'none';
    registerSection.style.display = 'none';
    postsSection.style.display = 'block';
    postDetailSection.style.display = 'none';
    adminPanelSection.style.display = 'none';
    userInfoDiv.style.display = 'none';
    btnLogin.style.display = 'inline-block';
    btnRegister.style.display = 'inline-block';
    currentUsernameSpan.textContent = '';
    btnAdminPanel.style.display = 'none';
    renderCategories();
    renderPosts();
  }

  // Event handlers setup
  btnLogin.addEventListener('click', showLogin);
  btnRegister.addEventListener('click', showRegister);

  showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    showRegister();
  });
  showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    showLogin();
  });

  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value.trim();
    if (loginUser(username, password)) {
      showPosts();
      showMessage(`Welcome back, ${username}!`);
    } else {
      loginErrorMsg.textContent = 'Invalid username or password.';
    }
    loginForm.reset();
  });

  registerForm.addEventListener('submit', e => {
    e.preventDefault();
    const username = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value.trim();
    if (registerUser(username, password)) {
      showMessage('Registration successful! Please login.');
      showLogin();
    }
    registerForm.reset();
  });

  btnLogout.addEventListener('click', () => {
    logoutUser();
    showLoggedOut();
    showMessage('Logged out successfully.');
  });

  btnBack.addEventListener('click', () => {
    currentPostId = null;
    showPosts();
  });

  commentForm.addEventListener('submit', e => {
    e.preventDefault();
    if (!currentUser) {
      alert('You must be logged in to comment.');
      showLogin();
      return;
    }
    const author = commentAuthorInput.value.trim();
    const text = commentTextInput.value.trim();
    if (author && text) {
      addComment(currentPostId, author, text);
      renderComments();
      commentTextInput.value = '';
      showMessage('Comment added!');
    }
  });

  btnAdminPanel.addEventListener('click', () => {
    // Show admin panel and hide others
    loginSection.style.display = 'none';
    registerSection.style.display = 'none';
    postsSection.style.display = 'none';
    postDetailSection.style.display = 'none';
    adminPanelSection.style.display = 'block';
    userInfoDiv.style.display = 'block';
    btnAdminPanel.style.display = 'block';
    renderAdminPanelPosts();
    renderAdminPanelCategories();
    showAdminPostsSection();
  });

  btnAdminLogout.addEventListener('click', () => {
    logoutUser();
    showLoggedOut();
    showMessage('Admin logged out successfully.');
  });

  // Admin Posts Section
  btnNewPost.addEventListener('click', () => {
    adminEditingPostId = null;
    postFormTitle.textContent = 'New Post';
    postTitleInput.value = '';
    postCategorySelect.innerHTML = '';
    getCategories().forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat;
      opt.textContent = cat;
      postCategorySelect.appendChild(opt);
    });
    postContentInput.value = '';
    adminPostFormSection.style.display = 'block';
  });

  adminPostForm.addEventListener('submit', e => {
    e.preventDefault();
    const title = postTitleInput.value.trim();
    const category = postCategorySelect.value;
    const content = postContentInput.value.trim();
    if (!title || !category || !content) {
      alert('All fields are required.');
      return;
    }
    if (adminEditingPostId) {
      updatePost(adminEditingPostId, title, category, content);
      showMessage('Post updated successfully.');
    } else {
      createPost(title, category, content);
      showMessage('Post created successfully.');
    }
    adminPostFormSection.style.display = 'none';
    renderAdminPanelPosts();
    renderPosts();
  });

  btnCancelPost.addEventListener('click', () => {
    adminPostFormSection.style.display = 'none';
  });

  // Admin Category form
  adminCategoryForm.addEventListener('submit', e => {
    e.preventDefault();
    const newCatName = newCategoryNameInput.value.trim();
    if (!newCatName) return;
    const added = addCategory(newCatName);
    if (!added) {
      alert('Category already exists or invalid name.');
      return;
    }
    newCategoryNameInput.value = '';
    renderAdminPanelCategories();
    renderCategories();
    renderPosts();
    showMessage('Category added successfully.');
  });

  // Admin panel views toggles
  function showAdminPostsSection() {
    adminPostsSection.style.display = 'block';
    adminCategoriesSection.style.display = 'none';
  }
  function showAdminCategoriesSection() {
    adminPostsSection.style.display = 'none';
    adminCategoriesSection.style.display = 'block';
  }

  adminPanelBtnPosts.addEventListener('click', () => {
    showAdminPostsSection();
  });
  adminPanelBtnCategories.addEventListener('click', () => {
    showAdminCategoriesSection();
  });

  // Render Admin Posts List
  function renderAdminPanelPosts() {
    const posts = getPosts();
    adminPostListDiv.innerHTML = '';
    if (posts.length === 0) {
      adminPostListDiv.textContent = 'No posts yet.';
      return;
    }
    posts.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt));
    posts.forEach(post => {
      const div = document.createElement('div');
      div.style.borderBottom = '1px solid #ddd';
      div.style.padding = '8px 0';
      const titleSpan = document.createElement('span');
      titleSpan.textContent = post.title + ' (' + post.category + ')';
      titleSpan.style.fontWeight = '600';
      div.appendChild(titleSpan);

      const btnEdit = document.createElement('button');
      btnEdit.textContent = 'Edit';
      btnEdit.className = 'small-btn';
      btnEdit.style.marginLeft = '15px';
      btnEdit.onclick = () => {
        adminEditingPostId = post.id;
        postFormTitle.textContent = 'Edit Post';
        postTitleInput.value = post.title;
        postCategorySelect.innerHTML = '';
        getCategories().forEach(cat => {
          const opt = document.createElement('option');
          opt.value = cat;
          opt.textContent = cat;
          if (cat === post.category) opt.selected = true;
          postCategorySelect.appendChild(opt);
        });
        postContentInput.value = post.content;
        adminPostFormSection.style.display = 'block';
      };
      div.appendChild(btnEdit);

      const btnDelete = document.createElement('button');
      btnDelete.textContent = 'Delete';
      btnDelete.className = 'small-btn danger';
      btnDelete.onclick = () => {
        if (confirm('Are you sure you want to delete this post?')) {
          deletePost(post.id);
          renderAdminPanelPosts();
          renderPosts();
          showMessage('Post deleted.');
          if (currentPostId === post.id) {
            currentPostId = null;
            showPosts();
          }
        }
      };
      div.appendChild(btnDelete);

      adminPostListDiv.appendChild(div);
    });
  }

  // Render Admin Categories
  function renderAdminPanelCategories() {
    const categories = getCategories();
    adminCategoryListDiv.innerHTML = '';
    if (categories.length === 0) {
      adminCategoryListDiv.textContent = 'No categories found.';
      return;
    }
    categories.forEach(cat => {
      const div = document.createElement('div');
      div.style.display = 'flex';
      div.style.justifyContent = 'space-between';
      div.style.alignItems = 'center';
      div.style.padding = '4px 0';

      const span = document.createElement('span');
      span.textContent = cat;
      div.appendChild(span);

      // Don't allow removing 'General' category
      if (cat !== 'General') {
        const btnDel = document.createElement('button');
        btnDel.textContent = 'Remove';
        btnDel.className = 'small-btn danger';
        btnDel.onclick = () => {
          if (confirm('Are you sure you want to remove category "' + cat + '"? All posts in this category will move to "General".')) {
    removeCategory(cat);
    renderAdminPanelCategories();
    renderCategories();
    renderPosts();
    showMessage('Category removed.');
}

        };
        div.appendChild(btnDel);
      } else {
        const info = document.createElement('em');
        info.style.color = '#666';
        info.style.fontSize = '0.85rem';
        info.textContent = ' (default)';
        span.appendChild(info);
      }
      adminCategoryListDiv.appendChild(div);
    });
  }

  // Initial App Setup
  function init() {
    initAdminUser();
    loadSession();
    if (currentUser) {
      showPosts();
    } else {
      showLoggedOut();
    }
  }

  init();

})();

