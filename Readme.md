# 🏨 Hotel Management System

A full-stack Hotel Management System built with **React** for the frontend and **Django** (with Django REST Framework) for the backend.

---

## 🗂️ Project Structure

```
hotel-management-system/
├── frontend/   # React application (UI for managers and customers)
├── backend/    # Django backend (API and business logic)
└── README.md   # Project overview
```

---

## 🚀 Tech Stack

- **Frontend**: React, Axios, React Router
- **Backend**: Django, Django REST Framework, JWT (SimpleJWT)
- **Database**: SQLite (can switch to PostgreSQL)
- **Authentication**: JWT (JSON Web Tokens)
- **Image Handling**: Pillow
- **CORS**: django-cors-headers

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Dharmesh-Padhra/Hotel-Property-Management-System.git
cd hotel-management-system
```

---

## 🛠 Backend Setup (`/backend`)

### ✅ Requirements

- Python 3.9+
- pip
- virtualenv (recommended)

### 📦 Install Dependencies

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 🔐 Setup Environment Variables

```bash
cp .env.example .env
```

Update `.env` with your actual config (secret key, debug, etc.)

### 🔃 Run Migrations and Start Server

```bash
python manage.py migrate
python manage.py runserver
```

Backend will run at: `http://127.0.0.1:8000/`

---

## 🌐 Frontend Setup (`/frontend`)

### 📦 Install Dependencies

```bash
cd ../frontend
npm install
```

### 🔐 Setup Environment Variables

```bash
cp .env.example .env
```

Update `REACT_APP_API_URL` in `.env` to match your backend URL.

### 🚀 Start Development Server

```bash
npm start
```

Frontend will run at: `http://localhost:3000/`

---

## 📌 Features

- 🔐 User authentication using JWT
- 🛏️ Room management
- 📆 Booking system
- 👥 Staff and customer roles
- 📊 Dashboard with basic analytics
- 🖼️ Media/image support for hotel listings
- 🌍 CORS-enabled API for frontend-backend interaction

---

## 📁 Environment Configuration

Each part of the project includes a `.env.example` file for environment variables.
Make sure to rename it to `.env` and update accordingly.

---

## 🧪 Testing

- Backend: Use tools like Postman or `curl` for API testing
- Frontend: Check routes, forms, and role-based pages manually or with testing libs

---

## 📃 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Dharmesh Padhra**  
Made with ❤️ by a passionate developer.

---

## 🤝 Contributing

Pull requests are welcome! If you have ideas or feature suggestions, feel free to open an issue.

