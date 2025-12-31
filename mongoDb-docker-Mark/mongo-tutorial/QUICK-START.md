# MongoDB Quick Start Guide

A quick reference guide for common MongoDB operations.

## 🚀 Quick Setup

```bash
# Start services
docker-compose up -d

# Access MongoDB shell
docker exec -it mongodb mongosh -u admin -p password123 --authenticationDatabase admin
# or
docker exec -it mongodb mongosh -u admin -p password123

# Access Mongo Express (Browser)
# URL: http://localhost:8081
# Username: admin
# Password: admin123
```

## 📝 Basic Commands

### Connect to Database
```javascript
use todos
```

### Insert Data
```javascript
db.todos.insertOne({
  title: "My Todo",
  description: "Todo description",
  completed: false,
  created_at: new Date(),
  updated_at: new Date()
})
```

### Find Data
```javascript
// All documents
db.todos.find().pretty()

// With condition
db.todos.find({ completed: false })

// One document
db.todos.findOne({ title: "My Todo" })
```

### Update Data
```javascript
db.todos.updateOne(
  { title: "My Todo" },
  { $set: { completed: true, updated_at: new Date() } }
)
```

### Delete Data
```javascript
db.todos.deleteOne({ title: "My Todo" })
```

## 📊 Load Sample Data

```bash
docker cp mongo-tutorial/sample-data.js mongodb:/tmp/sample-data.js
docker exec -it mongodb mongosh -u admin -p password123 --authenticationDatabase admin /tmp/sample-data.js
```

## 🛑 Stop Services

```bash
docker-compose down
```

