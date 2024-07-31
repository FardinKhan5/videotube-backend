# Videotube Backend

This repository contains the backend for Videotube, a YouTube-like website for sharing and streaming videos online. The backend is built using Express.js and Mongoose, and includes models and controllers for managing users, videos, comments, subscriptions, likes, playlists, and tweets.

## Features

- User authentication and management
- Video upload and streaming
- Commenting on videos
- Subscriptions to channels
- Liking videos and comments
- Creating and managing playlists
- Posting tweets related to videos

## Technologies Used

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Cloudinary for media storage

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/videotube-backend.git
   cd videotube-backend
2. Install dependencies:
   ```bash
   npm install
3. Create a .env file in the root directory and add the following environment variables:
   ```
   PORT=8000
   CORS_ORIGIN=*
   ACCESS_TOKEN_SECRET=My full name is Fardin Khan
   ACCESS_TOKEN_EXPIRY=1d
   REFRESH_TOKEN_SECRET=My name is Fardin
   REFRESH_TOKEN_EXPIRY=10d
   DATABASE_URI=mongodb://localhost:27017
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
4. Start the server:
   ```bash
   npm run start

## Contributing
   Contributions are welcome! Please fork this repository and submit pull requests for any enhancements or bug fixes.

## License
   This project is licensed under the MIT License. See the LICENSE file for details.