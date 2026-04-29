function switchTab(tab, el) {
  document.querySelectorAll('.auth-form').forEach(function(f) {
    f.classList.remove('active');
  });
  document.querySelectorAll('.auth-tab').forEach(function(t) {
    t.classList.remove('active');
  });
  document.getElementById(tab).classList.add('active');
  el.classList.add('active');
}

function handleLogin() {
  var email    = document.getElementById('login-email').value.trim();
  var password = document.getElementById('login-password').value.trim();
  var errorEl  = document.getElementById('login-error');

// ── LOGOUT ──
function logout() {
  try {
    sessionStorage.removeItem('currentUser');
  } catch (e) {
    console.error('logout error', e);
  }
  // If page is inside a subfolder like Treasurer/, go up one level
  var path = window.location.pathname;
  if (path.indexOf('/Treasurer/') !== -1 || path.indexOf('/treasurer/') !== -1) {
    window.location.href = 'index.html';
  } else {
    window.location.href = 'index.html';
  }
}

  errorEl.textContent = '';

  if (!email || !password) {
    errorEl.textContent = 'Please enter your email and password.';
    return;
  }

  var user = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email && users[i].password === password) {
      user = users[i];
      break;
    }
  }

  if (!user) {
    errorEl.textContent = 'Invalid email or password.';
    return;
  }

  sessionStorage.setItem('currentUser', JSON.stringify(user));

  if (user.role === 'treasurer') {
    window.location.href = 'Treasurer/dashboard.html';
  } else {
    window.location.href = 'member/dashboard.html';
  }
}

function handleRegister() {
  var name     = document.getElementById('reg-name').value.trim();
  var email    = document.getElementById('reg-email').value.trim();
  var password = document.getElementById('reg-password').value.trim();
  var role     = document.getElementById('reg-role').value;
  var errorEl  = document.getElementById('reg-error');

  errorEl.textContent = '';

  if (!name || !email || !password) {
    errorEl.textContent = 'Please fill in all fields.';
    return;
  }

  var exists = false;
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      exists = true;
      break;
    }
  }

  if (exists) {
    errorEl.textContent = 'An account with this email already exists.';
    return;
  }

  var treasurerExists = false;
  var treasurerIndex = -1;
  for (var i = 0; i < users.length; i++) {
    if (users[i].role === 'treasurer') {
      treasurerExists = true;
      treasurerIndex = i;
      break;
    }
  }

  if (role === 'treasurer' && treasurerExists) {
    // Ask user to confirm replacing the existing treasurer
    var replace = window.confirm(
      'A treasurer already exists for this group. Click OK to replace the existing treasurer with this account, or Cancel to keep the current treasurer.'
    );
    if (!replace) {
      errorEl.textContent = 'A treasurer already exists. Registration cancelled.';
      return;
    }

    // Remove existing treasurer so the new one can be added
    if (treasurerIndex !== -1) {
      users.splice(treasurerIndex, 1);
    }
  }

  var newUser = {
    id: users.length + 1,
    name: name,
    email: email,
    password: password,
    role: role
  };

  users.push(newUser);
  sessionStorage.setItem('currentUser', JSON.stringify(newUser));

  if (role === 'treasurer') {
    window.location.href = '../Treasurer/dashboard.html';
  } else {
    window.location.href = '../member/dashboard.html';
  }
}

// Attach event listeners and handle auto-redirect if already logged in
document.addEventListener('DOMContentLoaded', function() {
  try {
    var loginBtn = document.getElementById('login-btn');
    if (loginBtn) {
      loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleLogin();
      });
    }

    var registerBtn = document.getElementById('register-btn');
    if (registerBtn) {
      registerBtn.addEventListener('click', function(e) {
        e.preventDefault();
        handleRegister();
      });
    }

    // If a user is already logged in (sessionStorage), redirect them
    var current = sessionStorage.getItem('currentUser');
    if (current) {
      var u = JSON.parse(current);
      if (u && u.role) {
        if (u.role === 'treasurer') {
          window.location.href = '../Treasurer/dashboard.html';
        } else {
          window.location.href = '../member/dashboard.html';
        }
      }
      }
    
    
  } catch (err) {
    // swallow errors to avoid breaking the page
    console.error('Auth init error', err);
  }

}
);