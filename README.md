# PixelPals

PixelPals is a social media platform designed to connect users through engaging interactions, real-time chat, and AI-powered text suggestions. Built using the MERN stack, it offers a seamless experience with modern UI and smooth state management.

## 🚀 Features
- **Authentication & Reset Password**
- **Create/Delete Posts**
- **Like/Unlike & Add/Remove Comments**
- **Follow/Unfollow & Follow Requests**
- **Notifications (Likes, Unlikes, Follow Request Actions)**
- **Private Account Option**
- **Delete Account**
- **Real-time Chat (Sockets) with Instant Notifications**
- **Message Seen/Unseen & Online Status**
- **Profile Updates (DP, Bio, etc.)**
- **Send Pictures in Chat**
- **AI-Based Text Suggestions (Cohere) Based on Mood**

## 🌍 Live Demo
Check out the live version of **PixelPals** here:
🔗 **[PixelPals Live](https://pixelpals.onrender.com/auth)**

## 🛠 Tech Stack
- **Frontend:** React, Chakra UI, Tailwind CSS, Recoil
- **Backend:** Node.js, Express.js, MongoDB
- **Authentication:** JWT
- **Real-time Communication:** Socket.io
- **AI Features:** Cohere API
- **Deployment:** Render

## 📦 Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/jashwamt-jaladi/pixelpals.git
   cd pixelpals
   ```
2. Install dependencies:
   ```sh
   npm install
   ```
3. Set up environment variables in a `.env.local` file:
   ```plaintext
   PORT=4000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   COHERE_API_KEY=your_cohere_api_key
   EMAIL_USER=your_email_addres
   EMAIL_PASSWORD=your_email_password
   CLIENT_URL=http://localhost:3000
   ```
   ⚠️ **Important:** Never commit this file to a public repository. Add `.env.local` to your `.gitignore` file to keep your credentials secure.

4. Run the development server:
   ```sh
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📸 Screenshots
*(Add relevant screenshots of the app here)*

## 🚀 Deployment
The application is deployed on **Render**. To deploy your own version:
1. Push your changes to GitHub.
2. Connect your repository to Render.
3. Set up environment variables on Render.
4. Deploy and get a live link.

## 📜 License
This project is open-source and available under the MIT License.

## 🙌 Contributing
Feel free to contribute by opening an issue or submitting a pull request.

## 📞 Contact
For any inquiries or feedback, reach out to me via [your email or social links].

