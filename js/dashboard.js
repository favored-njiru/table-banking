var currentUser = JSON.parse(sessionStorage.getItem('currentUser'));

if (!currentUser || currentUser.role !== 'treasurer') {
  window.location.href = '../index.html';
}

// ── USER INFO ──
document.getElementById('user-name').textContent =
  currentUser.name.split(' ')[0];
document.getElementById('topbar-avatar').textContent =
  currentUser.name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase();

// ── STATS ──
var totalSavings = 0;
var yourContrib  = 0;
var pendingCount = 0;
var totalMembers = 0;

for (var i = 0; i < contributions.length; i++) {
  var c = contributions[i];
  if (c.status === 'paid') totalSavings += c.amount;
  if (c.userId === currentUser.id && c.status === 'paid') yourContrib += c.amount;
  if (c.status === 'pending') pendingCount++;
}

for (var i = 0; i < users.length; i++) {
  if (users[i].role === 'member') totalMembers++;
}

document.getElementById('total-savings').textContent     = 'Ksh ' + totalSavings.toLocaleString();
document.getElementById('your-contribution').textContent = 'Ksh ' + yourContrib.toLocaleString();
document.getElementById('pending-count').textContent     = pendingCount;
document.getElementById('total-members').textContent     = totalMembers;

// ── MINI BARS ──
function renderBars(containerId) {
  var el = document.getElementById(containerId);
  var heights = [30, 50, 40, 65, 55, 75, 70, 100];
  var html = '';
  for (var i = 0; i < heights.length; i++) {
    html += '<div class="mini-bar" style="height:' + heights[i] + '%"></div>';
  }
  el.innerHTML = html;
}
renderBars('savings-bars');
renderBars('contrib-bars');

// ── UPCOMING PAYMENTS ──
var upcomingHtml = '';
var upcomingCount = 0;

for (var i = 0; i < contributions.length; i++) {
  var c = contributions[i];
  if ((c.status === 'pending' || c.status === 'overdue') && upcomingCount < 4) {
    var member = null;
    for (var j = 0; j < users.length; j++) {
      if (users[j].id === c.userId) { member = users[j]; break; }
    }
    upcomingHtml +=
      '<div class="payment-item">' +
        '<div>' +
          '<div class="payment-member">' + (member ? member.name : 'Unknown') + '</div>' +
          '<div class="payment-due">Due: ' + c.dueDate + '</div>' +
        '</div>' +
  '<div class="payment-amount">Ksh ' + c.amount + '</div>' +
      '</div>';
    upcomingCount++;
  }
}

document.getElementById('upcoming-list').innerHTML =
  upcomingHtml || '<p style="color:#9ca3af;font-size:13px;">No upcoming payments.</p>';


// ── RECENT ACTIVITY ──
var activityHtml = '';

for (var i = 0; i < contributions.length && i < 5; i++) {
  var c = contributions[i];
  var member = null;
  for (var j = 0; j < users.length; j++) {
    if (users[j].id === c.userId) { member = users[j]; break; }
  }
  var dotClass = c.status === 'paid' ? 'green' : c.status === 'overdue' ? 'red' : 'orange';
  var text =
    c.status === 'paid'
  ? '<strong>' + member.name + '</strong> paid <strong>Ksh ' + c.amount + '</strong>'
      : c.status === 'overdue'
      ? '<strong>' + member.name + '</strong> — payment overdue'
      : '<strong>' + member.name + '</strong>\'s payment is pending';

  activityHtml +=
    '<div class="activity-item">' +
      '<div class="activity-left">' +
        '<div class="activity-dot ' + dotClass + '"></div>' +
        '<div class="activity-text">' + text + '</div>' +
      '</div>' +
      '<div class="activity-time">' + c.dueDate + '</div>' +
    '</div>';
}

document.getElementById('activity-list').innerHTML = activityHtml;