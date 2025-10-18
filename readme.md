---
## ⚙️ Requirements
- Node.js v20 or later
- MySQL (from XAMPP / MariaDB)
- npm package `mysql2`
---

## 🧠 Database Schema

Automatically created when the backend starts:

| Column        | Type                           | Description        |
| ------------- | ------------------------------ | ------------------ |
| `patientid`   | INT AUTO_INCREMENT PRIMARY KEY | Unique ID          |
| `name`        | VARCHAR(100)                   | Patient name       |
| `dateOfBirth` | DATETIME                       | Patient birth date |

Database name: **`lab5db`**  
Table name: **`patient`**

---

## ⚙️ Installation & Setup

### 🪟 1. Start MySQL in XAMPP

1. Open **XAMPP Control Panel**
2. Click **Start** next to **MySQL**
3. Ensure `http://localhost/phpmyadmin` opens successfully

> ⚠️ If MySQL fails to start, free port 3306 using  
> `netstat -ano | findstr 3306` and `taskkill /PID <number> /F`.

---

### 🧩 2. Configure the Backend (Server 2)

1. Open a terminal in  
   `C:\Users\user\OneDrive\Desktop\CST\Comp 4537\T13lab5\server2`
2. Initialize dependencies
   ```bash
   npm install
   Confirm dbconfig.js contains:
   ```

js

export const DB_CONFIG = {
host: "localhost",
port: 3306,
user: "root",
password: "", // blank for XAMPP default
database: "lab5db"
};
Start the server:

bash
node server.js
You should see:

arduino
Copy code
✅ Database & table ready
🚀 Server2 running on http://localhost:5000
🌐 3. Launch the Client (Server 1)
Open server1/index.html in your browser
—or—
use VS Code Live Server to serve it at
http://127.0.0.1:5500/server1/index.html

Make sure the script in index.html points to your backend URL:

js
Copy code
const SERVER_URL = "http://localhost:5000";
🧪 Testing
➕ Insert Default Patients
Click Insert Default Patients
→ adds:

bash
Copy code
('Sara Brown', '1901-01-01'),
('John Smith', '1941-01-01'),
('Jack Ma', '1961-01-30'),
('Elon Musk', '1999-01-01')
🔍 Run SQL Queries
In the textarea, type:

sql
Copy code
SELECT \* FROM patient;
Click Send Query

JSON results display below the buttons.

⚠️ Security
The backend rejects any query containing DROP, DELETE, or UPDATE.

Only SELECT and INSERT statements are accepted.
