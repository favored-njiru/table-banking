// ── GUARD ──
var currentUser = JSON.parse(
  sessionStorage.getItem('currentUser')
);
if (!currentUser || currentUser.role !== 'treasurer') {
  window.location.href = '../index.html';
}

// ── HELPERS ──
function getInitials(name) {
  return name.split(' ')
    .map(function(n) { return n[0]; })
    .join('').toUpperCase();
}

// ── LOAD PROFILE ──
function loadProfile() {
  var u = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === currentUser.id) {
      u = users[i];
      break;
    }
  }
  if (!u) return;

  // topbar + avatar
  document.getElementById('topbar-avatar').textContent =
    getInitials(u.name);
  document.getElementById('profile-avatar-big').textContent =
    getInitials(u.name);
  document.getElementById('profile-name').textContent  = u.name;
  document.getElementById('profile-email').textContent = u.email;

  // stats
  var myContribs  = [];
  var totalPaid   = 0;
  var pendingAmt  = 0;
  var nextDueDate = null;

  for (var i = 0; i < contributions.length; i++) {
    var c = contributions[i];
    if (c.userId === currentUser.id) {
      myContribs.push(c);
      if (c.status === 'paid')    totalPaid  += c.amount;
      if (c.status === 'pending') pendingAmt += c.amount;
      if (c.status === 'pending' && !nextDueDate) {
        nextDueDate = c.dueDate;
      }
    }
  }

  var memberCount = 0;
  for (var i = 0; i < users.length; i++) {
    if (users[i].role === 'member') memberCount++;
  }

  // mini stats
  document.getElementById('ps-contributions').textContent =
    myContribs.length;
  document.getElementById('ps-total-paid').textContent =
    'Ksh ' + totalPaid.toLocaleString();
  document.getElementById('ps-members').textContent =
    memberCount;

  // summary
  document.getElementById('sum-total').textContent =
    'Ksh ' + totalPaid.toLocaleString();
  document.getElementById('sum-payments').textContent =
    myContribs.filter(function(c) {
      return c.status === 'paid';
    }).length;
  document.getElementById('sum-pending').textContent =
    'Ksh ' + pendingAmt.toLocaleString();
  document.getElementById('sum-next-due').textContent =
    nextDueDate || '—';

  // contributions table
  var tbody  = document.getElementById('my-contributions-body');
  var noEl   = document.getElementById('no-contributions');

  if (myContribs.length === 0) {
    tbody.innerHTML    = '';
    noEl.style.display = 'block';
    return;
  }

  noEl.style.display = 'none';
  var html = '';

  for (var i = 0; i < myContribs.length; i++) {
    var c = myContribs[i];
    var badgeClass =
      c.status === 'paid'    ? 'paid'    :
      c.status === 'pending' ? 'pending' : 'overdue';

    html +=
      '<tr>' +
        '<td style="font-weight:600;color:#111827;">' +
          'Ksh ' + c.amount.toLocaleString() +
        '</td>' +
        '<td>' +
          '<span class="badge ' + badgeClass + '">' +
            c.status.charAt(0).toUpperCase() +
            c.status.slice(1) +
          '</span>' +
        '</td>' +
        '<td style="color:#6b7280;">' + c.dueDate + '</td>' +
      '</tr>';
  }

  tbody.innerHTML = html;
}

// ── EDIT PROFILE MODAL ──
function openEditProfile() {
  var u = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === currentUser.id) {
      u = users[i]; break;
    }
  }
  if (!u) return;

  document.getElementById('edit-name').value  = u.name;
  document.getElementById('edit-email').value = u.email;
  document.getElementById('edit-error').textContent = '';
  document.getElementById('edit-modal').classList.add('open');
  document.getElementById('edit-overlay').classList.add('open');
}

function closeEditProfile() {
  document.getElementById('edit-modal').classList.remove('open');
  document.getElementById('edit-overlay').classList.remove('open');
}

function saveProfile() {
  var name    = document.getElementById('edit-name').value.trim();
  var email   = document.getElementById('edit-email').value.trim();
  var errorEl = document.getElementById('edit-error');

  errorEl.textContent = '';

  if (!name || !email) {
    errorEl.textContent = 'Name and email are required.';
    return;
  }

  // check email not taken by someone else
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email &&
        users[i].id !== currentUser.id) {
      errorEl.textContent =
        'This email is already used by another member.';
      return;
    }
  }

  // update in users array
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === currentUser.id) {
      users[i].name  = name;
      users[i].email = email;
      break;
    }
  }

  // update sessionStorage
  currentUser.name  = name;
  currentUser.email = email;
  sessionStorage.setItem(
    'currentUser', JSON.stringify(currentUser)
  );

  closeEditProfile();
  loadProfile();
}

// ── CHANGE PASSWORD ──
function changePassword() {
  var currentPw = document.getElementById('current-pw').value;
  var newPw     = document.getElementById('new-pw').value;
  var confirmPw = document.getElementById('confirm-pw').value;
  var errorEl   = document.getElementById('pw-error');
  var successEl = document.getElementById('pw-success');

  errorEl.textContent   = '';
  successEl.textContent = '';

  if (!currentPw || !newPw || !confirmPw) {
    errorEl.textContent = 'Please fill in all fields.';
    return;
  }

  // verify current password
  var u = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === currentUser.id) {
      u = users[i]; break;
    }
  }

  if (!u || u.password !== currentPw) {
    errorEl.textContent = 'Current password is incorrect.';
    return;
  }

  if (newPw.length < 4) {
    errorEl.textContent =
      'New password must be at least 4 characters.';
    return;
  }

  if (newPw !== confirmPw) {
    errorEl.textContent = 'New passwords do not match.';
    return;
  }

  // save new password
  u.password = newPw;
  currentUser.password = newPw;
  sessionStorage.setItem(
    'currentUser', JSON.stringify(currentUser)
  );

  document.getElementById('current-pw').value = '';
  document.getElementById('new-pw').value     = '';
  document.getElementById('confirm-pw').value = '';

  successEl.textContent = '✅ Password updated successfully!';
}

// ── INIT ──
loadProfile();