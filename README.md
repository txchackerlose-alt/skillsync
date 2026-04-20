# SkillSync

SkillSync is a skill-based employee task assignment platform built with Next.js, Supabase, TypeScript, and Tailwind CSS.

The platform has two main user roles:

* Employee
* Manager

Employees can upload resumes, add skills, view assigned tasks, and update their progress.
Managers can create tasks, assign work based on employee skills, track progress, and review completed work.

---

# Features

## Authentication

* Employee and Manager login/signup
* Secure authentication with Supabase Auth
* Role-based route protection
* Session handling with cookies

## Employee Features

* Create and update employee profile
* Upload resume
* Automatically extract skills from uploaded resume
* Add manual skills
* View assigned tasks
* Start tasks
* Update task progress
* Upload completed work files
* Mark task as completed
* View manager feedback

## Manager Features

* View all employees
* Search employees by skill
* Create tasks
* Assign tasks based on employee skill match
* Edit tasks
* Delete tasks
* Reassign tasks
* Track task status and progress
* Review submitted work
* Approve or reject completed tasks
* Leave feedback and comments

## Skill Matching System

SkillSync compares employee skills with required task skills.

Example:

Task Required Skills:

* React
* Next.js
* MongoDB

Employee Skills:

* React
* Next.js
* Node.js

Result:

* Match Percentage = 66%
* Missing Skill = MongoDB

---

# Tech Stack

* Next.js App Router
* TypeScript
* Tailwind CSS
* Supabase
* React Hook Form
* Zod
* Lucide React
* Sonner
* PDF Parse
* Mammoth

---

# Folder Structure

```text
src/
├── app/
│   ├── employee/
│   ├── manager/
│   ├── login/
│   ├── signup/
│   └── api/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── employee/
│   └── manager/
├── actions/
├── lib/
├── features/
├── styles/
├── types/
└── middleware.ts
```

---

# Database Tables

## profiles

* id
* user_id
* full_name
* department
* bio
* resume_url
* resume_text
* created_at
* updated_at

## employee_skills

* id
* user_id
* skill_name
* source
* created_at

## tasks

* id
* title
* description
* priority
* deadline
* required_skills
* assigned_employee_id
* status
* progress
* feedback
* completed_at
* reviewed_at
* created_at

## task_comments

* id
* task_id
* user_id
* comment
* created_at

## task_updates

* id
* task_id
* progress
* note
* created_by
* created_at

## task_files

* id
* task_id
* uploaded_by
* file_url
* file_name
* created_at

---

# Installation

```bash
npm install
```

Install required packages:

```bash
npm install @supabase/supabase-js @supabase/ssr react-hook-form zod @hookform/resolvers lucide-react sonner clsx tailwind-merge pdf-parse mammoth date-fns
```

---

# Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

# Resume Upload and Skill Extraction

Employees can upload PDF or DOCX resumes.

The system:

1. Uploads the resume to Supabase Storage
2. Extracts text from the file
3. Detects matching skills from a predefined skill list
4. Saves skills to the database
5. Uses those skills for manager task assignment

---

# Task Lifecycle

Task statuses:

* Not Started
* In Progress
* Submitted for Review
* Completed
* Rejected
* Overdue

Task Flow:

1. Manager creates task
2. Manager assigns employee
3. Employee starts task
4. Employee updates progress
5. Employee submits completed work
6. Manager reviews task
7. Manager approves or rejects

---

# Future Improvements

* Real-time notifications
* Chat between employee and manager
* Email notifications
* Team creation
* Admin dashboard
* Analytics dashboard
* Attendance tracking
* Calendar integration
* AI-based resume analysis

---

# Project Goal

SkillSync helps managers assign work more efficiently by matching tasks with employee skills.

This improves productivity, task quality, and employee performance.

---

# Author

Built using Next.js, Supabase, and Tailwind CSS.
