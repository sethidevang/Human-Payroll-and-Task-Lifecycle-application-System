-- PostgreSQL Schema for Human Payroll and Task Lifecycle Application System

-- 1. Create Enum for Leave Request Status
CREATE TYPE "enum_leave_requests_status" AS ENUM ('Pending', 'Approved', 'Rejected');

-- 2. Employees Table
CREATE TABLE IF NOT EXISTS "employees" (
    "id" SERIAL PRIMARY KEY,
    "firstName" VARCHAR(255) NOT NULL,
    "lastName" VARCHAR(255) NOT NULL,
    "address" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL UNIQUE,
    "age" INTEGER NOT NULL,
    "salary" INTEGER NOT NULL,
    "designation" VARCHAR(255) NOT NULL,
    "passportNumber" VARCHAR(255) NOT NULL,
    "nominee" VARCHAR(255) NOT NULL,
    "userId" INTEGER NOT NULL UNIQUE,
    "password" VARCHAR(255) NOT NULL,
    "emailNotifications" BOOLEAN DEFAULT TRUE,
    "smsNotifications" BOOLEAN DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 3. Leave Requests Table
CREATE TABLE IF NOT EXISTS "leave_requests" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "leaveType" VARCHAR(255) NOT NULL,
    "startDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "endDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "enum_leave_requests_status" DEFAULT 'Pending',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 4. Tasks Table
CREATE TABLE IF NOT EXISTS "tasks" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "taskId" INTEGER NOT NULL UNIQUE,
    "name" VARCHAR(255) NOT NULL,
    "designation" VARCHAR(255) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT NOT NULL,
    "assignedDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    "status" BOOLEAN NOT NULL DEFAULT FALSE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 5. Support Requests Table
CREATE TABLE IF NOT EXISTS "support_requests" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "issue" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 6. Attendance Table
CREATE TABLE IF NOT EXISTS "attendance" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'Present', -- 'Present', 'Absent', 'On Leave'
    "clockIn" TIMESTAMP WITH TIME ZONE,
    "clockOut" TIMESTAMP WITH TIME ZONE,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    UNIQUE("userId", "date")
);

-- 7. Payroll Table
CREATE TABLE IF NOT EXISTS "payroll" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "paymentDate" DATE NOT NULL,
    "nextPaymentDate" DATE,
    "status" VARCHAR(20) DEFAULT 'Paid',
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);

-- 8. Performance Reviews Table
CREATE TABLE IF NOT EXISTS "performance_reviews" (
    "id" SERIAL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "lastReviewDate" DATE NOT NULL,
    "nextReviewDate" DATE,
    "rating" INTEGER,
    "feedback" TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL,
    "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL
);
