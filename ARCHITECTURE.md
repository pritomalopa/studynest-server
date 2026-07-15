# StudyNest Backend - Clean Architecture Documentation

## Overview

StudyNest backend follows **layered clean architecture** principles with strict separation of concerns. This ensures code maintainability, testability, and scalability.

### Architecture Layers

```
┌─────────────────────────────────────┐
│   HTTP Layer (Express Routes)       │
│   - Route definitions               │
│   - Middleware chains               │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Controller Layer                  │
│   - Request parsing                 │
│   - Response formatting             │
│   - Delegates to services           │
└─────��──────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Service Layer                     │
│   - Business logic                  │
│   - Data transformation             │
│   - Orchestrates models             │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   Model Layer (Mongoose)            │
│   - Database schemas                │
│   - Type definitions                │
│   - Data validation rules           │
└────────────┬────────────────────────┘
             │
┌────────────▼────────────────────────┐
│   MongoDB Database                  │
└─────────────────────────────────────┘
```

## Directory Structure

```
src/
├── config/                    # Configuration files
│   ├── db.ts                 # MongoDB connection
│   └── firebase.ts           # Firebase Admin initialization
│
├── controllers/              # Request handlers
│   ├── authController.ts     # Authentication endpoints
│   ├── resourceController.ts # Resource endpoints
│   ├── studyGroupController.ts
│   ├── tutorController.ts
│   └── adminController.ts    # Admin-only endpoints
│
├── middleware/               # Express middleware
│   ├── auth.ts              # JWT verification & role authorization
│   ├── errorHandler.ts      # Global error handling
│   └── validate.ts          # Request validation wrapper
│
├── models/                   # Mongoose schemas
│   ├── User.ts              # User schema with TypeScript interface
│   ├── Resource.ts
│   ├── StudyGroup.ts
│   ├── Tutor.ts
│   ├── Booking.ts
│   └── Review.ts
│
├── routes/                   # API routes
│   ├── authRoutes.ts
│   ├── resourceRoutes.ts
│   ├── studyGroupRoutes.ts
│   ├── tutorRoutes.ts
│   └── adminRoutes.ts
│
├── services/                 # Business logic
│   ├─�� auth.service.ts      # Auth logic (register, login, etc.)
│   ├── resource.service.ts
│   ├── studyGroup.service.ts
│   └── tutor.service.ts
│
├── types/                    # TypeScript interfaces
│   └── index.ts             # All shared types
│
├── utils/                    # Utility functions
│   ├── asyncHandler.ts      # Async error wrapping
│   └── logger.ts            # Logging
│
├── validation/               # Zod schemas
│   └── schemas.ts           # All validation schemas
│
├── seed/                     # Database seeding
│   └── seed.ts              # Demo data seeding
│
├── app.ts                    # Express app setup
└── server.ts                 # Server entry point

api/
└── index.ts                  # Vercel serverless handler
```

## Layer Responsibilities

### 1. Routes Layer (`routes/`)
**Purpose**: Define HTTP endpoints and request flow

```typescript
// Example: POST /api/auth/register
router.post(
  '/register',
  validate(registerSchema),  // ← Validation middleware
  registerUser               // ← Controller
);
```

**Responsibilities**:
- ✅ Map HTTP paths to controllers
- ✅ Apply middleware (auth, validation)
- ❌ NO business logic
- ❌ NO database queries

---

### 2. Controllers Layer (`controllers/`)
**Purpose**: Handle HTTP requests/responses

```typescript
export const registerUser = asyncHandler(async (req, res) => {
  // 1. Extract data from request
  const { name, email, password } = req.body;
  
  // 2. Basic validation
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("Missing required fields");
  }
  
  // 3. Delegate to service layer
  const result = await registerUserService(req.body);
  
  // 4. Handle response
  if (result.error) {
    res.status(400);
    throw new Error(result.error);
  }
  
  // 5. Return formatted response
  res.status(201).json({ success: true, data: result.user });
});
```

**Responsibilities**:
- ✅ Parse HTTP requests
- ✅ Call services
- ✅ Format JSON responses
- ✅ Set HTTP status codes
- ❌ NO direct database access
- ❌ NO business logic

---

### 3. Services Layer (`services/`)
**Purpose**: Encapsulate business logic

```typescript
export const registerUserService = async (data: RegisterInput) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return { error: "Email already registered" };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await User.create({
      ...data,
      password: hashedPassword,
    });

    // Generate JWT
    const token = generateToken(user._id);

    return { user, token };
  } catch (error) {
    return { error: "Registration failed" };
  }
};
```

**Responsibilities**:
- ✅ Business logic implementation
- ✅ Database operations via models
- ✅ Data transformation
- ✅ Error handling
- ✅ Reusable across controllers
- ❌ NO HTTP-specific code

---

### 4. Models Layer (`models/`)
**Purpose**: Define database schemas with TypeScript safety

```typescript
export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password?: string;
  role: "student" | "admin";
  isTutor: boolean;
  tutorSubjects: string[];
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, minlength: 8, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    isTutor: { type: Boolean, default: false },
    tutorSubjects: [String],
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
```

**Responsibilities**:
- ✅ Define MongoDB schemas
- ✅ Add TypeScript interfaces
- ✅ Enforce data constraints
- ✅ Add database indexes
- ✅ Provide type-safe queries

---

### 5. Middleware Layer (`middleware/`)
**Purpose**: Cross-cutting concerns (auth, validation, errors)

#### Authentication Middleware
```typescript
export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  // Get token from cookie or Authorization header
  if (req.cookies?.token) {
    token = req.cookies.token;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized" });
  }

  try {
    // Verify and decode JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ message: "Session expired" });
  }
};
```

#### Authorization Middleware
```typescript
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};
```

**Responsibilities**:
- ✅ Authentication (JWT verification)
- ✅ Authorization (role-based access)
- ✅ Request validation
- ✅ Error handling
- ✅ Security headers (Helmet)
- ✅ Rate limiting

---

### 6. Validation Layer (`validation/`)
**Purpose**: Ensure data integrity with Zod

```typescript
export const registerSchema = z.object({
  name: z.string().min(2, "Name required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password 8+ chars"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

**Responsibilities**:
- ✅ Define Zod validation schemas
- ✅ Ensure data types match
- ✅ Validate ranges, formats
- ✅ Provide type inference

---

### 7. Types Layer (`types/`)
**Purpose**: Centralized TypeScript interfaces

```typescript
export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: "student" | "admin";
  };
}

export interface JwtPayload {
  id: string;
  role: "student" | "admin";
}
```

**Responsibilities**:
- ✅ Shared TypeScript interfaces
- ✅ Ensure type safety across layers
- ❌ NO implementation logic

---

### 8. Utils Layer (`utils/`)
**Purpose**: Reusable helper functions

```typescript
// Wraps async controllers to catch errors
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
```

**Responsibilities**:
- ✅ Error wrapping
- ✅ Logging utilities
- ✅ Helper functions

---

## Data Flow Example: User Registration

```
1. POST /api/auth/register
   ↓
2. Validation Middleware
   - Check schema matches (Zod)
   - Return 400 if invalid
   ↓
3. registerUser Controller
   - Extract { name, email, password }
   - Call registerUserService()
   ↓
4. registerUserService
   - Check if email exists
   - Hash password with bcrypt
   - Create User in MongoDB
   - Generate JWT token
   ↓
5. Model (Mongoose)
   - Enforce schema constraints
   - Save to MongoDB
   - Return user document
   ↓
6. Service returns { user, token }
   ↓
7. Controller formats response
   res.status(201).json({ success: true, data: user })
   ↓
8. HTTP Response 201 Created
```

---

## Security Implementation

| Feature | Implementation | Location |
|---------|-----------------|----------|
| **Password Hashing** | bcryptjs (10 rounds, 8+ chars) | auth.service.ts |
| **JWT Auth** | HS256, 7-day expiry | auth.service.ts |
| **Authorization** | Role-based (student/admin) | middleware/auth.ts |
| **CORS** | Whitelist origin | app.ts |
| **Rate Limiting** | 20/15min for auth | app.ts |
| **NoSQL Injection** | mongo-sanitize | app.ts |
| **Security Headers** | Helmet | app.ts |
| **Input Validation** | Zod schemas | validation/schemas.ts |
| **HttpOnly Cookies** | Secure flag set | auth.service.ts |

---

## Production-Ready Features

✅ **Strict TypeScript**
- `noUnusedLocals: true` - catches dead code
- `noUnusedParameters: true` - prevents unused args
- `noImplicitReturns: true` - ensures all paths return
- `noImplicitAny: true` - no implicit `any` types

✅ **Error Handling**
- Global error handler middleware
- Try-catch in all async operations
- Consistent error response format

✅ **Environment Separation**
- `.env.example` with all required variables
- Validation on startup
- Different configs per environment

✅ **Database Seeding**
- `npm run seed` - loads demo data
- Demo credentials for testing
- Realistic sample data

✅ **Serverless Ready**
- Vercel deployment (`api/index.ts`)
- Connection pooling for serverless
- Stateless architecture

✅ **Logging**
- Request/response logging
- Error logging with context
- Structured log format

---

## Development Workflow

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret

# Start development server (auto-reload)
npm run dev

# Seed database with demo data
npm run seed

# Build for production
npm run build

# Run production build
npm start

# Destroy all data (careful!)
npm run seed:destroy
```

---

## API Endpoints Structure

```
/api/auth
  POST   /register          # Public: Create account
  POST   /login             # Public: Login
  POST   /google            # Public: Google OAuth
  POST   /logout            # Protected: Logout
  GET    /me                # Protected: Current user
  PUT    /profile           # Protected: Update profile

/api/resources
  GET    /                  # Public: List all
  GET    /:id               # Public: Get one
  GET    /mine              # Protected: My resources
  POST   /                  # Protected: Create
  DELETE /:id               # Protected: Delete own
  POST   /:id/reviews       # Protected: Add review

/api/study-groups
  GET    /                  # Public: List
  POST   /                  # Protected: Create
  POST   /:id/join          # Protected: Join
  POST   /:id/leave         # Protected: Leave

/api/tutors
  GET    /                  # Public: List
  POST   /:id/book          # Protected: Book session
  GET    /bookings/mine     # Protected: My bookings

/api/admin
  GET    /stats             # Admin only: Dashboard stats
  GET    /resources         # Admin only: All resources
  GET    /users             # Admin only: All users
```

---

## Testing Checklist

- [ ] All TypeScript strict mode rules pass
- [ ] No unused imports or variables
- [ ] No implicit `any` types
- [ ] All async functions wrapped with asyncHandler
- [ ] All database queries use models
- [ ] All input validated with Zod
- [ ] All protected routes check `req.user`
- [ ] All errors caught and formatted
- [ ] Demo data seeds successfully
- [ ] App builds without warnings
- [ ] App runs after production build

---

## Next Steps for Enhancement

1. **Add Unit Tests** - Jest + Supertest for routes
2. **Add Integration Tests** - Test full user flows
3. **API Documentation** - Swagger/OpenAPI specs
4. **Performance Monitoring** - APM tools (Sentry)
5. **Request Logging** - Winston/Pino for better logs
6. **Caching Layer** - Redis for frequently accessed data
7. **Background Jobs** - Bull queues for async tasks
8. **API Versioning** - `/api/v1/*` routes

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Cannot find module` | Run `npm install` |
| `MongoDB connection failed` | Check `MONGODB_URI` in `.env` |
| `JWT verification failed` | Ensure `JWT_SECRET` matches |
| `CORS errors` | Whitelist client URL in `.env` |
| `TypeScript errors on build` | Run `npm run build` to see all errors |

---

This architecture ensures **maintainability**, **scalability**, and **production-readiness** while keeping the codebase organized and easy to test.
