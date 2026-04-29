var users = [
  { id: 1, name: "Kelly Ndegwa", email: "kelly@gmail.com", password: "1234", role: "treasurer" },
  { id: 2, name: "Alice Wanjiru",   email: "alice@gmail.com",   password: "1234", role: "member" },
  { id: 3, name: "John Kamau",      email: "john@gmail.com",    password: "1234", role: "member" },
  { id: 4, name: "Sarah Mwangi",    email: "sarah@gmail.com",   password: "1234", role: "member" },
  { id: 5, name: "Jana Otieno",     email: "jana@gmail.com",    password: "1234", role: "member" }
];

var contributions = [
  { id: 1, userId: 2, amount: 100, status: "paid",    dueDate: "Jun 20, 2025" },
  { id: 2, userId: 3, amount: 100, status: "paid",    dueDate: "Jun 20, 2025" },
  { id: 3, userId: 4, amount: 200, status: "pending", dueDate: "Jun 25, 2025" },
  { id: 4, userId: 5, amount: 100, status: "overdue", dueDate: "Jun 15, 2025" },
  { id: 5, userId: 2, amount: 150, status: "paid",    dueDate: "May 20, 2025" },
  { id: 6, userId: 3, amount: 150, status: "pending", dueDate: "Jun 28, 2025" },
  { id: 7, userId: 1, amount: 300, status: "paid",    dueDate: "Jun 20, 2025" },
];

var members = [
  { id: 1, userId: 2, amount: 100, status: "paid",    dueDate: "Jun 20, 2025" },
  { id: 2, userId: 3, amount: 100, status: "paid",    dueDate: "Jun 20, 2025" },
  { id: 3, userId: 4, amount: 200, status: "pending", dueDate: "Jun 25, 2025" },
  { id: 4, userId: 5, amount: 100, status: "overdue", dueDate: "Jun 15, 2025" },
  { id: 5, userId: 2, amount: 150, status: "paid",    dueDate: "May 20, 2025" },
  { id: 6, userId: 3, amount: 150, status: "pending", dueDate: "Jun 28, 2025" },
  { id: 7, userId: 1, amount: 300, status: "paid",    dueDate: "Jun 20, 2025" },
];