# MongoDB Tutorial - Getting Started with Docker Compose

This tutorial will guide you through setting up MongoDB using Docker Compose, accessing it through the browser, and performing basic CRUD operations using the MongoDB shell.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Running Docker Compose](#running-docker-compose)
3. [Accessing MongoDB in the Browser](#accessing-mongodb-in-the-browser)
4. [Connecting to MongoDB Shell](#connecting-to-mongodb-shell)
5. [Basic CRUD Operations](#basic-crud-operations)
6. [Sample Dataset](#sample-dataset)
7. [Next Steps](#next-steps)

---

## Prerequisites

Before starting, make sure you have:
- Docker and Docker Compose installed on your system
- Basic understanding of command line operations
- A web browser

---

## Running Docker Compose

### Step 1: Navigate to the Project Directory

```bash
cd mongo-docker-compose-and-todos
```

### Step 2: Start the Services

Start MongoDB and mongo-express services:

```bash
docker-compose up -d
```

The `-d` flag runs the containers in detached mode (in the background).

**Expected Output:**
```
Creating network "mongo-docker-compose-and-todos_mongo-network" ... done
Creating volume "mongo-docker-compose-and-todos_mongodb_data" ... done
Creating mongodb ... done
Creating mongo-express ... done
```

### Step 3: Verify Containers are Running

Check that both containers are running:

```bash
docker-compose ps
```

You should see both `mongodb` and `mongo-express` containers with status "Up".

### Step 4: View Logs (Optional)

To see the logs from both services:

```bash
docker-compose logs -f
```

Press `Ctrl+C` to exit the logs view.

### Stopping the Services

When you're done, stop the services:

```bash
docker-compose down
```

To also remove volumes (⚠️ **This will delete all data**):

```bash
docker-compose down -v
```

---

## Accessing MongoDB in the Browser

Mongo Express provides a web-based interface to interact with MongoDB.

### Step 1: Open Mongo Express

1. Open your web browser
2. Navigate to: `http://localhost:8081`

### Step 2: Login

- **Username:** `admin`
- **Password:** `admin123`

### Step 3: Explore the Interface

Once logged in, you'll see:
- **Databases** - List of all databases
- **Collections** - Documents grouped in collections
- **Documents** - Individual records

### Using Mongo Express

- **Create Database:** Click "Create Database" button
- **Create Collection:** Select a database, then click "Create Collection"
- **Insert Document:** Select a collection, click "Insert Document", enter JSON data
- **View Documents:** Click on a collection to see all documents
- **Edit/Delete:** Use the action buttons next to each document

---

## Connecting to MongoDB Shell

The MongoDB shell (mongosh) allows you to interact with MongoDB using commands.

### Step 1: Access MongoDB Shell

Execute the MongoDB shell inside the container:

```bash
docker exec -it mongodb mongosh -u admin -p password123 --authenticationDatabase admin
```
or 
```bash
docker exec -it mongodb mongosh -u admin -p password123
```

### Step 2: Verify Connection

Once connected, you should see:

```
Current Mongosh Log ID: ...
Connecting to: mongodb://<credentials>@127.0.0.1:27017/?directConnection=true&serverSelectionTimeoutMS=2000&appName=mongosh+...
Using MongoDB: 7.x.x
Using Mongosh: x.x.x
```

### Step 2.5: View All Databases

To see all available databases:

```javascript
show dbs
```

This will display a list of all databases in your MongoDB instance.

### Step 3: Switch to a Database

```javascript
use todos
```

This switches to the `todos` database (creates it if it doesn't exist).

---

## Basic CRUD Operations

### CREATE - Inserting Documents

#### Insert a Single Document

```javascript
db.todos.insertOne({
  title: "Learn MongoDB",
  description: "Complete MongoDB tutorial",
  completed: false,
  created_at: new Date(),
  updated_at: new Date()
})
```

**Expected Output:**
```javascript
{
  acknowledged: true,
  insertedId: ObjectId("...")
}
```

#### Insert Multiple Documents

```javascript
db.todos.insertMany([
  {
    title: "Build REST API",
    description: "Create Express.js API with MongoDB",
    completed: false,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    title: "Deploy Application",
    description: "Deploy to production server",
    completed: false,
    created_at: new Date(),
    updated_at: new Date()
  }
])
```

**Expected Output:**
```javascript
{
  acknowledged: true,
  insertedIds: {
    '0': ObjectId("..."),
    '1': ObjectId("...")
  }
}
```

### READ - Querying Documents

#### Find All Documents

```javascript
db.todos.find()
```

#### Find with Pretty Print (Formatted Output)

```javascript
db.todos.find().pretty()
```

#### Find One Document

```javascript
db.todos.findOne()
```

#### Find Documents with Conditions

**Find by completed status:**
```javascript
db.todos.find({ completed: false })
```

**Find by title:**
```javascript
db.todos.find({ title: "Learn MongoDB" })
```

**Find with multiple conditions (AND):**
```javascript
db.todos.find({ 
  completed: false,
  title: "Learn MongoDB"
})
```

**Find with OR condition:**
```javascript
db.todos.find({
  $or: [
    { completed: false },
    { title: "Build REST API" }
  ]
})
```

#### Find with Comparison Operators

**Greater than:**
```javascript
db.todos.find({ created_at: { $gt: new Date("2024-01-01") } })
```

**Less than or equal:**
```javascript
db.todos.find({ created_at: { $lte: new Date() } })
```

**In array:**
```javascript
db.todos.find({ title: { $in: ["Learn MongoDB", "Build REST API"] } })
```

#### Limit Results

```javascript
db.todos.find().limit(5)
```

#### Sort Results

**Ascending:**
```javascript
db.todos.find().sort({ created_at: 1 })
```

**Descending:**
```javascript
db.todos.find().sort({ created_at: -1 })
```

#### Count Documents

```javascript
db.todos.countDocuments()
```

**Count with condition:**
```javascript
db.todos.countDocuments({ completed: false })
```

### UPDATE - Modifying Documents

#### Update One Document

```javascript
db.todos.updateOne(
  { title: "Learn MongoDB" },
  { 
    $set: { 
      completed: true,
      updated_at: new Date()
    }
  }
)
```

**Expected Output:**
```javascript
{
  acknowledged: true,
  modifiedCount: 1,
  upsertedId: null,
  upsertedCount: 0,
  matchedCount: 1
}
```

#### Update Multiple Documents

```javascript
db.todos.updateMany(
  { completed: false },
  { 
    $set: { 
      updated_at: new Date()
    }
  }
)
```

#### Replace Entire Document

```javascript
db.todos.replaceOne(
  { title: "Learn MongoDB" },
  {
    title: "Master MongoDB",
    description: "Advanced MongoDB concepts",
    completed: true,
    created_at: new Date(),
    updated_at: new Date()
  }
)
```

#### Update Operators

**Increment a number:**
```javascript
db.todos.updateOne(
  { title: "Learn MongoDB" },
  { $inc: { priority: 1 } }
)
```

**Add to array:**
```javascript
db.todos.updateOne(
  { title: "Learn MongoDB" },
  { $push: { tags: "database" } }
)
```

**Remove from array:**
```javascript
db.todos.updateOne(
  { title: "Learn MongoDB" },
  { $pull: { tags: "database" } }
)
```

### DELETE - Removing Documents

#### Delete One Document

```javascript
db.todos.deleteOne({ title: "Learn MongoDB" })
```

**Expected Output:**
```javascript
{
  acknowledged: true,
  deletedCount: 1
}
```

#### Delete Multiple Documents

```javascript
db.todos.deleteMany({ completed: true })
```

#### Delete All Documents (⚠️ Use with Caution)

```javascript
db.todos.deleteMany({})
```

#### Drop Collection (⚠️ Deletes entire collection)

```javascript
db.todos.drop()
```

---

## Sample Dataset

To get started quickly, you can use the sample dataset provided. 

### Option 1: Using MongoDB Shell

Copy and paste the following commands in your MongoDB shell:

```javascript
use todos

db.todos.insertMany([
  {
    title: "Complete MongoDB Tutorial",
    description: "Finish reading the MongoDB tutorial and practice CRUD operations",
    completed: false,
    created_at: new Date("2024-01-15"),
    updated_at: new Date("2024-01-15")
  },
  {
    title: "Build Todo API",
    description: "Create REST API endpoints for todo management",
    completed: false,
    created_at: new Date("2024-01-16"),
    updated_at: new Date("2024-01-16")
  },
  {
    title: "Implement Authentication",
    description: "Add user authentication to the application",
    completed: false,
    created_at: new Date("2024-01-17"),
    updated_at: new Date("2024-01-17")
  },
  {
    title: "Write Unit Tests",
    description: "Create test cases for API endpoints",
    completed: true,
    created_at: new Date("2024-01-10"),
    updated_at: new Date("2024-01-18")
  },
  {
    title: "Deploy to Production",
    description: "Set up CI/CD pipeline and deploy application",
    completed: false,
    created_at: new Date("2024-01-20"),
    updated_at: new Date("2024-01-20")
  },
  {
    title: "Code Review",
    description: "Review pull requests from team members",
    completed: false,
    created_at: new Date("2024-01-21"),
    updated_at: new Date("2024-01-21")
  },
  {
    title: "Update Documentation",
    description: "Update API documentation and README files",
    completed: true,
    created_at: new Date("2024-01-12"),
    updated_at: new Date("2024-01-19")
  },
  {
    title: "Performance Optimization",
    description: "Optimize database queries and add indexes",
    completed: false,
    created_at: new Date("2024-01-22"),
    updated_at: new Date("2024-01-22")
  }
])
```

### Option 2: Using the Script File

Run the provided script file:

```bash
# Copy the script into the MongoDB container
docker cp mongo-tutorial/sample-data.js mongodb:/tmp/sample-data.js

# Execute the script
docker exec -it mongodb mongosh -u admin -p password123 --authenticationDatabase admin /tmp/sample-data.js
```

### Verify Data Insertion

After inserting the sample data, verify it:

```javascript
// Count total documents
db.todos.countDocuments()

// View all documents
db.todos.find().pretty()

// View only incomplete todos
db.todos.find({ completed: false }).pretty()

// View only completed todos
db.todos.find({ completed: true }).pretty()
```

---

## Practice Exercises

Try these exercises to reinforce your learning:

### Exercise 1: Query Practice
1. Find all todos created after January 15, 2024
2. Find todos that are not completed
3. Find todos with "API" in the title (use regex: `{ title: /API/ }`)

### Exercise 2: Update Practice
1. Mark "Build Todo API" as completed
2. Update the description of "Deploy to Production"
3. Add a `priority` field to all incomplete todos with value 1

### Exercise 3: Delete Practice
1. Delete all completed todos
2. Delete todos created before January 15, 2024

### Exercise 4: Aggregation Practice
1. Count todos by completion status
2. Find the oldest and newest todo
3. Group todos by completion status

---

## Useful MongoDB Shell Commands

### Database Operations

```javascript
// Show all databases
show dbs

// Show current database
db

// Switch database
use database_name

// Show collections in current database
show collections

// Get database stats
db.stats()
```

### Collection Operations

```javascript
// Get collection stats
db.todos.stats()

// Get collection indexes
db.todos.getIndexes()

// Create index
db.todos.createIndex({ title: 1 })

// Create unique index
db.todos.createIndex({ title: 1 }, { unique: true })

// Drop index
db.todos.dropIndex({ title: 1 })
```

### Helpful Commands

```javascript
// Clear the screen
cls

// Show help
help

// Exit shell
exit
// or
quit
```

---

## Common Issues and Solutions

### Issue: Cannot connect to MongoDB

**Solution:** Make sure Docker containers are running:
```bash
docker-compose ps
```

### Issue: Authentication failed

**Solution:** Check credentials match docker-compose.yml:
- Username: `admin`
- Password: `password123`
- Auth Database: `admin`

### Issue: Database not found

**Solution:** MongoDB creates databases lazily. Insert a document first:
```javascript
use mydatabase
db.mycollection.insertOne({ test: "data" })
```

### Issue: Unique index violation

**Solution:** MongoDB enforces unique indexes. Check for duplicates:
```javascript
db.todos.find({ title: "duplicate title" })
```

---

## Next Steps

Now that you've mastered the basics:

1. **Learn Aggregation Pipeline** - Complex data transformations
2. **Explore Indexes** - Improve query performance
3. **Study Transactions** - Multi-document operations
4. **Practice with Real Data** - Build a project using MongoDB
5. **Explore MongoDB Atlas** - Cloud-hosted MongoDB

---

## Additional Resources

- [MongoDB Official Documentation](https://www.mongodb.com/docs/)
- [MongoDB University](https://university.mongodb.com/)
- [MongoDB Shell (mongosh) Documentation](https://www.mongodb.com/docs/mongodb-shell/)

---

## Summary

In this tutorial, you learned:

✅ How to run MongoDB using Docker Compose  
✅ How to access MongoDB through Mongo Express web interface  
✅ How to connect to MongoDB shell  
✅ How to perform CRUD operations (Create, Read, Update, Delete)  
✅ How to work with sample datasets  
✅ Common MongoDB commands and best practices  

Happy coding! 🚀

