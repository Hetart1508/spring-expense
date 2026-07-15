import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";

// Initial In-Memory Database for Live Preview
// This is pre-populated with a default user 'hetarth' (hashed password simulated)
// and rich realistic transaction history to show off the beautiful charts on first load.
const USERS = [
  {
    id: 1,
    name: "hetarth",
    // BCrypt-hashed password: Password@123 (simulated match)
    passwordHash: "Password@123", // For mock verification simplicity
    role: "USER",
    createdAt: "2026-07-01T10:00:00.000Z",
    updatedAt: "2026-07-01T10:00:00.000Z"
  }
];

const CATEGORIES = [
  // INCOME
  { id: 1, name: "Salary", type: "INCOME", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 2, name: "Freelance", type: "INCOME", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 3, name: "Business", type: "INCOME", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 4, name: "Investment", type: "INCOME", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 5, name: "Gift", type: "INCOME", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 6, name: "Refund", type: "INCOME", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 7, name: "Bonus", type: "INCOME", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 8, name: "Other Income", type: "INCOME", createdAt: "2026-07-01T10:00:00.000Z" },
  // EXPENSE
  { id: 9, name: "Food", type: "EXPENSE", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 10, name: "Travel", type: "EXPENSE", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 11, name: "Shopping", type: "EXPENSE", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 12, name: "Bills", type: "EXPENSE", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 13, name: "Health", type: "EXPENSE", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 14, name: "Education", type: "EXPENSE", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 15, name: "Entertainment", type: "EXPENSE", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 16, name: "Rent", type: "EXPENSE", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 17, name: "Groceries", type: "EXPENSE", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 18, name: "Utilities", type: "EXPENSE", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 19, name: "Insurance", type: "EXPENSE", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 20, name: "EMI", type: "EXPENSE", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 21, name: "Fuel", type: "EXPENSE", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 22, name: "Subscription", type: "EXPENSE", createdAt: "2026-07-01T10:00:00.000Z" },
  { id: 23, name: "Other Expense", type: "EXPENSE", createdAt: "2026-07-01T10:00:00.000Z" }
];

let TRANSACTIONS = [
  {
    id: 1,
    name: "July Salary",
    amount: 5200.00,
    type: "INCOME",
    category: CATEGORIES[0], // Salary
    transactionDate: "2026-07-01",
    description: "Monthly baseline salary credit",
    paymentMethod: "BANK_TRANSFER",
    userId: 1,
    createdAt: "2026-07-01T10:05:00.000Z",
    updatedAt: "2026-07-01T10:05:00.000Z"
  },
  {
    id: 2,
    name: "Apartment Rent",
    amount: 1200.00,
    type: "EXPENSE",
    category: CATEGORIES[15], // Rent (id 16)
    transactionDate: "2026-07-02",
    description: "July rent for downtown apartment",
    paymentMethod: "BANK_TRANSFER",
    userId: 1,
    createdAt: "2026-07-02T09:00:00.000Z",
    updatedAt: "2026-07-02T09:00:00.000Z"
  },
  {
    id: 3,
    name: "Weekly Organic Groceries",
    amount: 184.50,
    type: "EXPENSE",
    category: CATEGORIES[16], // Groceries (id 17)
    transactionDate: "2026-07-03",
    description: "Whole Foods healthy cart",
    paymentMethod: "CARD",
    userId: 1,
    createdAt: "2026-07-03T18:30:00.000Z",
    updatedAt: "2026-07-03T18:30:00.000Z"
  },
  {
    id: 4,
    name: "Freelance UI Development",
    amount: 1450.00,
    type: "INCOME",
    category: CATEGORIES[1], // Freelance (id 2)
    transactionDate: "2026-07-05",
    description: "Dashboard layout project milestone",
    paymentMethod: "BANK_TRANSFER",
    userId: 1,
    createdAt: "2026-07-05T14:15:00.000Z",
    updatedAt: "2026-07-05T14:15:00.000Z"
  },
  {
    id: 5,
    name: "Sushi Dinner Client Meet",
    amount: 92.00,
    type: "EXPENSE",
    category: CATEGORIES[8], // Food (id 9)
    transactionDate: "2026-07-06",
    description: "Premium sushi bar network talk",
    paymentMethod: "UPI",
    userId: 1,
    createdAt: "2026-07-06T20:45:00.000Z",
    updatedAt: "2026-07-06T20:45:00.000Z"
  },
  {
    id: 6,
    name: "Gym Membership",
    amount: 60.00,
    type: "EXPENSE",
    category: CATEGORIES[12], // Health (id 13)
    transactionDate: "2026-07-07",
    description: "Monthly subscription",
    paymentMethod: "CARD",
    userId: 1,
    createdAt: "2026-07-07T08:00:00.000Z",
    updatedAt: "2026-07-07T08:00:00.000Z"
  },
  {
    id: 7,
    name: "Electricity & Gas Bill",
    amount: 145.20,
    type: "EXPENSE",
    category: CATEGORIES[17], // Utilities (id 18)
    transactionDate: "2026-07-08",
    description: "Power company summer bill",
    paymentMethod: "BANK_TRANSFER",
    userId: 1,
    createdAt: "2026-07-08T11:20:00.000Z",
    updatedAt: "2026-07-08T11:20:00.000Z"
  },
  {
    id: 8,
    name: "Online Tech Course",
    amount: 45.00,
    type: "EXPENSE",
    category: CATEGORIES[13], // Education (id 14)
    transactionDate: "2026-07-10",
    description: "Advanced Spring Security lessons",
    paymentMethod: "CARD",
    userId: 1,
    createdAt: "2026-07-10T15:00:00.000Z",
    updatedAt: "2026-07-10T15:00:00.000Z"
  },
  {
    id: 9,
    name: "Fuel Refill",
    amount: 70.00,
    type: "EXPENSE",
    category: CATEGORIES[20], // Fuel (id 21)
    transactionDate: "2026-07-12",
    description: "Full tank refill",
    paymentMethod: "UPI",
    userId: 1,
    createdAt: "2026-07-12T17:10:00.000Z",
    updatedAt: "2026-07-12T17:10:00.000Z"
  },
  {
    id: 10,
    name: "Movie Night",
    amount: 35.00,
    type: "EXPENSE",
    category: CATEGORIES[14], // Entertainment (id 15)
    transactionDate: "2026-07-13",
    description: "Tickets and popcorn",
    paymentMethod: "CASH",
    userId: 1,
    createdAt: "2026-07-13T21:00:00.000Z",
    updatedAt: "2026-07-13T21:00:00.000Z"
  },
  {
    id: 11,
    name: "Dividend Payout",
    amount: 320.00,
    type: "INCOME",
    category: CATEGORIES[3], // Investment (id 4)
    transactionDate: "2026-07-14",
    description: "Index fund quarterly dividends",
    paymentMethod: "BANK_TRANSFER",
    userId: 1,
    createdAt: "2026-07-14T10:00:00.000Z",
    updatedAt: "2026-07-14T10:00:00.000Z"
  }
];

let transactionIdCounter = 12;
let userIdCounter = 2;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Helper function to read authentication from cookies
  function getAuthenticatedUser(req: express.Request) {
    const cookies = req.headers.cookie || "";
    const match = cookies.match(/java_expense_token=([^;]+)/);
    if (!match) return null;
    const username = decodeURIComponent(match[1]);
    const user = USERS.find(u => u.name === username);
    return user || null;
  }

  // --- REST CONTROLLER ENDPOINTS ---

  // 1. Auth APIs
  app.post("/api/auth/register", (req, res) => {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Bad Request",
        message: "Name and password are required",
        path: "/api/auth/register"
      });
    }

    if (USERS.some(u => u.name.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({
        timestamp: new Date().toISOString(),
        status: 409,
        error: "Conflict",
        message: "Username already exists",
        path: "/api/auth/register"
      });
    }

    const newUser = {
      id: userIdCounter++,
      name,
      passwordHash: password, // Store in plain text for preview, representing hashedPassword
      role: "USER",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    USERS.push(newUser);

    // Return created user (exclude password)
    const { passwordHash, ...userResponse } = newUser;
    res.status(201).json(userResponse);
  });

  app.post("/api/auth/login", (req, res) => {
    const { name, password } = req.body;
    if (!name || !password) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        error: "Bad Request",
        message: "Name and password are required",
        path: "/api/auth/login"
      });
    }

    const user = USERS.find(u => u.name.toLowerCase() === name.toLowerCase() && u.passwordHash === password);
    if (!user) {
      return res.status(401).json({
        timestamp: new Date().toISOString(),
        status: 401,
        error: "Unauthorized",
        message: "Invalid username or password",
        path: "/api/auth/login"
      });
    }

    // Set secure HTTP-only cookie
    res.setHeader(
      "Set-Cookie",
      `java_expense_token=${encodeURIComponent(user.name)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    );

    const { passwordHash, ...userResponse } = user;
    res.status(200).json(userResponse);
  });

  app.post("/api/auth/logout", (req, res) => {
    res.setHeader(
      "Set-Cookie",
      `java_expense_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
    );
    res.status(204).end();
  });

  app.get("/api/auth/me", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        timestamp: new Date().toISOString(),
        status: 401,
        error: "Unauthorized",
        message: "Full authentication is required to access this resource",
        path: "/api/auth/me"
      });
    }
    const { passwordHash, ...userResponse } = user;
    res.status(200).json(userResponse);
  });

  // 2. Profile APIs
  app.get("/api/profile", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { passwordHash, ...userResponse } = user;
    res.status(200).json(userResponse);
  });

  app.put("/api/profile", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { name } = req.body;
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Name is required" });
    }

    if (name.toLowerCase() !== user.name.toLowerCase() && USERS.some(u => u.name.toLowerCase() === name.toLowerCase())) {
      return res.status(409).json({ message: "Username already exists" });
    }

    user.name = name;
    user.updatedAt = new Date().toISOString();

    // Update the authentication cookie with the new name
    res.setHeader(
      "Set-Cookie",
      `java_expense_token=${encodeURIComponent(user.name)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=86400`
    );

    const { passwordHash, ...userResponse } = user;
    res.status(200).json(userResponse);
  });

  app.put("/api/profile/password", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (user.passwordHash !== currentPassword) {
      return res.status(400).json({ message: "Invalid current password" });
    }

    user.passwordHash = newPassword;
    user.updatedAt = new Date().toISOString();
    res.status(200).json({ message: "Password updated successfully" });
  });

  // 3. Category APIs
  app.get("/api/categories", (req, res) => {
    const { type } = req.query;
    let filtered = CATEGORIES;
    if (type === "INCOME" || type === "EXPENSE") {
      filtered = CATEGORIES.filter(c => c.type === type);
    }
    res.status(200).json(filtered);
  });

  app.get("/api/categories/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const category = CATEGORIES.find(c => c.id === id);
    if (!category) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: "Not Found",
        message: `Category not found with id: ${id}`,
        path: `/api/categories/${id}`
      });
    }
    res.status(200).json(category);
  });

  // 4. Transaction APIs (CRUD + Pagination + Search + Filtering)
  app.post("/api/transactions", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const { name, amount, type, categoryId, transactionDate, description, paymentMethod } = req.body;

    // Server-side validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ error: "Bad Request", message: "Transaction name is required" });
    }
    if (amount === undefined || amount <= 0) {
      return res.status(400).json({ error: "Bad Request", message: "Amount must be greater than zero" });
    }
    if (!type || (type !== "INCOME" && type !== "EXPENSE")) {
      return res.status(400).json({ error: "Bad Request", message: "Valid type (INCOME or EXPENSE) is required" });
    }
    if (!categoryId) {
      return res.status(400).json({ error: "Bad Request", message: "Category is required" });
    }
    const category = CATEGORIES.find(c => c.id === parseInt(categoryId));
    if (!category) {
      return res.status(404).json({ error: "Not Found", message: "Category not found" });
    }
    if (category.type !== type) {
      return res.status(400).json({
        error: "Bad Request",
        message: `Selected category '${category.name}' (${category.type}) does not match transaction type '${type}'`
      });
    }
    if (!transactionDate) {
      return res.status(400).json({ error: "Bad Request", message: "Transaction date is required" });
    }
    if (!paymentMethod) {
      return res.status(400).json({ error: "Bad Request", message: "Payment method is required" });
    }

    const newTransaction = {
      id: transactionIdCounter++,
      name,
      amount: parseFloat(amount),
      type,
      category,
      transactionDate,
      description: description || "",
      paymentMethod,
      userId: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    TRANSACTIONS.push(newTransaction);
    res.status(201).json(newTransaction);
  });

  app.get("/api/transactions", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    // Retrieve and parse query params
    const page = parseInt(req.query.page as string) || 0;
    const size = parseInt(req.query.size as string) || 10;
    const sortBy = (req.query.sortBy as string) || "transactionDate";
    const sortDirection = (req.query.sortDirection as string) || "desc";
    const search = (req.query.search as string || "").toLowerCase();
    const type = req.query.type as string;
    const categoryId = req.query.categoryId as string;
    const paymentMethod = req.query.paymentMethod as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;
    const minAmount = req.query.minAmount as string;
    const maxAmount = req.query.maxAmount as string;

    // Filter transactions by owner
    let results = TRANSACTIONS.filter(t => t.userId === user.id);

    // Apply Filters
    if (search) {
      results = results.filter(t => 
        t.name.toLowerCase().includes(search) ||
        (t.description && t.description.toLowerCase().includes(search)) ||
        t.category.name.toLowerCase().includes(search) ||
        t.paymentMethod.toLowerCase().includes(search)
      );
    }
    if (type) {
      results = results.filter(t => t.type === type);
    }
    if (categoryId) {
      results = results.filter(t => t.category.id === parseInt(categoryId));
    }
    if (paymentMethod) {
      results = results.filter(t => t.paymentMethod === paymentMethod);
    }
    if (startDate) {
      results = results.filter(t => t.transactionDate >= startDate);
    }
    if (endDate) {
      results = results.filter(t => t.transactionDate <= endDate);
    }
    if (minAmount) {
      results = results.filter(t => t.amount >= parseFloat(minAmount));
    }
    if (maxAmount) {
      results = results.filter(t => t.amount <= parseFloat(maxAmount));
    }

    // Whitelist sort fields to prevent malicious/invalid database query errors
    const allowedSortFields = ["transactionDate", "amount", "name", "id"];
    const verifiedSortBy = allowedSortFields.includes(sortBy) ? sortBy : "transactionDate";

    // Sorting
    results.sort((a: any, b: any) => {
      let valA = a[verifiedSortBy];
      let valB = b[verifiedSortBy];

      if (verifiedSortBy === "amount") {
        return sortDirection === "asc" ? valA - valB : valB - valA;
      }
      
      // Default string/date sorting
      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    // Pagination
    const totalElements = results.length;
    const totalPages = Math.ceil(totalElements / size);
    const startIndex = page * size;
    const paginatedContent = results.slice(startIndex, startIndex + size);

    res.status(200).json({
      content: paginatedContent,
      page,
      size,
      totalElements,
      totalPages,
      first: page === 0,
      last: page >= totalPages - 1 || totalPages === 0,
      sortBy: verifiedSortBy,
      sortDirection
    });
  });

  app.get("/api/transactions/:id", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const id = parseInt(req.params.id);
    const trans = TRANSACTIONS.find(t => t.id === id && t.userId === user.id);
    if (!trans) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        error: "Not Found",
        message: `Transaction not found with id: ${id}`,
        path: `/api/transactions/${id}`
      });
    }
    res.status(200).json(trans);
  });

  app.put("/api/transactions/:id", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const id = parseInt(req.params.id);
    const index = TRANSACTIONS.findIndex(t => t.id === id && t.userId === user.id);
    if (index === -1) {
      return res.status(404).json({ error: "Not Found", message: `Transaction not found with id: ${id}` });
    }

    const { name, amount, type, categoryId, transactionDate, description, paymentMethod } = req.body;

    // Validate edit
    if (!name || name.trim() === "") {
      return res.status(400).json({ message: "Transaction name is required" });
    }
    if (amount === undefined || amount <= 0) {
      return res.status(400).json({ message: "Amount must be greater than zero" });
    }
    if (!type || (type !== "INCOME" && type !== "EXPENSE")) {
      return res.status(400).json({ message: "Valid type is required" });
    }
    const category = CATEGORIES.find(c => c.id === parseInt(categoryId));
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    if (category.type !== type) {
      return res.status(400).json({
        message: `Category '${category.name}' type does not match transaction type '${type}'`
      });
    }
    if (!transactionDate) {
      return res.status(400).json({ message: "Transaction date is required" });
    }
    if (!paymentMethod) {
      return res.status(400).json({ message: "Payment method is required" });
    }

    TRANSACTIONS[index] = {
      ...TRANSACTIONS[index],
      name,
      amount: parseFloat(amount),
      type,
      category,
      transactionDate,
      description: description || "",
      paymentMethod,
      updatedAt: new Date().toISOString()
    };

    res.status(200).json(TRANSACTIONS[index]);
  });

  app.delete("/api/transactions/:id", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const id = parseInt(req.params.id);
    const index = TRANSACTIONS.findIndex(t => t.id === id && t.userId === user.id);
    if (index === -1) {
      return res.status(404).json({ error: "Not Found", message: "Transaction not found" });
    }

    TRANSACTIONS.splice(index, 1);
    res.status(204).end();
  });

  // 6. Dashboard Summary API
  app.get("/api/dashboard/summary", (req, res) => {
    const user = getAuthenticatedUser(req);
    if (!user) return res.status(401).json({ error: "Unauthorized" });

    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    // Filter user's transactions
    let userTrans = TRANSACTIONS.filter(t => t.userId === user.id);
    if (startDate) {
      userTrans = userTrans.filter(t => t.transactionDate >= startDate);
    }
    if (endDate) {
      userTrans = userTrans.filter(t => t.transactionDate <= endDate);
    }

    let totalIncome = 0;
    let totalExpense = 0;
    let incomeCount = 0;
    let expenseCount = 0;

    const categoryWiseMap: Record<string, number> = {};
    const monthlyMap: Record<string, { month: string; income: number; expense: number }> = {};

    userTrans.forEach(t => {
      const amt = t.amount;
      if (t.type === "INCOME") {
        totalIncome += amt;
        incomeCount++;
      } else {
        totalExpense += amt;
        expenseCount++;
        // Category aggregations for expenses
        categoryWiseMap[t.category.name] = (categoryWiseMap[t.category.name] || 0) + amt;
      }

      // Group by Month (YYYY-MM)
      const monthStr = t.transactionDate.substring(0, 7); // e.g., "2026-07"
      if (!monthlyMap[monthStr]) {
        monthlyMap[monthStr] = { month: monthStr, income: 0, expense: 0 };
      }
      if (t.type === "INCOME") {
        monthlyMap[monthStr].income += amt;
      } else {
        monthlyMap[monthStr].expense += amt;
      }
    });

    const categoryWiseExpenses = Object.keys(categoryWiseMap).map(name => ({
      categoryName: name,
      amount: Math.round(categoryWiseMap[name] * 100) / 100
    })).sort((a, b) => b.amount - a.amount);

    const monthlySummary = Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month));

    // Get highest expense/income categories
    let highestExpenseCategory = { categoryName: "None", amount: 0 };
    if (categoryWiseExpenses.length > 0) {
      highestExpenseCategory = categoryWiseExpenses[0];
    }

    // Highest Income Category calculation
    const incomeCategoryMap: Record<string, number> = {};
    userTrans.filter(t => t.type === "INCOME").forEach(t => {
      incomeCategoryMap[t.category.name] = (incomeCategoryMap[t.category.name] || 0) + t.amount;
    });
    let highestIncomeCategory = { categoryName: "None", amount: 0 };
    const sortedIncomeCats = Object.keys(incomeCategoryMap).map(name => ({
      categoryName: name,
      amount: Math.round(incomeCategoryMap[name] * 100) / 100
    })).sort((a, b) => b.amount - a.amount);
    if (sortedIncomeCats.length > 0) {
      highestIncomeCategory = sortedIncomeCats[0];
    }

    // Recent Transactions (limit 5)
    const recentTransactions = [...userTrans]
      .sort((a, b) => b.transactionDate.localeCompare(a.transactionDate) || b.id - a.id)
      .slice(0, 5);

    res.status(200).json({
      totalIncome: Math.round(totalIncome * 100) / 100,
      totalExpense: Math.round(totalExpense * 100) / 100,
      balance: Math.round((totalIncome - totalExpense) * 100) / 100,
      totalTransactionCount: userTrans.length,
      incomeTransactionCount: incomeCount,
      expenseTransactionCount: expenseCount,
      highestExpenseCategory,
      highestIncomeCategory,
      categoryWiseExpenses,
      monthlySummary,
      recentTransactions
    });
  });

  // 7. Regular Controller Simulation Endpoint
  // --- VITE AND PUBLIC ASSET HANDLING ---

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express simulation server running on port ${PORT}`);
  });
}

startServer();
