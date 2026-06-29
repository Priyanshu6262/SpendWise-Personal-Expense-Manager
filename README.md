# 💰 SpendWise | Personal Expense Manager

SpendWise is a full-stack **Personal Expense Manager** built with the **MERN Stack** (MongoDB, Express.js, React.js with Vite, and Node.js). It helps users manage their daily finances by tracking income and expenses in one place. The application provides a secure authentication system, an intuitive dashboard, and transaction management features to help users monitor their financial activities efficiently.

This project was built to practice full-stack web development concepts, including authentication, REST APIs, database management, and responsive UI development.

---

# 🚀 Features

* User Registration and Login
* JWT-based Authentication
* Secure Protected Routes
* Dashboard with Financial Summary
* View Total Balance
* Track Total Income
* Track Total Expenses
* Add New Income
* Add New Expense
* Edit Existing Transactions
* Delete Transactions
* View Transaction History
* Search Transactions
* Filter Transactions by Category
* Responsive Design
* Toast Notifications
* Loading Indicators
* Confirmation Dialog Before Deleting Records

---

# 🛠️ Tech Stack

## Frontend

* React.js (Vite)
* Tailwind CSS
* React Router DOM
* Axios

## Backend

* Node.js
* Express.js
* JWT Authentication
* bcrypt
* CORS

## Database

* MongoDB
* Mongoose

---

# 📁 Project Structure

```text
SpendWise/
│
├── client/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── layouts/
│   │   ├── context/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── utils/
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

# ⚙️ Installation

## Clone the Repository

```bash
git clone https://github.com/your-username/spendwise.git

cd spendwise
```

---

## Install Backend Dependencies

```bash
cd server
npm install
```

---

## Install Frontend Dependencies

```bash
cd client
npm install
```

---

# 🔑 Environment Variables

Create a `.env` file inside the `server` folder.

```env
PORT=5000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

CLIENT_URL=http://localhost:5173
```

---

# ▶️ Run the Project

### Start Backend

```bash
cd server
npm run dev
```

### Start Frontend

```bash
cd client
npm run dev
```

Open your browser and visit:

```text
http://localhost:5173
```

---

# 🌐 API Endpoints

## Authentication

| Method | Endpoint           | Description         |
| ------ | ------------------ | ------------------- |
| POST   | /api/auth/register | Register a new user |
| POST   | /api/auth/login    | Login user          |

## Transactions

| Method | Endpoint              | Description           |
| ------ | --------------------- | --------------------- |
| GET    | /api/transactions     | Get all transactions  |
| POST   | /api/transactions     | Add a new transaction |
| PUT    | /api/transactions/:id | Update a transaction  |
| DELETE | /api/transactions/:id | Delete a transaction  |

---

# 🗄️ Database Schema

## User

```javascript
{
  name: String,
  email: String,
  password: String
}
```

## Transaction

```javascript
{
  userId: ObjectId,
  title: String,
  amount: Number,
  type: "income" | "expense",
  category: String,
  date: Date,
  notes: String
}
```

---

# 🔒 Authentication

The application uses **JWT (JSON Web Token)** for secure user authentication.

* User registration with encrypted passwords.
* Passwords are hashed using **bcrypt**.
* JWT tokens are generated after successful login.
* Protected routes require a valid token for access.

---

# 📌 Future Enhancements

* Monthly Expense Reports
* Interactive Charts and Analytics
* Budget Planning
* Export Transactions to CSV
* Export Reports to PDF
* Dark Mode
* Recurring Transactions
* AI Spending Insights
* Email Notifications

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a new feature branch.
3. Commit your changes.
4. Push your branch.
5. Open a Pull Request.

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 👨‍💻 Author

**Priyanshu Kumar**

* LinkedIn: https://linkedin.com/in/i-am-priyanshu
* Portfolio: https://itspriyanshu.me

---

## ⭐ Show Your Support

If you found this project useful, please consider giving it a **Star ⭐** on GitHub. Your support helps the project reach more developers and motivates future improvements.
