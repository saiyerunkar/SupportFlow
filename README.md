# SupportFlow

A comprehensive support ticket management system with analytics and workflow automation capabilities.

## Overview

SupportFlow is a full-stack application that enables support teams to efficiently manage tickets, track incidents, analyze performance metrics, and identify root causes. It combines a robust FastAPI backend with a modern Next.js frontend to provide an intuitive user experience.

## Features

- **Ticket Management** - Create, assign, track, and resolve support tickets
- **Kanban Workflow** - Visual ticket organization with drag-and-drop interface
- **Analytics Dashboard** - Real-time metrics and performance insights
- **Root Cause Analysis** - Identify and track incident relationships
- **User Management** - Role-based access control (Customer, Agent, Admin)
- **Comments & Collaboration** - Internal and customer-facing communication
- **Incident Tracking** - Link tickets to incidents and components
- **Release Planning** - Track tickets across sprints and releases

## Prerequisites

- **Backend**: Python 3.8+, PostgreSQL
- **Frontend**: Node.js 16+, npm or yarn

## Installation

### Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
python seed_data.py        # Populate database with sample data
uvicorn app.main:app --reload
```

The backend will be available at `http://localhost:8000`.

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Project Structure

### `backend/`
FastAPI-based REST API server with business logic, database models, authentication, and services for ticket management, analytics, user administration, and root cause analysis.

### `frontend/`
Next.js React application providing the user interface with dashboards, ticket management, Kanban boards, analytics views, and authentication.

## Tech Stack

**Backend:**
- FastAPI - Modern Python web framework
- SQLAlchemy - Object-relational mapping
- Pydantic - Data validation
- PostgreSQL - Database

**Frontend:**
- Next.js - React framework
- TypeScript - Type-safe JavaScript
- Tailwind CSS - Utility-first CSS framework
- Zustand - State management
- React Query - Data fetching and caching

## Database

The project uses PostgreSQL for data persistence. Database migrations are managed with Alembic.

To reset the database:
```bash
python seed_data.py
```

## API Documentation

FastAPI automatically generates interactive API documentation at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Project Layout

```
supportflow/
├── backend/           FastAPI application
├── frontend/          Next.js application
├── docs/              Documentation and diagrams
└── scripts/           Utility scripts
```

## Contributing

Please follow the existing code structure and naming conventions when contributing to either the backend or frontend.

## License

TBD
