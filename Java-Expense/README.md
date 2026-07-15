# ☕ Java-Expense: Full-Stack Expense Tracker & Spring Boot Learning Kit

Welcome to **Java-Expense**, a production-grade full-stack personal finance and transaction ledger application! 

This repository serves a dual purpose:
1. It functions as a complete, working CRUD expense tracker featuring modern dashboard charts, paginated ledgers, dynamic category alignments, and profile settings.
2. It is designed as a **comprehensive, hands-on Spring Boot curriculum guide** to take developers from beginner-level concepts to advanced backend engineering patterns (such as JPA specifications, Spring Security 6, stateless JWT token cookies, and stateful sessions).

---

## 📂 Project Directory Structure

We adhere to a clean separation of concerns with isolated folders for backend code, frontend files, database seeding scripts, and API test suites:

```text
Java-Expense/
├── frontend/             # React (Vite) User Interface (Single-page app with Recharts & Tailwind)
├── backend/              # Java 17 Spring Boot Maven Application
│   ├── pom.xml           # Maven Dependencies (Security, JPA, Validation, Lombok, JWT)
│   └── src/main/java/com/hetarth/expensetracker/
│       ├── JavaExpenseApplication.java # Spring Boot entry-point
│       ├── controller/   # REST Controllers (@RestController mappings & HTTP payload parsing)
│       ├── service/      # Business Logic Layer (BCrypt hashing, Category matching, DTO converts)
│       ├── repository/   # Data Access Layer (Spring Data JPA interfaces & custom JPQL queries)
│       ├── entity/       # Domain Models (User, Category, Transaction mapped to MySQL)
│       ├── dto/          # Data Transfer Objects (Payload models for request/response validation)
│       ├── security/     # JwtTokenProvider, OncePerRequestFilter, SecurityFilterChain configs
│       ├── exception/    # Custom Exceptions & GlobalExceptionHandlers
│       └── specification/# Dynamic multi-variable filters using JPA Criteria API
├── database/             # Relational MySQL Schema DDL & seed queries
│   └── expense_tracker.sql
├── postman/              # Ready-to-import Postman testing suites
│   ├── Java-Expense.postman_collection.json
│   └── Java-Expense-Local.postman_environment.json
└── README.md             # This comprehensive educational & deployment guide
```

---

## 🛠️ Technology Stack

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend UI** | React 18, Vite, Tailwind CSS, Lucide Icons, Motion | Clean responsive layout, visual dashboards |
| **Routing & API** | React Router DOM, Axios (with Credentials) | Dynamic navigation, session-retaining network calls |
| **Charts** | Recharts (Responsive Container) | Category expense breakdowns, monthly trend lines |
| **Backend Core** | Java 17, Spring Boot 3.2+ | Robust enterprise application container |
| **Data Access** | Spring Data JPA, Hibernate, Criteria API | Automated SQL mappings, type-safe queries |
| **Database** | MySQL 8.x / MariaDB | Durable transactional relational storage |
| **Security** | Spring Security 6, JWT, BCrypt, HttpOnly Cookies | Stateless session auth, password encryption |
| **Validation** | Jakarta Bean Validation (`@Valid`) | Payload format assertions |

---

## 🧠 Spring Boot Curriculum & Core Architectural Patterns

### 1. The Three-Tier Layered Architecture
In Spring Boot, we route data through distinct layers to keep the codebase modular, testable, and maintainable:
```text
[ Client (Browser) ]
        │  (HTTP Request with Cookie)
        ▼
[ Security Filter Chain ]  ──► Validates JWT in java_expense_token cookie
        │  
        ▼
[ REST Controller ]        ──► Intercepts endpoints, validates payload structures (@Valid)
        │
        ▼
[ Business Service ]       ──► Coordinates rules, checks category types, hashes passwords
        │
        ▼
[ Repository (DAO) ]       ──► Generates SQL dynamically via Spring Data JPA queries
        │
        ▼
[ Relational MySQL ]       ──► Performs transaction commits, queries tables
```

### 2. Dependency Injection (DI) & Inversion of Control (IoC)
In vanilla Java, you instantiate objects manually: `AuthService authService = new AuthService()`. This introduces tight coupling.
In Spring Boot, we use **Inversion of Control (IoC)**: the framework initializes, manages, and destroys objects (called **Beans**) inside its context.
* We mark classes with stereotypes: `@Component`, `@Service`, `@Repository`, or `@RestController`.
* We inject dependencies using **Constructor Injection** (best practice for testing and immutability) or `@Autowired`.

### 3. Java Database Connectivity (JDBC) vs. ORM (Hibernate/JPA)
* **Traditional JDBC**: Requires writing verbose boilerplate code to open connections, map statements, execute result sets, and close resources.
* **ORM (Object-Relational Mapping)**: Bridges the gap between OOP languages (Java classes) and relational tables (SQL tables).
* **Hibernate** implements the **JPA (Jakarta Persistence API)** spec. We define models like `User` or `Transaction` using annotations (`@Entity`, `@Table`, `@ManyToOne`), and Spring Boot handles database table reads, writes, and schema modifications behind the scenes.

### 4. Advanced: JPA Specifications (Criteria API)
For simple queries, we use Spring Data's *Derived Query Methods* (e.g. `findByType(TransactionType type)`).
However, our transaction ledger has **8 optional filters** (search, type, min/max amounts, start/end dates, payment methods, category IDs). Writing custom SQL for $2^8 = 256$ different parameter combinations is impossible.
* We implement `Specification<Transaction>` in `/specification/TransactionSpecification.java`.
* It uses the Hibernate **CriteriaBuilder** to dynamically add SQL predicates (`cb.equal`, `cb.greaterThanOrEqualTo`, `cb.like`) to the `WHERE` clause based on which values are provided in the HTTP request.

---

## 🔒 Security Architecture: Stateless JWT vs. Stateful HttpSession

### 1. Stateless Cookie-Based JWT (Default Auth Flow)
To ensure high scalability across distributed container clouds, our main authentication flow is **stateless**:
1. When a user logs in, `AuthService` verifies credentials and compiles a **JSON Web Token (JWT)** containing their username.
2. The server signs this token with a cryptographically secure key (`HMAC-SHA256`).
3. The token is sent to the client inside an **HttpOnly, Secure Cookie** called `java_expense_token`.
4. *Security advantage*: `HttpOnly` cookies are inaccessible to JavaScript scripts, protecting your session from Cross-Site Scripting (XSS) token-stealing attacks.
5. The server stores ZERO state in memory. For every request, `JwtAuthenticationFilter` intercepts the cookie, verifies the cryptographic signature, and populates the local `SecurityContextHolder`.

### 2. Stateful HttpSession Sandbox (Educational Sandbox Module)
To teach legacy servlet architectures, we implemented a separate stateful tracking module:
* Accessible via `/session` in the app, or `/api/session/*` on the backend.
* **Traditional HttpSession** allocates memory on the server side (RAM/Database) and sends a random string key called a `JSESSIONID` to the browser's cookie jar.
* The client sends only this random pointer ID, and the server runs a lookup inside its session catalog to fetch session variables (like the visit counter).
* This provides a clear, hands-on environment to compare stateful vs. stateless architecture.

---

## 🚀 Setting Up the Application

### Prerequisites
* **Java Development Kit (JDK) 17** installed.
* **Node.js** (v18+) and **npm** installed.
* **MySQL Database Server** (v8.x+) running locally or on a cloud instance.

### Step 1: Database Initialization
1. Open your terminal or MySQL Workbench, log into your server, and run the schema file:
   ```bash
   mysql -u root -p < database/expense_tracker.sql
   ```
2. This creates the `expense_tracker` schema, establishes correct foreign key constraints, and seeds **15 predefined categories** alongside a sample student user.

### Step 2: Configure and Boot the Spring Boot Backend
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Open `src/main/resources/application.properties` and edit your database credentials:
   ```properties
   spring.datasource.username=root
   spring.datasource.password=YourSecurePasswordhere
   ```
3. Compile and boot the application using the Maven wrapper:
   ```bash
   # On macOS/Linux:
   ./mvnw spring-boot:run
   
   # On Windows:
   mvnw.cmd spring-boot:run
   ```
4. The backend boots on **port `8080`**.

### Step 3: Launch the React Frontend
1. Navigate to the frontend folder:
   ```bash
   cd ../frontend
   ```
2. Install the necessary node packages:
   ```bash
   npm install
   ```
3. Spin up the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the displayed URL (typically `http://localhost:5173`) in your browser.

---

## 🧪 Testing with Postman
1. Open **Postman**.
2. Click **Import** and select the two files inside the `postman/` directory.
3. Select the **Java-Expense - Local** environment from the top-right menu.
4. Run requests inside the **01. Authentication** folder to log in, register, and experience cookie-based JWT authorization in real-time.
