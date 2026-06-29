# Requirements Document

## 1. Application Overview

**Application Name:** 86 Connects Official Website

**Description:** A professional corporate website providing two core services: Study in China assistance and Product Sourcing from China. The website serves as a digital gateway for international clients seeking educational opportunities or business procurement solutions in China. The website includes an admin dashboard for managing contact form submissions.

---

## 2. Users and Usage Scenarios

### Target Users

- International students seeking study opportunities in China
- Business professionals and companies looking to source products from China
- Educational consultants and procurement agents
- Website administrators managing contact form submissions

### Core Usage Scenarios

- Users browse service offerings and company information
- Users learn about Study in China services (scholarships, admissions, guidance)
- Users explore Product Sourcing services (supplier finding, procurement, logistics)
- Users submit contact inquiries through the contact form
- Users access company background and contact information
- Administrators log in to view and manage contact form submissions

---

## 3. Page Structure and Functional Description

### Page Structure

```
86 Connects Official Website
├── Public Pages (Single-page application)
│   ├── Hero/Landing Section
│   ├── Study in China Section
│   │   └── Study in China Inquiry Form
│   ├── Product Sourcing Section
│   │   └── Product Sourcing Inquiry Form
│   ├── About Us Section
│   └── Contact Section
│       └── General Inquiry Form
└── Admin Pages
    ├── Admin Login Page (/admin/login)
    └── Admin Dashboard (/admin)
```

### 3.1 Hero/Landing Section

**Purpose:** Introduce the company and guide users to core services

**Content Elements:**

- Company name display: 「86 Connects」
- Tagline and brief company introduction
- Hero image (hero_banner.jpg)
- Navigation cards for both core services
- Call-to-action buttons linking to respective service sections
- Smooth scroll navigation menu (Home, Study in China, Product Sourcing, About Us, Contact)

**Functional Description:**

- Display company branding and value proposition
- Display hero image for visual appeal
- Provide quick navigation to service sections via cards and CTA buttons
- Enable smooth scrolling to any section through navigation menu

### 3.2 Study in China Section

**Purpose:** Present educational services for international students and collect study-specific inquiries

**Content Elements:**

- Section title: 「Study in China」
- Service overview description
- Service image (study_in_china.jpg)
- Three service offerings:
  - Scholarship Applications
  - University Admissions Assistance
  - Study Abroad Guidance
- **Study in China Inquiry Form** with fields:
  - Full Name (required)
  - Email (required)
  - Phone (optional)
  - Nationality (required)
  - Current Education Level dropdown (required, options: High School, Bachelor's, Master's, PhD, Other)
  - Service Type dropdown (required, options: Scholarship Applications, University Admissions Assistance, Study Abroad Guidance)
  - Preferred Field of Study (optional)
  - Preferred Province/City (optional)
  - Message / Additional Details (required)
  - Submit button
- Submission confirmation message area
- Error message display area

**Functional Description:**

- Display comprehensive information about Study in China services
- Display service image for visual appeal
- Collect study-specific inquiries through dedicated form
- Validate required fields before submission
- Store form submissions in backend database with type: `study_inquiry`
- Display success confirmation message upon successful submission
- Display error message if submission fails

### 3.3 Product Sourcing Section

**Purpose:** Present procurement and sourcing services and collect sourcing-specific inquiries

**Content Elements:**

- Section title: 「Product Sourcing」
- Service overview description
- Service image (product_sourcing.jpg)
- Three service offerings:
  - Supplier Finding
  - Procurement Assistance
  - Logistics Support
- **Product Sourcing Inquiry Form** with fields:
  - Company Name (optional)
  - Full Name (required)
  - Email (required)
  - Phone (required)
  - Country (required)
  - Service Type dropdown (required, options: Supplier Finding, Procurement Assistance, Logistics Support)
  - Product Category (optional) — e.g., Electronics, Textiles, Machinery, Furniture, etc.
  - Target Order Quantity (optional) — e.g., Sample, Small (100-500), Medium (500-5000), Large (5000+)
  - Message / Product Details (required)
  - Submit button
- Submission confirmation message area
- Error message display area

**Functional Description:**

- Display comprehensive information about Product Sourcing services
- Display service image for visual appeal
- Collect sourcing-specific inquiries through dedicated form
- Validate required fields before submission
- Store form submissions in backend database with type: `sourcing_inquiry`
- Display success confirmation message upon successful submission
- Display error message if submission fails

### 3.4 About Us Section

**Purpose:** Establish company credibility and values

**Content Elements:**

- Company introduction
- Mission statement
- Core values
- Key differentiators

**Functional Description:**

- Present company background and positioning
- Communicate brand values and competitive advantages

### 3.5 Contact Section (General Inquiry)

**Purpose:** Provide a general contact form for inquiries not specific to either service, plus company contact information

**Content Elements:**

- Contact form with fields:
  - Name (required)
  - Email (required)
  - Phone (optional)
  - Service Interest dropdown (required, options: Study in China, Product Sourcing, General Inquiry)
  - Subject (optional)
  - Message (required)
  - Submit button
- Company contact information display (address, email, phone)
- Submission confirmation message area
- Error message display area

**Functional Description:**

- Collect general inquiry information through form
- Validate required fields before submission
- Store form submissions in backend database with type: `general_inquiry`
- Display success confirmation message upon successful submission
- Display error message if submission fails
- Pre-select Service Interest dropdown value when user arrives via CTA buttons from service sections

### 3.6 Navigation Menu

**Purpose:** Provide site-wide navigation

**Functional Description:**

- Fixed or sticky navigation bar
- Menu items: Home, Study in China, Product Sourcing, About Us, Contact
- Smooth scroll to corresponding section when menu item clicked
- Responsive design for mobile devices

### 3.7 Admin Login Page (/admin/login)

**Purpose:** Authenticate administrators before accessing dashboard

**Content Elements:**

- Page title: 「Admin Login」
- Password input field (required)
- Login button
- Error message display area

**Functional Description:**

- Display password input field for admin authentication
- Validate password on login button click
- If password is correct, redirect to Admin Dashboard (/admin)
- If password is incorrect, display error message
- Store authentication state to maintain login session

### 3.8 Admin Dashboard (/admin)

**Purpose:** Enable administrators to view and manage contact form submissions

**Content Elements:**

- Page title: 「Admin Dashboard」
- Logout button
- Submissions table displaying:
  - Submission Type (Study Inquiry, Sourcing Inquiry, General Inquiry)
  - Name
  - Email
  - Phone
  - Service Interest / Service Type
  - Message
  - Submission Date/Time
- Sorting controls for table columns
- Filtering controls for Submission Type (Study Inquiry, Sourcing Inquiry, General Inquiry, All)

**Functional Description:**

- Retrieve all contact form submissions from backend database
- Display submissions in table format with Submission Type column
- Enable sorting by any column (ascending/descending)
- Enable filtering by Submission Type (Study Inquiry, Sourcing Inquiry, General Inquiry, All)
- Logout button clears authentication state and redirects to home page
- Route protection: redirect to Admin Login page if user is not authenticated

---

## 4. Business Rules and Logic

### 4.1 Form Types Overview

The website has **3 forms** across 3 sections:

| # | Form | Section | Submission Type | Endpoint |
|---|------|---------|----------------|----------|
| 1 | Study in China Inquiry | §3.2 Study in China | `study_inquiry` | `POST /api/contact/study` |
| 2 | Product Sourcing Inquiry | §3.3 Product Sourcing | `sourcing_inquiry` | `POST /api/contact/sourcing` |
| 3 | General Contact Form | §3.5 Contact | `general_inquiry` | `POST /api/contact` |

### 4.2 Study in China Inquiry Form Validation

**Required Fields:**
- Full Name: Must not be empty, 2-100 characters
- Email: Must not be empty, valid email format
- Nationality: Must not be empty
- Current Education Level: Must select one option (High School, Bachelor's, Master's, PhD, Other)
- Service Type: Must select one option (Scholarship Applications, University Admissions Assistance, Study Abroad Guidance)
- Message: Must not be empty, 10-500 characters

**Optional Fields:**
- Phone: No validation if left empty, 7-15 digits if provided
- Preferred Field of Study: No validation
- Preferred Province/City: No validation

### 4.3 Product Sourcing Inquiry Form Validation

**Required Fields:**
- Full Name: Must not be empty, 2-100 characters
- Email: Must not be empty, valid email format
- Phone: Must not be empty, 7-15 digits
- Country: Must not be empty
- Service Type: Must select one option (Supplier Finding, Procurement Assistance, Logistics Support)
- Message / Product Details: Must not be empty, 10-1000 characters

**Optional Fields:**
- Company Name: No validation
- Product Category: No validation
- Target Order Quantity: No validation

### 4.4 General Contact Form Validation

**Required Fields:**
- Name: Must not be empty, 2-100 characters
- Email: Must not be empty, valid email format
- Service Interest: Must select one option (Study in China, Product Sourcing, General Inquiry)
- Message: Must not be empty, 10-500 characters

**Optional Fields:**
- Phone: No validation if left empty, 7-15 digits if provided
- Subject: No validation

### 4.5 CTA Button Pre-selection Logic

When user clicks CTA button in Study in China Section:

- Page scrolls to Study in China Inquiry Form at top of section
- Focus is set on the first form field

When user clicks CTA button in Product Sourcing Section:

- Page scrolls to Product Sourcing Inquiry Form at top of section
- Focus is set on the first form field

When user navigates to Contact Section via menu:

- Page scrolls to Contact Section (General Inquiry Form)
- Service Interest dropdown shows default placeholder

### 4.6 Form Submission Process (All Forms)

1. User fills out any of the 3 forms
2. User clicks Submit button
3. System validates all required fields for that form type
4. If validation passes:
   - System stores submission data in backend database with corresponding `submission_type`
   - System displays success confirmation message
   - Form fields are cleared
5. If validation fails:
   - System displays error messages for invalid fields
   - Form retains user input
   - User can correct and resubmit
6. If database storage fails:
   - System displays error message indicating submission failure
   - User can retry submission

### 4.7 SEO Optimization Rules

- Page includes meta tags optimized for keywords: 「Study in China」 and 「Product Sourcing from China」
- Page title, meta description, and heading tags incorporate target keywords
- Content structure supports search engine indexing for both service categories

### 4.5 Admin Authentication Logic

1. Admin enters password on Admin Login page
2. System validates password against stored admin password
3. If password is correct:
   - System stores authentication state
   - System redirects to Admin Dashboard
4. If password is incorrect:
   - System displays error message
   - User can retry login

### 4.6 Admin Dashboard Access Control

When user attempts to access /admin route:

- System checks authentication state
- If authenticated, display Admin Dashboard
- If not authenticated, redirect to Admin Login page (/admin/login)

### 4.10 Admin Logout Process

1. Admin clicks Logout button on Admin Dashboard
2. System clears authentication state
3. System redirects to home page

### 4.11 Image Display Rules

- Hero section displays hero_banner.jpg
- Study in China section displays study_in_china.jpg
- Product Sourcing section displays product_sourcing.jpg
- Images are positioned appropriately within their respective sections for visual appeal

---

## 5. Exceptions and Edge Cases

| Scenario | Handling Method |
|----------|-----------------|
| User submits any form with empty required fields | Display validation error messages, prevent submission |
| User enters invalid email format in any form | Display email format error message, prevent submission |
| User submits Study in China form without selecting Education Level | Display dropdown error, prevent submission |
| User submits Product Sourcing form without selecting Service Type | Display dropdown error, prevent submission |
| User submits Product Sourcing form without phone number | Display error, phone is required for sourcing inquiries |
| Database connection fails during submission | Display error message: 「Submission failed. Please try again later.」 |
| User clicks Submit button multiple times rapidly | Prevent duplicate submissions, disable button during processing |
| User navigates away during form submission | No action required, submission process terminates |
| Form submission succeeds but confirmation message fails to display | Ensure submission is stored, log error for investigation |
| User accesses website on mobile device | Display responsive navigation menu, ensure all 3 forms are usable on mobile |
| User clicks navigation menu item while on same section | No scroll action or smooth scroll to section top |
| Admin enters incorrect password | Display error message, allow retry |
| Admin attempts to access /admin without authentication | Redirect to Admin Login page |
| Unauthenticated user attempts to access /admin directly | Redirect to Admin Login page |
| Admin session expires during dashboard use | Redirect to Admin Login page |
| Database fails to retrieve submissions on dashboard | Display error message indicating data retrieval failure |
| Admin clicks Logout button multiple times | Clear authentication state once, redirect to home page |
| Image files fail to load | Display placeholder or alt text |
| Multiple forms on the same page — user fills one form but submits another | Each form is independent, no cross-interference |
| User resizes browser while filling a form | Form retains all entered data, layout adjusts responsively |

---

## 6. Acceptance Criteria

1. User opens website and views Hero/Landing Section with company name, tagline, hero image, and navigation cards
2. User clicks navigation menu item or CTA button to scroll smoothly to Study in China Section
3. User reads Study in China service information with service image and service offerings
4. User fills out Study in China Inquiry form with Full Name, Email, Nationality, Education Level, Service Type, and Message, then clicks Submit
5. System validates form, stores submission in backend database as `study_inquiry`, and displays success confirmation message
6. User scrolls to Product Sourcing Section, reads service information and service offerings
7. User fills out Product Sourcing Inquiry form with Full Name, Email, Phone, Country, Service Type, and Message, then clicks Submit
8. System validates form, stores submission in backend database as `sourcing_inquiry`, and displays success confirmation message
9. User navigates to Contact Section and fills out General Contact Form with Name, Email, Service Interest, and Message, then clicks Submit
10. System validates form, stores submission in backend database as `general_inquiry`, and displays success confirmation message
11. Admin navigates to /admin/login, enters password, and clicks Login button
12. System validates password, stores authentication state, and redirects to Admin Dashboard at /admin
13. Admin views all contact form submissions (study, sourcing, general) in table format with sorting and filtering by submission type
14. Admin clicks Logout button, system clears authentication state and redirects to home page

---

## 7. Out of Scope for Current Release

- User login and registration functionality
- Payment processing or e-commerce features
- Blog or content management system
- Multi-language support
- User account management
- Live chat or real-time messaging
- Social media integration (likes, comments, sharing)
- File upload functionality in contact form
- Email notification system for form submissions
- Advanced admin user management (multiple admin accounts, roles, permissions)
- Analytics and reporting features
- Newsletter subscription
- FAQ or knowledge base section
- Testimonials or client reviews section
- Case studies or portfolio showcase
- Video content or multimedia galleries
- Search functionality
- Booking or appointment scheduling
- Third-party API integrations beyond database storage
- Admin dashboard features: edit submissions, delete submissions, export data, bulk actions
- Password reset or recovery functionality for admin
- Image upload or management system
- Image optimization or compression
- Multi-device image format support

---

## 8. Technical Specifications

### 8.1 Technology Stack

| Layer | Technology | Local Dev | Production |
|-------|-----------|-----------|------------|
| **Frontend** | Next.js (App Router) + TypeScript | localhost:3000 | Vercel |
| **Backend** | Node.js API (Express) + TypeScript | localhost:3001 | Render (Docker) |
| **Database** | Prisma ORM | SQLite (`dev.db`) | PostgreSQL (Render) |
| **UI Components** | shadcn/ui + Tailwind CSS | - | - |
| **Form Validation** | React Hook Form + Zod | - | - |
| **Containerization** | Docker + Docker Compose | Optional | Render |

### 8.2 Architecture Overview

#### Production Architecture

```
┌─────────────────┐     HTTPS      ┌─────────────────┐
│   Vercel        │ ──────────────>│   Render        │
│   (Frontend)    │                │   (Backend API) │
│                 │ <──────────────│                 │
│  Next.js App    │     JSON       │  Express API    │
│  - Public pages │                │  - /api/contact │
│  - Admin pages  │                │  - /api/admin   │
│  - SSR/SSG      │                │  - Auth middleware│
└─────────────────┘                └────────┬────────┘
                                            │
                                            │ SQL
                                            ▼
                                   ┌─────────────────┐
                                   │   Render        │
                                   │   (Database)    │
                                   │                 │
                                   │  PostgreSQL     │
                                   │  - submissions  │
                                   └─────────────────┘
```

#### Local Development Architecture

```
┌─────────────────┐     HTTP       ┌─────────────────┐
│   Next.js Dev   │ ──────────────>│   Express Dev   │
│   localhost:3000│                │   localhost:3001 │
│                 │ <──────────────│                 │
│  Next.js App    │     JSON       │  Express API    │
│  - Public pages │                │  - /api/contact │
│  - Admin pages  │                │  - /api/admin   │
└─────────────────┘                └────────┬────────┘
                                            │
                                            │ Prisma
                                            ▼
                                   ┌─────────────────┐
                                   │   SQLite        │
                                   │   (File)        │
                                   │                 │
                                   │  dev.db         │
                                   │  - submissions  │
                                   └─────────────────┘
```

### 8.3 Frontend (Next.js on Vercel)

- **Framework**: Next.js 14+ with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: File-based routing (`app/` directory)
- **Public Pages**: Single-page layout with smooth scroll sections
- **Admin Pages**: `/admin/login` and `/admin` routes
- **Environment Variables**:
  - `NEXT_PUBLIC_API_URL` - Backend API URL on Render

### 8.4 Backend (Node.js API on Render)

- **Framework**: Express or Fastify
- **Language**: TypeScript
- **ORM**: Prisma (for type-safe database queries)
- **Endpoints**:
  - `POST /api/contact/study` - Submit Study in China inquiry
  - `POST /api/contact/sourcing` - Submit Product Sourcing inquiry
  - `POST /api/contact` - Submit general contact form
  - `GET /api/admin/submissions` - Get all submissions (protected)
  - `POST /api/admin/login` - Admin authentication
  - `POST /api/admin/logout` - Admin logout
- **Environment Variables**:
  - `DATABASE_URL` - PostgreSQL connection string
  - `ADMIN_PASSWORD` - Admin login password
  - `CORS_ORIGIN` - Allowed frontend origin (Vercel URL)
  - `JWT_SECRET` - For session tokens

### 8.5 Database Strategy

#### Local Development: SQLite

- **Database file**: `backend/prisma/dev.db`
- **Provider**: `sqlite` in Prisma schema
- **Purpose**: Fast local development, no external dependencies
- **Setup**: Auto-created on first migration

```bash
# Local development setup
cd backend
npx prisma migrate dev --name init  # Creates dev.db
npx prisma generate                  # Generates Prisma Client
npx prisma studio                    # View data at localhost:5555
```

#### Production: PostgreSQL (Render)

- **Database**: Managed PostgreSQL on Render
- **Provider**: `postgresql` in Prisma schema
- **Connection**: Internal connection string (no network latency)
- **Backups**: Automated daily backups

```sql
CREATE TABLE submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_type VARCHAR(20) NOT NULL CHECK (submission_type IN ('study_inquiry', 'sourcing_inquiry', 'general_inquiry')),

  -- Common fields (all forms)
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  message TEXT NOT NULL,

  -- Study in China fields
  nationality VARCHAR(100),
  education_level VARCHAR(50),
  study_service_type VARCHAR(100),
  preferred_field_of_study VARCHAR(255),
  preferred_city VARCHAR(255),

  -- Product Sourcing fields
  company_name VARCHAR(255),
  country VARCHAR(100),
  sourcing_service_type VARCHAR(100),
  product_category VARCHAR(255),
  target_order_quantity VARCHAR(50),

  -- General contact fields
  service_interest VARCHAR(50),
  subject VARCHAR(255),

  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_submissions_type ON submissions(submission_type);
CREATE INDEX idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX idx_submissions_service_interest ON submissions(service_interest);
```

#### Prisma Multi-Environment Setup

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"  // Production
  url      = env("DATABASE_URL")
}
```

```prisma
// prisma/schema.dev.prisma (local development)
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}
```

**Environment-based switching** (in `package.json`):
```json
{
  "scripts": {
    "dev": "prisma generate --schema=prisma/schema.dev.prisma && tsx watch src/index.ts",
    "db:migrate:dev": "prisma migrate dev --schema=prisma/schema.dev.prisma",
    "db:studio:dev": "prisma studio --schema=prisma/schema.dev.prisma",
    "build": "prisma generate && tsc",
    "start": "node dist/index.js",
    "db:migrate:prod": "prisma migrate deploy"
  }
}
```

### 8.6 Data Flow

1. **Contact Form Submissions (All 3 forms)**:
   - User fills out form on Next.js frontend (Vercel)
   - Frontend sends POST request to Render backend API:
     - Study in China → `POST /api/contact/study`
     - Product Sourcing → `POST /api/contact/sourcing`
     - General Contact → `POST /api/contact`
   - Backend validates data against form-specific Zod schema
   - Backend inserts into PostgreSQL `submissions` table with correct `submission_type`
   - Backend returns success/error response
   - Frontend displays toast notification

2. **Admin Dashboard**:
   - Admin logs in via `/admin/login`
   - Frontend sends credentials to backend API
   - Backend validates and returns JWT token
   - Frontend stores token in httpOnly cookie
   - Frontend fetches submissions with authenticated request
   - Backend validates token and returns submissions from PostgreSQL

### 8.7 Deployment

- **Frontend (Vercel)**:
  - Auto-deploy from Git repository
  - Environment variables configured in Vercel dashboard
  - Custom domain setup

- **Backend (Render with Docker)**:
  - Docker container deployed to Render Web Service
  - Dockerfile in backend root directory
  - Environment variables configured in Render dashboard
  - Health check endpoint at `/health`
  - Auto-deploy from Git repository on push

- **Database (Render)**:
  - PostgreSQL managed database
  - Automatic backups enabled
  - Connection pooling via Prisma

### 8.8 Docker Configuration

The backend is containerized using Docker for consistent deployment across environments.

**Dockerfile** (backend):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]
```

**Docker Compose** (local development):
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/connect86
      - JWT_SECRET=local_jwt_secret
      - ADMIN_PASSWORD=admin123
      - CORS_ORIGIN=http://localhost:3000
    depends_on:
      - db
  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_DB=connect86
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
volumes:
  postgres_data:
```
