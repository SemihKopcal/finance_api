# 💰 Financial Management API

A modern RESTful API for financial management applications. Includes income-expense tracking, category management, detailed reporting, and user authentication features.

## 🚀 Features

- **🔐 User Management**: JWT-based authentication
- **💰 Transaction Tracking**: Income and expense records
- **📊 Category Management**: Customizable categories
- **📈 Reporting**: Detailed financial analytics
- **✅ Validation**: Comprehensive data validation
- **📚 Swagger**: Automatic API documentation
- **🗄️ MongoDB**: NoSQL database support
- **🔒 Security**: CORS, rate limiting, input sanitization

## 🛠️ Technologies

- **Backend**: Node.js + Express.js
- **Language**: TypeScript
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT + bcrypt
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **Package Manager**: pnpm

## 🚀 Setup

### 1. Clone the Project

```bash
git clone https://github.com/SemihKopcal/finance_api
cd test_case
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Variables

Create a `.env` file:

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/test_case

# Server Configuration
PORT=3018

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Environment
NODE_ENV=development
```

### 4. Start MongoDB

Start the MongoDB service or use Docker:

```bash
# MongoDB with Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Start the Application

```bash
# Development mode
pnpm run dev

# Production build
pnpm run build
pnpm start
```

## 📁 Project Structure

```
src/
├── auth/                 # User authentication
│   ├── auth.controller.ts
│   ├── auth.middleware.ts
│   ├── auth.route.ts
│   ├── auth.service.ts
│   └── entities/
├── categories/           # Category management
│   ├── categories.controller.ts
│   ├── categories.route.ts
│   ├── categories.service.ts
│   └── entities/
├── transactions/         # Transaction management
│   ├── transactions.controller.ts
│   ├── transactions.route.ts
│   ├── transactions.service.ts
│   └── entities/
├── reports/             # Reporting
│   ├── reports.controller.ts
│   ├── reports.route.ts
│   └── reports.service.ts
├── middleware/          # Middlewares
│   └── validation.middleware.ts
├── db.ts               # Database connection
├── swagger.ts          # API documentation
└── index.ts            # Main application
```

## 🔒 Validation Rules

### User Registration
- **Name**: 2-50 characters, only letters and spaces
- **Email**: Valid email format
- **Password**: At least 6 characters, 1 uppercase, 1 lowercase, 1 digit

### Category
- **Name**: 2-50 characters, only letters and spaces
- **Type**: `income` or `expense`
- **Color**: Hex format (#FF5733)

### Transaction
- **Amount**: Greater than 0.01
- **Type**: `income` or `expense`
- **Category ID**: Valid MongoDB ObjectId
- **Description**: Maximum 500 characters
- **Date**: ISO 8601 format

## 🧪 Test

```bash
pnpm test
```

# Linting
pnpm run lint

# Linting + fix
pnpm run lint:fix

# Code formatting
pnpm run format
```

## 📚 API Documentation

After starting the application, access Swagger documentation at:

```
http://localhost:3018/api-docs
```

## 🌱 Seed Data

Default categories and transactions are **not** created automatically.

To seed data manually, you must first create a user via the API.  
After creating a user, run the following commands to seed categories and transactions for that user:

```bash
pnpm run seed:categories
pnpm run seed:transactions
```

## 🚀 Production Deployment

### 1. Build

```bash
pnpm run build
```

### 2. Environment Variables

Set secure environment variables for production:

```env
NODE_ENV=production
MONGO_URI=mongodb://your-production-mongo-uri
JWT_SECRET=your-very-secure-jwt-secret
```

### 3. Process Manager

Manage the application with PM2:

```bash
npm install -g pm2
pm2 start dist/index.js --name "financial-api"
pm2 startup
pm2 save
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to your branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 📝 License

This project is licensed under the [ISC](LICENSE) license.

## 📞 Contact

- **Project**: [GitHub Repository](https://github.com/SemihKopcal/finance_api)
- **Issues**: [GitHub Issues](https://github.com/SemihKopcal/finance_api/issues)

## 🙏 Thanks

This project uses the following open source projects:

- [Express.js](https://expressjs.com/)
- [Mongoose](https://mongoosejs.com/)
- [express-validator](https://express-validator.github.io/)
- [Swagger](https://swagger.io/)