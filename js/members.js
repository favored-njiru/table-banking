// ── GUARD ──
var currentUser = JSON.parse(sessionStorage.getItem('currentUser'));
if (!currentUser || currentUser.role !== 'treasurer') {
  window.location.href = '../index.html';
}

// ── AVATAR ──
document.getElementById('topbar-avatar').textContent =
  currentUser.name.split(' ')
    .map(function(n) { return n[0]; })
    .join('').toUpperCase();

// ── CURRENTLY EDITING ──
var editingId = null;

// ── STAT CARDS ──
function renderStats() {
  var totalMembers  = users.length;
  var activeMembers = users.filter(function(u) {
    return u.role === 'member';
  }).length;

  var pendingCount = 0;
  for (var i = 0; i < contributions.length; i++) {
    if (contributions[i].status === 'pending') pendingCount++;
  }

  document.getElementById('stat-total').textContent    = totalMembers;
  document.getElementById('stat-active').textContent   = activeMembers;
  document.getElementById('stat-pending').textContent  = pendingCount;
}

// ── RENDER MEMBERS TABLE ──
function renderMembers() {
  var search     = document.getElementById('search-input').value.toLowerCase().trim();
  var roleFilter = document.getElementById('filter-role').value;

  var filtered = [];
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    var nameMatch = u.name.toLowerCase().indexOf(search) !== -1;
    var roleMatch = roleFilter === 'all' || u.role === roleFilter;
    if (nameMatch && roleMatch) filtered.push(u);
  }

  var tbody = document.getElementById('members-body');
  var empty = document.getElementById('members-empty');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  var html = '';

  for (var i = 0; i < filtered.length; i++) {
    var u = filtered[i];

    // count this member's contributions
    var contribCount = 0;
    var totalPaid    = 0;
    for (var j = 0; j < contributions.length; j++) {
      var c = contributions[j];
      if (c.userId === u.id) {
        contribCount++;
        if (c.status === 'paid') totalPaid += c.amount;
      }
    }

    var initials = u.name.split(' ')
      .map(function(n) { return n[0]; })
      .join('').toUpperCase();

    var roleBadge = u.role === 'treasurer'
      ? '<span class="badge" style="background:#dbeafe;color:#1e40af;">Treasurer</span>'
      : '<span class="badge" style="background:#dcfce7;color:#166534;">Member</span>';

    // disable remove for treasurer and for self
    var canRemove = u.role !== 'treasurer' && u.id !== currentUser.id;

    html +=
      '<tr>' +
        '<td style="color:#9ca3af;font-size:12px;">' + u.id + '</td>' +
        '<td>' +
          '<div class="member-cell">' +
            '<div class="member-avatar">' + initials + '</div>' +
            '<div>' +
              '<div class="member-name">' + u.name + '</div>' +
            '</div>' +
          '</div>' +
        '</td>' +
        '<td style="color:#6b7280;">' + u.email + '</td>' +
        '<td>' + roleBadge + '</td>' +
        '<td style="text-align:center;">' + contribCount + '</td>' +
        '<td style="font-weight:600;color:#1e4fa0;">$' + totalPaid + '</td>' +
        '<td>' +
          '<button class="action-btn btn-edit" ' +
            'onclick="openViewModal(' + u.id + ')" ' +
            'style="margin-right:4px;">View</button>' +
          '<button class="action-btn btn-edit" ' +
            'onclick="openEditModal(' + u.id + ')" ' +
            'style="margin-right:4px;">Edit</button>' +
          (canRemove
            ? '<button class="action-btn btn-delete" ' +
                'onclick="removeMember(' + u.id + ')">Remove</button>'
            : '<button class="action-btn" ' +
                'style="background:#f3f4f6;color:#9ca3af;" ' +
                'disabled>Remove</button>') +
        '</td>' +
      '</tr>';
  }

  tbody.innerHTML = html;
}

// ── ADD MEMBER MODAL ──
function openAddModal() {
  document.getElementById('add-name').value     = '';
  document.getElementById('add-email').value    = '';
  document.getElementById('add-password').value = '';
  document.getElementById('add-error').textContent = '';
  document.getElementById('add-modal').classList.add('open');
  document.getElementById('add-overlay').classList.add('open');
}

function closeAddModal() {
  document.getElementById('add-modal').classList.remove('open');
  document.getElementById('add-overlay').classList.remove('open');
}

function addMember() {
  var name     = document.getElementById('add-name').value.trim();
  var email    = document.getElementById('add-email').value.trim();
  var password = document.getElementById('add-password').value.trim();
  var errorEl  = document.getElementById('add-error');

  errorEl.textContent = '';

  if (!name || !email || !password) {
    errorEl.textContent = 'Please fill in all fields.';
    return;
  }

  // check email already exists
  for (var i = 0; i < users.length; i++) {
    if (users[i].email === email) {
      errorEl.textContent = 'A member with this email already exists.';
      return;
    }
  }

  var newMember = {
    id:       users.length + 1,
    name:     name,
    email:    email,
    password: password,
    role:     'member'
  };

  users.push(newMember);
  closeAddModal();
  renderStats();
  renderMembers();
}

// ── EDIT MEMBER MODAL ──
function openEditModal(id) {
  var u = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === id) { u = users[i]; break; }
  }
  if (!u) return;

  editingId = id;
  document.getElementById('edit-name').value  = u.name;
  document.getElementById('edit-email').value = u.email;
  document.getElementById('edit-role').value  = u.role;
  document.getElementById('edit-error').textContent = '';
  document.getElementById('edit-modal').classList.add('open');
  document.getElementById('edit-overlay').classList.add('open');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.remove('open');
  document.getElementById('edit-overlay').classList.remove('open');
  editingId = null;
}

function saveEdit() {
  var name    = document.getElementById('edit-name').value.trim();
  var email   = document.getElementById('edit-email').value.trim();
  var role    = document.getElementById('edit-role').value;
  var errorEl = document.getElementById('edit-error');

  errorEl.textContent = '';

  if (!name || !email) {
    errorEl.textContent = 'Name and email are required.';
    return;
  }

  // if changing role to treasurer, check one already exists
  if (role === 'treasurer') {
    for (var i = 0; i < users.length; i++) {
      if (users[i].role === 'treasurer' &&
          users[i].id !== editingId) {
        errorEl.textContent =
          'A treasurer already exists. Remove that role first.';
        return;
      }
    }
  }

  for (var i = 0; i < users.length; i++) {
    if (users[i].id === editingId) {
      users[i].name  = name;
      users[i].email = email;
      users[i].role  = role;
      break;
    }
  }

  closeEditModal();
  renderStats();
  renderMembers();
}

// ── VIEW MEMBER MODAL ──
function openViewModal(id) {
  var u = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === id) { u = users[i]; break; }
  }
  if (!u) return;

  var contribs = [];
  var totalPaid = 0;
  var totalPending = 0;

  for (var i = 0; i < contributions.length; i++) {
    var c = contributions[i];
    if (c.userId === u.id) {
      contribs.push(c);
      if (c.status === 'paid') totalPaid += c.amount;
      if (c.status === 'pending') totalPending += c.amount;
    }
  }

  var initials = u.name.split(' ')
    .map(function(n) { return n[0]; })
    .join('').toUpperCase();

  var contribRows = '';
  for (var i = 0; i < contribs.length; i++) {
    var c = contribs[i];
    var badgeClass =
      c.status === 'paid'    ? 'paid'    :
      c.status === 'pending' ? 'pending' : 'overdue';
    contribRows +=
      '<tr>' +
        '<td style="padding:8px 10px;font-size:13px;' +
             'border-bottom:1px solid #f3f4f6;">' +
          '$' + c.amount +
        '</td>' +
        '<td style="padding:8px 10px;font-size:13px;' +
             'border-bottom:1px solid #f3f4f6;">' +
          '<span class="badge ' + badgeClass + '">' +
            c.status +
          '</span>' +
        '</td>' +
        '<td style="padding:8px 10px;font-size:13px;' +
             'color:#6b7280;border-bottom:1px solid #f3f4f6;">' +
          c.dueDate +
        '</td>' +
      '</tr>';
  }

  var html =
    '<div style="display:flex;align-items:center;' +
         'gap:16px;margin-bottom:20px;">' +
      '<div class="member-avatar" ' +
           'style="width:52px;height:52px;font-size:16px;">' +
        initials +
      '</div>' +
      '<div>' +
        '<div style="font-size:16px;font-weight:700;' +
                    'color:#111827;">' + u.name + '</div>' +
        '<div style="font-size:13px;color:#6b7280;">' +
          u.email +
        '</div>' +
        '<div style="margin-top:4px;">' +
          (u.role === 'treasurer'
            ? '<span class="badge" style="background:#dbeafe;' +
                'color:#1e40af;">Treasurer</span>'
            : '<span class="badge" style="background:#dcfce7;' +
                'color:#166534;">Member</span>') +
        '</div>' +
      '</div>' +
    '</div>' +

    '<div style="display:grid;grid-template-columns:1fr 1fr;' +
         'gap:10px;margin-bottom:18px;">' +
      '<div style="background:#f9fafb;border-radius:8px;' +
                  'padding:12px;text-align:center;">' +
        '<div style="font-size:11px;color:#6b7280;' +
                    'margin-bottom:4px;">Total Paid</div>' +
        '<div style="font-size:20px;font-weight:700;' +
                    'color:#1e4fa0;">$' + totalPaid + '</div>' +
      '</div>' +
      '<div style="background:#f9fafb;border-radius:8px;' +
                  'padding:12px;text-align:center;">' +
        '<div style="font-size:11px;color:#6b7280;' +
                    'margin-bottom:4px;">Pending</div>' +
        '<div style="font-size:20px;font-weight:700;' +
                    'color:#f59e0b;">$' + totalPending + '</div>' +
      '</div>' +
    '</div>' +

    '<div style="font-size:13px;font-weight:600;' +
         'color:#111827;margin-bottom:10px;">' +
      'Contribution History' +
    '</div>' +

    (contribs.length > 0
      ? '<table style="width:100%;">' +
          '<thead>' +
            '<tr style="background:#f9fafb;">' +
              '<th style="padding:8px 10px;text-align:left;' +
                   'font-size:11px;color:#6b7280;">Amount</th>' +
              '<th style="padding:8px 10px;text-align:left;' +
                   'font-size:11px;color:#6b7280;">Status</th>' +
              '<th style="padding:8px 10px;text-align:left;' +
                   'font-size:11px;color:#6b7280;">Due Date</th>' +
            '</tr>' +
          '</thead>' +
          '<tbody>' + contribRows + '</tbody>' +
        '</table>'
      : '<div style="text-align:center;padding:20px;' +
             'color:#9ca3af;font-size:13px;">' +
          'No contributions yet.' +
        '</div>');

  document.getElementById('view-content').innerHTML = html;
  document.getElementById('view-modal').classList.add('open');
  document.getElementById('view-overlay').classList.add('open');
}

function closeViewModal() {
  document.getElementById('view-modal').classList.remove('open');
  document.getElementById('view-overlay').classList.remove('open');
}

// ── REMOVE MEMBER ──
function removeMember(id) {
  var u = null;
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === id) { u = users[i]; break; }
  }
  if (!u) return;

  if (!confirm('Remove ' + u.name + ' from the group?\n' +
               'Their contribution history will also be removed.')) {
    return;
  }

  // remove user
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      users.splice(i, 1);
      break;
    }
  }

  // remove their contributions too
  var remaining = [];
  for (var i = 0; i < contributions.length; i++) {
    if (contributions[i].userId !== id) {
      remaining.push(contributions[i]);
    }
  }
  contributions = remaining;

  renderStats();
  renderMembers();
}

// ── INIT ──
renderStats();
renderMembers();