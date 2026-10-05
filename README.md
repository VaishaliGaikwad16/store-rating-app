# Store Rating Web Application

A full-stack Store Rating Web Application developed as part of a Full Stack Developer coding challenge.

## Tech Stack

* **Frontend:** React.js, Vite
* **Backend:** Node.js, Express.js
* **Database:** MySQL
* **Authentication:** JWT
* **Password Hashing:** bcrypt
* **API:** REST APIs

## User Roles

The application supports three roles:

* System Administrator
* Normal User
* Store Owner

## Features

### System Administrator

* Secure admin login
* Dashboard statistics

  * Total users
  * Total stores
  * Total ratings
* Create users
* Create Store Owner accounts
* Create Administrator accounts
* Create stores
* Assign stores to store owners
* View users and their roles
* View stores, owners, average ratings and rating counts
* Password update
* Logout

### Normal User

* User registration
* User login
* View available stores
* Search stores
* View store address
* View overall store rating
* View own rating
* Submit a rating from 1 to 5
* Modify an existing rating
* Password update
* Logout

### Store Owner

* Owner login
* View owned stores
* View average rating
* View total number of ratings
* View users who rated the store
* View rating and updated date
* Password update
* Logout

## Validation

The application validates the following:

* **Name:** 20–60 characters
* **Address:** maximum 400 characters
* **Email:** valid email format
* **Password:** 8–16 characters with at least one uppercase letter and special character
* **Rating:** value between 1 and 5
* **Duplicate ratings:** one rating per user for each store

## Database

The MySQL database contains three main tables:

### Users

Stores:

* User ID
* Name
* Email
* Password hash
* Address
* Role
* Created date

### Stores

Stores:

* Store ID
* Store name
* Email
* Address
* Owner
* Created date

### Ratings

Stores:

* Rating ID
* User
* Store
* Rating
* Created date
* Updated date

A unique constraint prevents a user from creating multiple ratings for the same store.

## Project Structure

```text
store-rating-app/
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   └── storeController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── authRoutes.js
│   │   └── storeRoutes.js
│   ├── utils/
│   │   └── validation.js
│   ├── .env.example
│   ├── package.json
│   └── server.js
│
├── database/
│   └── schema.sql
│
├── frontend/
│   ├── src/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   └── package.json
│
├── .gitignore
└── README.md
```

## Setup

### 1. Database

Open **MySQL Workbench** and execute:

```sql
database/schema.sql
```

This creates the `store_rating_db` database and the required tables.

### 2. Backend

Open a terminal in the project directory:

```bash
cd backend
npm install
```

Create a `.env` file using `.env.example` as a reference:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=YOUR_MYSQL_PASSWORD
DB_NAME=store_rating_db
DB_PORT=3306
JWT_SECRET=YOUR_SECRET_KEY
PORT=5000
```

Start the backend:

```bash
npm start
```

The backend runs on:

```text
http://localhost:5000
```

### 3. Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

## Creating the First Administrator

New users registered through the application are created with the `USER` role.

For local testing, the first administrator can be created by registering a user and then changing the role in MySQL:

```sql
USE store_rating_db;

UPDATE users
SET role = 'ADMIN'
WHERE email = 'your-email@example.com';
```

Log out and log in again after changing the role.

The administrator can then create additional users, store owners and stores through the application.

## Authentication and Security

* Passwords are securely hashed using **bcrypt**.
* JWT is used for authentication.
* Protected routes require authentication.
* Role-based authorization is implemented.
* Database credentials are stored in `.env`.
* `.env` is excluded from Git.
* Plain-text passwords are never stored in the database.

## Testing

The application has been tested locally for:

* User registration and login
* Admin login
* Store creation
* Store owner assignment
* Owner login
* Rating submission
* Rating modification
* Average rating calculation
* Owner rating-user information
* Password update
* Logout
* Role-based dashboards
* MySQL database integration
* Input validation

## Important

Do not commit the `.env` file, database password, JWT secret, or any other credentials to GitHub.

This project is intended to be run locally using React, Node.js, Express.js and MySQL.
