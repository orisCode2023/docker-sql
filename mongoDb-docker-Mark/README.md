# MongoDB Todo List API

A RESTful API application for managing todos using MongoDB, Express.js, and Docker Compose. This project demonstrates MongoDB integration with Node.js and includes comprehensive tutorials and reference implementations.

## Project Structure

```
mongo-docker-compose-and-todos/
├── controllers/          # Request handlers for todo operations
│   └── todos.js         # CRUD operations for todos
├── routes/              # Express route definitions
│   └── todos.js        # Todo API endpoints
├── utils/               # Utility functions
│   └── db.js           # MongoDB connection and initialization
├── mongo-tutorial/      # Comprehensive MongoDB tutorial with guides
│   ├── README.md        # Full MongoDB tutorial
│   ├── QUICK-START.md   # Quick start guide
│   └── sample-data.js   # Sample data script
├── todos-sql-express-reference/  # SQL-based reference implementation
├── server.js            # Main Express application entry point
├── docker-compose.yml   # Docker Compose configuration for MongoDB and mongo-express
└── package.json         # Node.js dependencies and scripts
```

## Main Application

The main application is a RESTful API server that provides endpoints for managing todos:

- **Server**: Express.js server running on port 8000 (configurable via `PORT` environment variable)
- **Database**: MongoDB running in Docker container (port 27018)
- **Database UI**: mongo-express web interface (port 8081)

### API Endpoints

- `GET /` - Welcome message
- `GET /todos` - Get all todos
- `POST /todos` - Create a new todo
- `GET /todos/:id` - Get a specific todo by ID
- `PUT /todos/:id` - Update a todo by ID
- `DELETE /todos/:id` - Delete a todo by ID

### Key Features

- MongoDB connection pooling and initialization
- Unique index on todo `title` field
- Express middleware for database connection attachment
- Request logging middleware
- Docker Compose setup for easy MongoDB deployment

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start MongoDB and mongo-express using Docker Compose:
```bash
docker-compose up -d
```

3. Start the Express server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Docker Services

The `docker-compose.yml` file sets up two services:

1. **MongoDB** (`mongodb`)
   - Port: `27018` (mapped from container port `27017`)
   - Username: `admin`
   - Password: `password123`
   - Database: `todos`
   - Persistent volume for data storage

2. **mongo-express** (`mongo-express`)
   - Port: `8081`
   - Web UI for MongoDB management
   - Access at: http://localhost:8081
   - Login: `admin` / `admin123`

### Environment Variables

- `PORT` - Server port (default: 8000)
- `MONGO_URL` - MongoDB connection string (default: `mongodb://admin:password123@localhost:27018/todos?authSource=admin`)

## Tutorials and Reference Materials

### `mongo-tutorial/`
Comprehensive MongoDB tutorial covering:
- Docker Compose setup
- MongoDB shell operations
- CRUD operations
- Sample data scripts
- Quick start guide

See the [MongoDB Tutorial](mongo-tutorial/README.md) for detailed instructions.

### `todos-sql-express-reference/`
Reference implementation of a similar todo application using SQL instead of MongoDB. Useful for comparing SQL and NoSQL approaches.

## Project Dependencies

- **express**: ^5.2.1 - Web framework
- **mongodb**: ^6.3.0 - MongoDB driver
- **nodemon**: ^3.1.11 - Development auto-reload tool

## Notes

- The application uses ES modules (`"type": "module"` in package.json)
- Database connection is attached to each request via middleware
- Unique constraint on todo titles prevents duplicates
- MongoDB data persists in a Docker volume

