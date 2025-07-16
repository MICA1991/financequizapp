# Finance Quiz Backend API

A comprehensive Node.js/Express backend for the Finance Quiz application with MongoDB/CosmosDB support, JWT authentication, and role-based access control.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access (Student/Admin)
- **Quiz Management**: Multi-level quiz system with 4 difficulty levels
- **Game Sessions**: Track student performance, scores, and analytics
- **Admin Dashboard**: Comprehensive analytics and user management
- **Database Support**: MongoDB with CosmosDB compatibility for Azure deployment
- **Security**: Helmet, CORS, rate limiting, and input validation
- **API Documentation**: Built-in API documentation endpoint

## 📋 Prerequisites

- Node.js 18+ 
- MongoDB (local) or Azure CosmosDB
- npm or yarn

## 🛠️ Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/finance-quiz
   
   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=24h
   
   # Admin Default Credentials
   DEFAULT_ADMIN_USERNAME=admin
   DEFAULT_ADMIN_PASSWORD=admin123
   
   # CORS Configuration
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB** (if using local MongoDB)
   ```bash
   # Start MongoDB service
   mongod
   ```

5. **Seed the database** (optional - for initial data)
   ```bash
   npm run seed
   ```

6. **Start the server**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 🗄️ Database Setup

### Local MongoDB
```bash
# Install MongoDB (Ubuntu/Debian)
sudo apt-get install mongodb

# Start MongoDB service
sudo systemctl start mongodb

# Check status
sudo systemctl status mongodb
```

### Azure CosmosDB
1. Create a CosmosDB account in Azure Portal
2. Create a database and container
3. Get the connection string from Azure Portal
4. Update `.env` file:
   ```env
   MONGODB_URI=mongodb://username:password@host:port/database?ssl=true&replicaSet=globaldb
   ```

## 📊 API Endpoints

### Authentication
- `POST /api/auth/student/login` - Student login
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/profile` - Update user profile (protected)
- `POST /api/auth/logout` - Logout (protected)
- `POST /api/auth/admin/register` - Register new admin (admin only)

### Quiz Management
- `GET /api/quiz/questions/:level` - Get questions by level
- `POST /api/quiz/session/start` - Start game session (student)
- `POST /api/quiz/session/answer` - Submit answer (student)
- `POST /api/quiz/session/complete` - Complete game session (student)
- `GET /api/quiz/history` - Get game history (student)
- `GET /api/quiz/session/:sessionId/report` - Get session report (student)
- `GET /api/quiz/stats` - Get student stats (student)

### Admin Dashboard
- `GET /api/admin/dashboard/overview` - Get dashboard overview (admin)
- `GET /api/admin/students` - Get all students (admin)
- `GET /api/admin/students/:studentId` - Get student details (admin)
- `GET /api/admin/sessions` - Get all game sessions (admin)
- `GET /api/admin/questions/stats` - Get question statistics (admin)
- `POST /api/admin/questions` - Add new question (admin)
- `PUT /api/admin/questions/:itemId` - Update question (admin)
- `DELETE /api/admin/questions/:itemId` - Delete question (admin)
- `GET /api/admin/export` - Export data (admin)

## 🔐 Authentication

### Student Login
```json
POST /api/auth/student/login
{
  "mobileNumber": "9876543210",
  "studentId": "STU001",
  "password": "password123"
}
```

### Admin Login
```json
POST /api/auth/admin/login
{
  "username": "admin",
  "password": "admin123"
}
```

### Using JWT Token
```bash
# Include in request headers
Authorization: Bearer <your-jwt-token>
```

## 🎯 Quiz Levels

1. **Beginner (Level 1)**: Basic financial terms from annual reports
2. **Intermediate (Level 2)**: More specific terms requiring some analysis
3. **Pro (Level 3)**: Complex terms for seasoned report readers
4. **Expert (Level 4)**: Items with dual financial classifications

## 📈 Data Models

### User
- `username` (unique)
- `password` (hashed)
- `role` (student/admin)
- `mobileNumber` (students)
- `studentId` (students)
- `email` (admins)
- `isActive`

### FinancialItem
- `id` (unique)
- `name`
- `category` (single) or `multiCategories` (array)
- `explanation`
- `level` (1-4)
- `difficulty`
- `tags`
- `usageCount`
- `correctAnswerRate`

### GameSession
- `studentId` (reference to User)
- `level`
- `score`
- `totalQuestions`
- `answers` (array of answer objects)
- `startTime`
- `endTime`
- `timeTakenSeconds`
- `feedbackText`
- `performance` (calculated metrics)

## 🚀 Deployment

### Local Development
```bash
npm run dev
```

### Production (Azure)
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Azure App Service**
   - Create Azure App Service
   - Configure environment variables
   - Set up CosmosDB connection
   - Deploy using Azure CLI or GitHub Actions

3. **Environment Variables for Production**
   ```env
   NODE_ENV=production
   MONGODB_URI=<cosmosdb-connection-string>
   JWT_SECRET=<strong-secret-key>
   CORS_ORIGIN=<frontend-url>
   ```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 5000
CMD ["npm", "start"]
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## 📝 Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed database with initial data
- `npm test` - Run tests
- `npm run build` - Build for production

## 🔧 Configuration

### Environment Variables
- `PORT` - Server port (default: 5000)
- `NODE_ENV` - Environment (development/production)
- `MONGODB_URI` - Database connection string
- `JWT_SECRET` - JWT signing secret
- `JWT_EXPIRES_IN` - JWT expiration time
- `CORS_ORIGIN` - Allowed CORS origin
- `DEFAULT_ADMIN_USERNAME` - Default admin username
- `DEFAULT_ADMIN_PASSWORD` - Default admin password

### Rate Limiting
- Default: 100 requests per 15 minutes
- Configurable via environment variables

## 🛡️ Security Features

- **Helmet**: Security headers
- **CORS**: Cross-origin resource sharing
- **Rate Limiting**: Prevent abuse
- **Input Validation**: Express-validator
- **JWT Authentication**: Secure token-based auth
- **Password Hashing**: bcryptjs
- **SQL Injection Protection**: Mongoose ODM

## 📊 Monitoring

### Health Check
```bash
GET /health
```

### API Documentation
```bash
GET /api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🆘 Support

For issues and questions:
1. Check the API documentation at `/api`
2. Review the logs for error details
3. Check database connectivity
4. Verify environment variables

## 🔄 Updates

### Database Migrations
The application uses Mongoose schemas that handle migrations automatically. For major schema changes:

1. Update the model schema
2. Test with existing data
3. Deploy with proper backup

### Adding New Features
1. Create new routes in `src/routes/`
2. Add controllers in `src/controllers/`
3. Update models if needed
4. Add validation middleware
5. Update API documentation 