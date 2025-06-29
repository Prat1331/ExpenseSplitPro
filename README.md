💸 ExpenseSplitPro
Smart expense splitting made easy — just click a bill or scan a QR code and split payments with your friends!

🚀 Overview
ExpenseSplitPro is a full-stack web application that simplifies expense management among friends. You can:

📸 Click a picture of a bill or scan a QR code

🤝 Split the amount automatically with added friends

🔐 Use secure login/signup functionality

💳 Pay and settle bills via Razorpay integration

📱 Add friends by phone number (accesses your contact list securely)

Whether you're dining out or planning a trip, ExpenseSplitPro helps you split the bill without the headache.

🧠 Features
✅ Smart OCR Bill Scanning

✅ QR Code Payment Splitting

✅ Secure Login & Signup

✅ Friend Management via Phone Number

✅ Razorpay Payment Integration

✅ Real-time Notifications & Expense Tracking

✅ Fully Responsive Frontend (React + Tailwind)

🛠️ Tech Stack
Frontend:

React (Vite)

Tailwind CSS

React Query

Wouter (Routing)

Backend:

Node.js + Express

MongoDB

JWT Authentication

Razorpay API

Multer / Tesseract.js (for image/QR processing)

Deployment:

Railway (Backend): https://expensesplitpro-production.up.railway.app

Vercel/Netlify (Frontend): [Add your deployed frontend link]

📦 Setup Instructions
1. Clone the Repository
bash
Copy
Edit
git clone https://github.com/yourusername/ExpenseSplitPro.git
cd ExpenseSplitPro
2. Setup Frontend
bash
Copy
Edit
cd client
npm install
npm run dev
3. Setup Backend
bash
Copy
Edit
cd server
npm install
# Add your .env file here with Razorpay keys and Mongo URI
npm run dev
4. Environment Variables (.env example)
ini
Copy
Edit
PORT=5000
MONGO_URI=your_mongo_connection_string
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_SECRET=your_secret
JWT_SECRET=your_jwt_secret
🔐 Razorpay Test Credentials
If you're contributing or testing, use Razorpay's test credentials.

📸 Demo
![Screenshot 2025-06-29 193216](https://github.com/user-attachments/assets/6fde90c5-f550-40e3-82c8-214328fa75c2)
![Screenshot 2025-06-30 001537](https://github.com/user-attachments/assets/4819b197-71d0-47c5-bb47-cec604919aae)
![Screenshot 2025-06-30 001612](https://github.com/user-attachments/assets/76df5e5a-c0b7-4970-8695-c45d6a1b3ede)
![Screenshot 2025-06-30 001634](https://github.com/user-attachments/assets/4751f3c6-fe93-401a-bddd-6b6b4f700bca)
![Screenshot 2025-06-30 001656](https://github.com/user-attachments/assets/0be94527-c29f-4f7e-b865-c77b8be4db58)



📌 TODOs
 Group Expense Support

 OCR Accuracy Improvements

 Email Notifications

 PWA Support for Offline Splits

🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you'd like to change.

📄 License
This project is licensed under the MIT License.

🙏 Acknowledgements
Razorpay API

Tesseract.js (OCR)

Vite, React & Tailwind Community
