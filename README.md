# MERN Stack Blog Platform

A full-stack blog platform built with MongoDB, Express.js, React, and Node.js, featuring Firebase authentication and real-time commenting system.

## Features

- **Authentication**: User registration and login with Firebase Auth
- **Post Management**: Create, read, update, and delete blog posts
- **Comment System**: Add, edit, and delete comments on posts
- **Responsive Design**: Mobile-friendly interface
- **Author Authorization**: Users can only edit/delete their own posts and comments
- **Real-time Updates**: Dynamic content loading without page refreshes

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling

### Frontend
- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Firebase Auth** - Authentication service

## Project Structure

```
blog-platform/
├── backend/
│   ├── controllers/
│   │   ├── commentController.js
│   │   └── postController.js
│   ├── models/
│   │   ├── Comment.js
│   │   └── Post.js
│   ├── routes/
│   │   ├── commentRoutes.js
│   │   └── postRoutes.js
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── CommentBox.js
│   │   │   ├── Navbar.js
│   │   │   └── PostCard.js
│   │   ├── pages/
│   │   │   ├── CreatePost.js
│   │   │   ├── EditPost.js
│   │   │   ├── Home.js
│   │   │   ├── Login.js
│   │   │   └── SinglePost.js
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── firebase.js
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- Firebase project (for authentication)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables**:
   ```env
   MONGODB_URI=mongodb://localhost:27017/blog-platform
   PORT=5000
   NODE_ENV=development
   ```

5. **Start MongoDB** (if running locally):
   ```bash
   mongod
   ```

6. **Start the server**:
   ```bash
   npm run dev
   ```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   touch .env
   ```

4. **Configure Firebase**:
   - Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication with Email/Password
   - Copy your Firebase config to `src/firebase.js`

5. **Update environment variables**:
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   ```

6. **Start the development server**:
   ```bash
   npm start
   ```

The frontend will run on `http://localhost:3000`

## Firebase Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication → Sign-in method → Email/Password
4. Go to Project Settings → General → Your apps
5. Add a web app and copy the config
6. Update `frontend/src/firebase.js` with your config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};
```

## API Endpoints

### Posts
- `GET /api/posts` - Get all posts
- `GET /api/posts/:id` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/posts/author/:authorId` - Get posts by author

### Comments
- `GET /api/comments/post/:postId` - Get comments for a post
- `GET /api/comments/:id` - Get single comment
- `POST /api/comments` - Create new comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment
- `GET /api/comments/author/:authorId` - Get comments by author

## Usage

### Creating Posts
1. Sign up or log in to your account
2. Click "Create Post" in the navigation
3. Fill in the title and content
4. Click "Create Post" to publish

### Commenting
1. Navigate to any blog post
2. Scroll down to the comments section
3. Write your comment and click "Add Comment"
4. Edit or delete your own comments using the action buttons

### Managing Content
- Only post authors can edit or delete their posts
- Only comment authors can edit or delete their comments
- All content is automatically timestamped

## Development

### Available Scripts

#### Backend
```bash
npm start        # Start production server
npm run dev      # Start development server with nodemon
```

#### Frontend
```bash
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
```

### Database Schema

#### Post Model
```javascript
{
  title: String,        // Required
  content: String,      // Required
  authorId: String,     // Firebase UID
  createdAt: Date,      // Auto-generated
  updatedAt: Date       // Auto-updated
}
```

#### Comment Model
```javascript
{
  postId: ObjectId,     // Reference to Post
  authorId: String,     // Firebase UID
  content: String,      // Required
  createdAt: Date,      // Auto-generated
  updatedAt: Date       // Auto-updated
}
```

## Deployment

### Backend Deployment (Heroku)
1. Create a Heroku app
2. Set environment variables in Heroku dashboard
3. Connect your GitHub repository
4. Deploy from main branch

### Frontend Deployment (Netlify/Vercel)
1. Build the project: `npm run build`
2. Upload the `build` folder to your hosting service
3. Configure environment variables
4. Set up redirects for React Router

### Database (MongoDB Atlas)
1. Create a MongoDB Atlas account
2. Create a cluster and database
3. Get your connection string
4. Update `MONGODB_URI` in your environment variables

## Environment Variables

### Backend (.env)
```env
MONGODB_URI=mongodb://localhost:27017/blog-platform
PORT=5000
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id
```

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Make sure the frontend URL is added to CORS configuration
   - Check that API_URL is correctly set in frontend

2. **Authentication Issues**
   - Verify Firebase configuration
   - Ensure Firebase Authentication is enabled
   - Check that environment variables are properly set

3. **Database Connection**
   - Verify MongoDB is running (if local)
   - Check MongoDB connection string
   - Ensure database permissions are correct

4. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check for version compatibility issues
   - Ensure all required environment variables are set

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Create a Pull Request

## License

This project is licensed under the ISC License.

## Future Enhancements

- [ ] User profiles and avatars
- [ ] Rich text editor for posts
- [ ] Image upload functionality
- [ ] Post categories and tags
- [ ] Search functionality
- [ ] Email notifications
- [ ] Social media sharing
- [ ] Dark mode theme
- [ ] SEO optimization
- [ ] Admin dashboard

## Support

For support, please open an issue in the GitHub repository or contact the development team.