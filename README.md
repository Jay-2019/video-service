# Video Service APIs 🎥

A robust REST API service for video file management with features for uploading, trimming, merging, and sharing videos.

<p align="center">
  <a href="#features">Features</a> •
  <a href="#prerequisites">Prerequisites</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#api-documentation">API Docs</a> •
  <a href="#development">Development</a>
</p>

## ✨ Features

- 🔐 **JWT Authentication**
- 📤 **Video Upload** (with size/duration validation)
- ✂️ **Video Trimming**
- 🔄 **Video Merging**
- 🔗 **Shareable Links** (with TTL)
- 📚 **Swagger Documentation**
- 🗄️ **SQLite Database**
- 📦 **Redis Caching**

## 🚀 Prerequisites

### Required Software
- Node.js (v14+)
- npm (v6+)
- Redis Server (v6+)
- FFmpeg

### Windows Installation
```powershell
# Install FFmpeg
choco install ffmpeg

# Install Redis
choco install redis-64

# Start Redis Server
redis-server
```

## 📦 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/Jay-2019/video-service.git
cd video-service
npm install
```

### 2. Environment Setup
Create .env file:
```properties
PORT=3000
JWT_SECRET=video_service_jwt_secret
JWT_ALGORITHM=HS256
USER_ID=SUPER_USER_ID
USER_ROLE=SUPER_ADMIN
MAX_VIDEO_FILE_SIZE=26214400    # 25MB in bytes
MIN_VIDEO_DURATION=5            # seconds
MAX_VIDEO_DURATION=60           # seconds
NODE_ENV=development
FFMPEG_PATH=C:\\ffmpeg\\bin\\ffmpeg.exe
FFPROBE_PATH=C:\\ffmpeg\\bin\\ffprobe.exe
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
SHAREABLE_LINK_TTL=86400       # 24 hours in seconds
```

### 3. Create Required Directories
```bash
mkdir assets/videos
```

### 4. Generate Auth Token
```bash
node generateToken.js
# Copy the generated token for API requests
```

### 5. Start Server
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 📝 API Documentation

### Access Points
- **API Server:** http://localhost:3000
- **Swagger UI:** http://localhost:3000/api-docs

### Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/ping` | Health check |
| POST | `/api/videos/upload` | Upload video |
| POST | `/api/videos/trim` | Trim video |
| POST | `/api/videos/merge` | Merge videos |
| POST | `/api/videos/share/{videoId}` | Create share link |
| GET | `/api/videos/share/{linkId}` | Access shared video |

### Authentication
1. Generate JWT token:
```bash
node generateToken.js
```
2. Use the generated token in API requests:
```http
Authorization: Bearer <your-generated-token>
```

## 📁 Project Structure
```
video-service/
├── assets/
│   └── videos/        # Video storage
├── src/
│   ├── config/       # Configurations
│   ├── constants/    # Constants
│   ├── controllers/  # Controllers
│   ├── database/     # DB config
│   ├── middlewares/  # Middlewares
│   ├── models/       # Models
│   ├── redis/        # Redis config
│   ├── routes/       # Routes
│   ├── services/     # Services
│   └── utils/        # Utilities
├── .env             # Environment vars
├── server.js        # Entry point
└── swagger.json     # API docs
```

## 🛠️ Development

### Running Tests
```bash
npm test
```

### Storage Details
#### 📼 Video Files
- **Location:** 
assets\videos

- **Supported format:** MP4
- **Note:** Manual cleanup required

#### 💾 Database
- SQLite for metadata
- File: database.sqliteStorage Details


#### 🔄 Redis
- Stores shareable links
- TTL management
- Requires running Redis server

### Error Handling
- ✔️ File size validation
- ✔️ Video duration checks
- ✔️ Authentication errors
- ✔️ Video Processing errors
- ✔️ Database/Redis errors

## 📚 References

### Documentation
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Redis Documentation](https://redis.io/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)
- [Express.js Guide](https://expressjs.com/guide/)

### Libraries Used
- [fluent-ffmpeg](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg)
- [sequelize](https://sequelize.org/)
- [redis](https://github.com/redis/node-redis)
- [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## ✍️ Author
Jay Prakash Maurya

## 🔗 Links
- [Repository](https://github.com/Jay-2019/video-service)
- [Issues](https://github.com/Jay-2019/video-service/issues)
```