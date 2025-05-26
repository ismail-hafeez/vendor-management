# Vendor Management System

A simple **Node.js** + **Express** application for managing vendors, built with a MySQL back‑end and server‑side rendering.

## 📂 Repository Structure

vendor-management/
├── .vscode/ # VSCode workspace settings
├── SQL Scripts/ # Database schema & seed scripts
├── views/ # EJS templates for server‑rendered pages
├── app.js # Main application entry point
├── package.json # npm dependencies & scripts
└── package-lock.json # npm lockfile


## 🛠️ Technologies

- **Node.js**  
- **Express** (web framework)  
- **EJS** (templating engine)  
- **MySQL** (database)

## 🚀 Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/ismail-hafeez/vendor-management.git
cd vendor-management

```

### 2. Install dependencies
npm install

### 3. Configure your database
Create a MySQL database (e.g. vendor_mgmt).

From your MySQL client, run the SQL scripts in SQL Scripts/ in order:

SOURCE SQL Scripts/schema.sql;
SOURCE SQL Scripts/seed-data.sql;

### 4. Create a .env file in the root directory and add your database credentials:
DB_HOST=localhost
DB_USER=root
DB_PASS=your_password
DB_NAME=vendor_mgmt
PORT=3000

### 5. Run the app
Run the app

