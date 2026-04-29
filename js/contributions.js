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

// ── POPULATE DROPDOWNS ──
function populateDropdowns() {
  var filterEl = document.getElementById('filter-member');
  var modalEl  = document.getElementById('modal-member');

  filterEl.innerHTML = '<option value="all">All Members</option>';
  modalEl.innerHTML  = '';

  for (var i = 0; i < users.length; i++) {
    var u = users[i];

    var o1 = document.createElement('option');
    o1.value       = String(u.id);
    o1.textContent = u.name;
    filterEl.appendChild(o1);

    var o2 = document.createElement('option');
    o2.value       = String(u.id);
    o2.textContent = u.name;
    modalEl.appendChild(o2);
  }
}

// ── SUMMARY CARDS ──
function renderSummary() {
  var totalCollected = 0;
  var paidCount      = 0;
  var pendingCount   = 0;
  var overdueCount   = 0;

  for (var i = 0; i < contributions.length; i++) {
    var c = contributions[i];
    if (c.status === 'paid') {
      totalCollected += c.amount;
      paidCount++;
    }
    if (c.status === 'pending') pendingCount++;
    if (c.status === 'overdue') overdueCount++;
  }

  document.getElementById('total-collected').textContent    = 'Ksh' + totalCollected.toLocaleString();
  document.getElementById('total-paid-count').textContent   = paidCount;
  document.getElementById('total-pending-count').textContent = pendingCount;
  document.getElementById('total-overdue-count').textContent = overdueCount;
}

// ── RENDER TABLE ──
function renderTable() {
  var filterMemberVal = document.getElementById('filter-member').value;
  var filterStatusVal = document.getElementById('filter-status').value;

  var filtered = [];
  for (var i = 0; i < contributions.length; i++) {
    var c = contributions[i];
    var memberMatch = (filterMemberVal === 'all') ||
                      (String(c.userId) === filterMemberVal);
    var statusMatch = (filterStatusVal === 'all') ||
                      (c.status === filterStatusVal);
    if (memberMatch && statusMatch) filtered.push(c);
  }

  var tbody      = document.getElementById('contributions-body');
  var emptyState = document.getElementById('empty-state');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    emptyState.style.display = 'block';
    return;
  }

  emptyState.style.display = 'none';
  var html = '';

  for (var i = 0; i < filtered.length; i++) {
    var c = filtered[i];

    var member = null;
    for (var j = 0; j < users.length; j++) {
      if (users[j].id === c.userId) {
        member = users[j];
        break;
      }
    }

    var initials = member
      ? member.name.split(' ')
          .map(function(n) { return n[0]; })
          .join('').toUpperCase()
      : '?';

    var memberName = member ? member.name : 'Unknown';

    var badgeClass =
      c.status === 'paid'    ? 'paid'    :
      c.status === 'pending' ? 'pending' : 'overdue';

    html +=
      '<tr>' +
        '<td style="color:#9ca3af;font-size:12px;">#' + c.id + '</td>' +
        '<td>' +
          '<div class="member-cell">' +
            '<div class="member-avatar">' + initials + '</div>' +
            '<div class="member-name">' + memberName + '</div>' +
          '</div>' +
        '</td>' +
        '<td>' +
          '<span class="badge ' + badgeClass + '">' +
            c.status.charAt(0).toUpperCase() + c.status.slice(1) +
          '</span>' +
        '</td>' +
      '<td style="font-weight:600;color:#111827;">Ksh ' + c.amount + '</td>' +
        '<td style="color:#6b7280;">' + c.dueDate + '</td>' +
        '<td>' +
          '<button class="action-btn btn-edit" ' +
            'onclick="editRow(' + c.id + ')">Edit</button>' +
          '<button class="action-btn btn-delete" ' +
            'onclick="deleteRow(' + c.id + ')">Delete</button>' +
        '</td>' +
      '</tr>';
  }

  tbody.innerHTML = html;
}

// ── OPEN MODAL ──
function openModal() {
  document.getElementById('modal-error').textContent = '';
  document.getElementById('modal-amount').value      = '';
  document.getElementById('modal-status').value      = 'paid';
  document.getElementById('modal-date').value        = '';
  document.getElementById('modal').classList.add('open');
  document.getElementById('modal-overlay').classList.add('open');
}

// ── CLOSE MODAL ──
function closeModal() {
  document.getElementById('modal').classList.remove('open');
  document.getElementById('modal-overlay').classList.remove('open');
}

// ── RECORD PAYMENT ──
function recordPayment() {
  var userId  = parseInt(document.getElementById('modal-member').value);
  var amount  = parseInt(document.getElementById('modal-amount').value);
  var status  = document.getElementById('modal-status').value;
  var date    = document.getElementById('modal-date').value;
  var errorEl = document.getElementById('modal-error');

  errorEl.textContent = '';

  if (!amount || isNaN(amount) || amount <= 0) {
    errorEl.textContent = 'Please enter a valid amount.';
    return;
  }
  if (!date) {
    errorEl.textContent = 'Please select a due date.';
    return;
  }

  var d = new Date(date);
  var months = ['Jan','Feb','Mar','Apr','May','Jun',
                'Jul','Aug','Sep','Oct','Nov','Dec'];
  var formattedDate = months[d.getMonth()] + ' ' +
                      (d.getDate() + 1) + ', ' + d.getFullYear();

  var newEntry = {
    id:      contributions.length + 1,
    userId:  userId,
    amount:  amount,
    status:  status,
    dueDate: formattedDate
  };

  contributions.push(newEntry);
  closeModal();
  renderSummary();
  renderTable();
}

// ── EDIT ROW ──
function editRow(id) {
  var c = null;
  for (var i = 0; i < contributions.length; i++) {
    if (contributions[i].id === id) {
      c = contributions[i];
      break;
    }
  }
  if (!c) return;

  var newStatus = prompt(
    'Edit status for Ksh ' + c.amount + ' contribution.\n' +
    'Current status: ' + c.status + '\n\n' +
    'Type new status: paid / pending / overdue',
    c.status
  );

  if (newStatus === null) return;

  newStatus = newStatus.toLowerCase().trim();

  if (newStatus === 'paid' ||
      newStatus === 'pending' ||
      newStatus === 'overdue') {
    c.status = newStatus;
    renderSummary();
    renderTable();
  } else {
    alert('Invalid status. Please type: paid, pending, or overdue');
  }
}

// ── DELETE ROW ──
function deleteRow(id) {
  if (!confirm('Delete this contribution? This cannot be undone.')) return;

  for (var i = 0; i < contributions.length; i++) {
    if (contributions[i].id === id) {
      contributions.splice(i, 1);
      break;
    }
  }

  renderSummary();
  renderTable();
}

// ── INIT ──
document.addEventListener('DOMContentLoaded', function() {
  try {
    populateDropdowns();
    renderSummary();
    renderTable();
    renderMembers();
  } catch (err) {
    console.error('Contributions init error:', err);
  }
});

// ── MEMBERS TABLE ──
function renderMembers() {
  var tbody = document.getElementById('members-body');
  if (!tbody) return;
  var html = '';
  for (var i = 0; i < users.length; i++) {
    var u = users[i];
    html += '<tr>' +
            '<td style="color:#9ca3af;font-size:12px;">#' + u.id + '</td>' +
            '<td>' + u.name + '</td>' +
            '<td>' + u.email + '</td>' +
            '<td>' + (u.role.charAt(0).toUpperCase() + u.role.slice(1)) + '</td>' +
            '<td>' +
              '<button class="action-btn btn-edit" onclick="editMember(' + u.id + ')">Edit</button>' +
              '<button class="action-btn btn-delete" onclick="deleteMember(' + u.id + ')">Delete</button>' +
            '</td>' +
            '</tr>';
  }
  tbody.innerHTML = html;
}

function editMember(id) {
  var u = users.find(function(x){ return x.id === id; });
  if (!u) return alert('Member not found');
  var newName = prompt('Edit name', u.name);
  if (newName === null) return;
  var newEmail = prompt('Edit email', u.email);
  if (newEmail === null) return;
  var newRole = prompt('Edit role (member/treasurer)', u.role);
  if (newRole === null) return;
  u.name = newName.trim() || u.name;
  u.email = newEmail.trim() || u.email;
  u.role = newRole.trim() || u.role;
  renderMembers();
  populateDropdowns();
  renderTable();
}

function deleteMember(id) {
  if (!confirm('Delete this member? This cannot be undone.')) return;
  for (var i = 0; i < users.length; i++) {
    if (users[i].id === id) {
      users.splice(i,1);
      break;
    }
  }
  renderMembers();
  populateDropdowns();
  renderTable();
}