# 💸 ExpenseSplitPro

**Smart expense splitting made easy — just click a bill or scan a QR code and split payments with your friends!**

---

## 🚀 Overview

**ExpenseSplitPro** is a full-stack web application that simplifies expense management among friends. Whether you're dining out or traveling, the app lets you:

* 📸 Capture or upload a bill using OCR
* 🤝 Split the amount automatically with added friends
* 🔐 Log in securely with JWT authentication
* 💳 Pay and settle bills via Razorpay integration
* 📱 Add friends via phone number (securely accessing contacts)
* ☁️ Host and store data on **AWS Cloud** for scalability

---

## 🧠 Features

✅ Smart OCR Bill Scanning (Tesseract.js + Multer)
✅ QR Code Payment Splitting
✅ Secure Login & Signup
✅ Friend Management via Phone Number
✅ Razorpay Payment Gateway Integration
✅ Real-time Notifications & Expense Tracking
✅ Fully Responsive Frontend (React + Tailwind)
✅ Deployed and Monitored on **AWS EC2 + S3 + CloudWatch**
✅ Dockerized for Scalable Deployment

---

## 🛠️ Tech Stack

### **Frontend**

* React (Vite)
* Tailwind CSS
* React Query
* Wouter (Routing)

### **Backend**

* Node.js + Express
* MongoDB (Mongoose ORM)
* JWT Authentication
* Razorpay API
* Multer / Tesseract.js (for image and QR processing)

### **DevOps & Cloud**

* AWS EC2 (Backend Deployment)
* AWS S3 (Bill Image Storage)
* Docker (Containerized Backend)
* AWS CLI (Automation)
* Linux (Ubuntu Instance)
* Git + GitHub (Version Control)
* PM2 (Node Process Manager)

---

## ☁️ Cloud & DevOps Integration

### **AWS EC2 Deployment**

* Deployed backend on AWS EC2 (Ubuntu) using Linux terminal and AWS CLI.
* Configured security groups and SSH access for Node.js server.
* Used **PM2** to maintain uptime and process management.

### **AWS S3 for Storage**

* Integrated AWS S3 to store uploaded bill images securely.
* Configured IAM user with least-privilege access for file uploads.

### **Dockerization**

* Built a Dockerfile for the backend and ran the app inside a container for easy deployment.
* Published the image to Docker Hub for reusability.

### **Git & GitHub**

* Followed a feature-branch workflow (`feature/aws-deployment`) with commits and pull requests.
* Managed project updates through GitHub Actions and CI/CD readiness.

---

## ⚙️ Setup Instructions

### **Clone the Repository**

```bash
git clone https://github.com/Prat1331/ExpenseSplitPro.git
cd ExpenseSplitPro
```

### **Frontend Setup**

```bash
cd client
npm install
npm run dev
```

### **Backend Setup**

```bash
cd server
npm install
```

Add your `.env` file (see below), then run:

```bash
npm run dev
```

---

## 🔑 Environment Variables

Create a `.env` file inside the **server/** folder with the following values:

```ini
PORT=5000
MONGO_URI=your_mongo_connection_string
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_SECRET=your_secret
JWT_SECRET=your_jwt_secret
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
S3_BUCKET_NAME=expensesplitpro-bills
AWS_REGION=ap-south-1
```

---

## 🧰 Docker Setup

```bash
# Build Docker image
docker build -t expensesplitpro-backend .

# Run container
docker run -p 5000:5000 expensesplitpro-backend
```

(Optional) Push to Docker Hub:

```bash
docker tag expensesplitpro-backend prat1331/expensesplitpro
docker push prat1331/expensesplitpro
```

---

## 🌍 Deployment Links

**Backend (Railway / AWS EC2):** [https://expensesplitpro-production.up.railway.app](https://expensesplitpro-production.up.railway.app)
**Frontend (Vercel/Netlify):** [Add your deployed frontend link here]

---

## 📈 Future Enhancements

* 🔄 Add expense groups with automatic sharing logic
* 📊 Dashboard analytics for spending trends
* ☁️ Implement AWS CloudTrail for audit logging
* 💬 Integrate real-time chat using WebSockets

---




📸 Demo
![Screenshot 2025-06-29 193216](https://github.com/user-attachments/assets/6fde90c5-f550-40e3-82c8-214328fa75c2)
![Screenshot 2025-06-30 001537](https://github.com/user-attachments/assets/4819b197-71d0-47c5-bb47-cec604919aae)
![Screenshot 2025-06-30 001612](https://github.com/user-attachments/assets/76df5e5a-c0b7-4970-8695-c45d6a1b3ede)
![Screenshot 2025-06-30 001634](https://github.com/user-attachments/assets/4751f3c6-fe93-401a-bddd-6b6b4f700bca)
![Screenshot 2025-06-30 001656](https://github.com/user-attachments/assets/0be94527-c29f-4f7e-b865-c77b8be4db58)



## 👨‍💻 Author

**Pratham Gera**

* 🌐 [LinkedIn](https://linkedin.com/in/pratham-gera-0b3002252)
* 💻 [GitHub](https://github.com/Prat1331)
* ✉️ [pratham13.gera@gmail.com](mailto:pratham13.gera@gmail.com)

---

### ⭐ If you like this project, consider giving it a star on GitHub!

> *ExpenseSplitPro – Simplifying shared expenses, powered by AI and Cloud.*

📄 License
This project is licensed under the MIT License.

🙏 Acknowledgements
Razorpay API

Tesseract.js (OCR)

Vite, React & Tailwind Community
