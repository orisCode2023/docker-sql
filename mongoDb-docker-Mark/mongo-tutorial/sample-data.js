// Sample Data Script for MongoDB Tutorial
// This script populates the todos database with sample data

// Switch to todos database
use('todos');

// Clear existing data (optional - uncomment if you want to reset)
// db.todos.deleteMany({});

// Insert sample todos
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
]);

// Display results
print("\n✅ Sample data inserted successfully!");
print("\nTotal documents: " + db.todos.countDocuments());
print("Completed todos: " + db.todos.countDocuments({ completed: true }));
print("Incomplete todos: " + db.todos.countDocuments({ completed: false }));
print("\nTo view all todos, run: db.todos.find().pretty()\n");

