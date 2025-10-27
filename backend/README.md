# Student Dashboard Backend

A comprehensive backend API for a student interview practice platform built with Node.js, Express, and MongoDB.

## 🚀 Features

- **User Authentication**: JWT-based authentication with role-based access control
- **User Management**: Support for students, instructors, and administrators
- **Course Management**: Create and manage coding courses
- **Coding Questions**: Practice questions with different difficulty levels
- **Interview Attempts**: Track student practice sessions with scoring
- **Transcripts**: Audio transcription and interview analysis
- **Security**: Rate limiting, input validation, and security headers
- **Database Seeding**: Sample data for development

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Development**: Nodemon for hot reloading

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd project2/backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   
   Copy the example environment file:
   ```bash
   copy .env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGO_URI=mongodb://localhost:27017/student-dash
   JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system. If using MongoDB locally:
   ```bash
   mongod
   ```

5. **Seed the Database (Optional)**
   ```bash
   npm run seed
   ```

6. **Start the Server**
   
   Development mode (with hot reloading):
   ```bash
   npm run dev
   ```
   
   Production mode:
   ```bash
   npm start
   ```

## 🔧 Available Scripts

- `npm start` - Start the production server
- `npm run dev` - Start development server with nodemon
- `npm run seed` - Seed the database with sample data
- `npm test` - Run tests (when implemented)

## 🌐 API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | User login | Public |
| GET | `/me` | Get current user info | Private |
| PUT | `/change-password` | Change user password | Private |

### Users (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all users (paginated) | Admin |
| GET | `/:id` | Get user by ID | Private |
| PUT | `/:id` | Update user | Private |
| DELETE | `/:id` | Delete user | Admin |
| GET | `/stats/overview` | User statistics | Admin |

### Courses (`/api/courses`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all courses (paginated) | Public |
| POST | `/` | Create new course | Instructor/Admin |
| GET | `/:id` | Get course by ID | Public |
| PUT | `/:id` | Update course | Instructor/Admin |
| DELETE | `/:id` | Delete course | Instructor/Admin |
| GET | `/instructor/my-courses` | Get instructor's courses | Instructor |
| GET | `/tags/popular` | Get popular course tags | Public |

### Coding Questions (`/api/questions`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all questions (paginated) | Private |
| POST | `/` | Create new question | Instructor/Admin |
| GET | `/:id` | Get question by ID | Private |
| GET | `/:id/test-cases` | Get question test cases | Instructor/Admin |
| PUT | `/:id` | Update question | Instructor/Admin |
| DELETE | `/:id` | Delete question | Admin |
| GET | `/random/:difficulty` | Get random question by difficulty | Private |
| GET | `/stats/overview` | Question statistics | Instructor/Admin |

### Interview Attempts (`/api/attempts`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get attempts (own or all) | Private |
| POST | `/` | Create new attempt | Private |
| GET | `/:id` | Get attempt by ID | Private |
| PUT | `/:id` | Update attempt | Private |
| DELETE | `/:id` | Delete attempt | Private |
| GET | `/user/:userId/stats` | Get user attempt statistics | Private |
| GET | `/question/:questionId/stats` | Get question statistics | Instructor/Admin |

### Transcripts (`/api/transcripts`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get transcripts (own or all) | Private |
| POST | `/` | Create new transcript | Private |
| GET | `/:id` | Get transcript by ID | Private |
| PUT | `/:id` | Update transcript | Private |
| DELETE | `/:id` | Delete transcript | Private |
| GET | `/attempt/:attemptId` | Get transcript for attempt | Private |
| GET | `/user/:userId/stats` | Get user transcript statistics | Private |

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 👥 User Roles

- **Student**: Can view courses, practice questions, create attempts, and manage own data
- **Instructor**: Can create/manage courses, create questions, and view student progress
- **Admin**: Full access to all resources and user management

## 📝 Sample Data

When you run `npm run seed`, the following test accounts are created:

**Admin:**
- Email: `admin@example.com`
- Password: `Admin123!`

**Instructors:**
- Email: `sarah.johnson@example.com` / Password: `Instructor123!`
- Email: `michael.chen@example.com` / Password: `Instructor123!`

**Students:**
- Email: `alice.smith@example.com` / Password: `Student123!`
- Email: `bob.wilson@example.com` / Password: `Student123!`
- (+ 3 more students)

## 🔍 API Request/Response Examples

### Register a new user
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "Password123!",
    "role": "student"
  }'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Password123!"
  }'
```

### Get random coding question
```bash
curl -X GET http://localhost:5000/api/questions/random/medium \
  -H "Authorization: Bearer <your-jwt-token>"
```

### Create interview attempt
```bash
curl -X POST http://localhost:5000/api/attempts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "question": "question-id-here",
    "score": 85,
    "durationSec": 1800,
    "transcript": "Interview transcript text..."
  }'
```

## 📊 Response Format

All API responses follow this consistent format:

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    // Detailed validation errors (if applicable)
  ]
}
```

## 🛡️ Security Features

- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: All inputs are validated using express-validator
- **Security Headers**: Helmet.js for security headers
- **Password Hashing**: bcrypt with salt rounds of 12
- **JWT Expiration**: Tokens expire after 7 days
- **CORS Protection**: Configurable allowed origins

## 🚧 Development

### Project Structure
```
backend/
├── src/
│   ├── config/
│   │   └── database.js      # MongoDB connection
│   ├── middleware/
│   │   ├── auth.js          # Authentication middleware
│   │   ├── errorHandler.js  # Global error handler
│   │   └── validation.js    # Input validation rules
│   ├── models/
│   │   ├── User.js          # User model
│   │   ├── Course.js        # Course model
│   │   ├── CodingQuestion.js # Question model
│   │   ├── InterviewAttempt.js # Attempt model
│   │   └── Transcript.js    # Transcript model
│   ├── routes/
│   │   ├── authRoutes.js    # Authentication routes
│   │   ├── userRoutes.js    # User management routes
│   │   ├── courseRoutes.js  # Course routes
│   │   ├── codingQuestionRoutes.js # Question routes
│   │   ├── interviewAttemptRoutes.js # Attempt routes
│   │   └── transcriptRoutes.js # Transcript routes
│   ├── seed/
│   │   ├── index.js         # Main seeder
│   │   ├── users.js         # User seed data
│   │   ├── courses.js       # Course seed data
│   │   └── codingQuestions.js # Question seed data
│   └── server.js            # Main application file
├── .env.example             # Environment variables template
├── package.json
└── README.md
```

### Adding New Features

1. **Models**: Define new Mongoose schemas in the `models/` directory
2. **Routes**: Create route handlers in the `routes/` directory
3. **Middleware**: Add custom middleware in the `middleware/` directory
4. **Validation**: Add validation rules in `middleware/validation.js`
5. **Seeds**: Add seed data in the `seed/` directory

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Failed**
- Ensure MongoDB is running locally or update `MONGO_URI` in `.env`
- Check if the database name exists and is accessible

**JWT Token Invalid**
- Verify the `JWT_SECRET` is set in your `.env` file
- Ensure the token is passed correctly in the Authorization header

**Validation Errors**
- Check the API documentation for required fields and formats
- Ensure email addresses are valid and passwords meet requirements

**Permission Denied**
- Verify user role has access to the requested endpoint
- Check if the user is authenticated properly

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🔗 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)

---

For questions or support, please open an issue in the repository.