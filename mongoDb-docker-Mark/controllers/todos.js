import { ObjectId } from "mongodb";

// {baseUrl}/todos
// {baseUrl}/todos?completed=true
// {baseUrl}/todos?completed=false
export const getTodos = async (req, res) => {
  try {
    const { completed } = req.query;
    const mongoConn = req.mongoConn;
    const todosCollection = mongoConn.collection("todos");

    let query = {};

    if (completed === "true") {
      query.completed = true;
    } else if (completed === "false") {
      query.completed = false;
    }

    const todosArr = await todosCollection.find(query).toArray();

    res.status(200).json({ msg: "success", data: todosArr });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "error: " + err.message, data: null });
  }
};

// {baseUrl}/todos/1
export const getTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoConn = req.mongoConn;
    const todosCollection = mongoConn.collection("todos");

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, data: {}, message: "Invalid id format" });
    }

    const objectId = ObjectId.createFromHexString(id);
    const todo = await todosCollection.findOne({ _id: objectId });

    if (!todo) {
      res.status(404).json({ success: false, data: {} });
    } else {
      res.status(200).json({ success: true, data: todo });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: error.message });
  }
};

// {baseUrl}/todos/1
export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { body } = req;
    const mongoConn = req.mongoConn;
    const todosCollection = mongoConn.collection("todos");

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, data: {}, message: "Invalid id format" });
    }

    const objectId = ObjectId.createFromHexString(id);
    const todo = await todosCollection.findOne({ _id: objectId });

    if (!todo) {
      return res
        .status(404)
        .json({ success: false, data: {}, message: `todo with the id of ${id} not found` });
    }

    // Build update object dynamically based on provided fields
    const updateFields = {};

    if (body.title !== undefined) {
      updateFields.title = body.title;
    }
    if (body.description !== undefined) {
      updateFields.description = body.description;
    }
    if (body.completed !== undefined) {
      updateFields.completed = body.completed === true || body.completed === "true";
    }
    updateFields.updated_at = new Date();

    await todosCollection.updateOne({ _id: objectId }, { $set: updateFields });

    const updatedTodo = await todosCollection.findOne({ _id: objectId });
    res.status(200).json({ success: true, data: updatedTodo });
  } catch (error) {
    // Handle duplicate key error (unique index violation)
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        data: {},
        message: "A todo with this title already exists",
      });
    }
    console.error(error);
    res.status(500).json({ success: false, data: error.message });
  }
};

// {baseUrl}/todos/1
export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const mongoConn = req.mongoConn;
    const todosCollection = mongoConn.collection("todos");

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, data: {}, message: "Invalid id format" });
    }

    const objectId = ObjectId.createFromHexString(id);
    const todo = await todosCollection.findOne({ _id: objectId });

    if (!todo) {
      return res
        .status(404)
        .json({ success: false, data: {}, message: `Todo with id ${id} not found` });
    }

    await todosCollection.deleteOne({ _id: objectId });
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, data: error.message });
  }
};

// Create todo
export const createTodo = async (req, res) => {
  try {
    const isCompleted = req.body.completed === "true" || req.body.completed === true;
    const mongoConn = req.mongoConn;
    const todosCollection = mongoConn.collection("todos");

    const now = new Date();

    const newTodo = {
      title: req.body.title || "default todo",
      description: req.body.description || "",
      completed: isCompleted,
      created_at: now,
      updated_at: now,
    };

    const result = await todosCollection.insertOne(newTodo);

    const todo = await todosCollection.findOne({ _id: result.insertedId });
    res.status(201).json({ msg: "success", data: todo });
  } catch (err) {
    console.error(err);
    // Handle duplicate key error (unique index violation)
    if (err.code === 11000) {
      return res.status(409).json({
        msg: "error",
        data: null,
        message: "A todo with this title already exists",
      });
    }
    res.status(500).json({ msg: "error: " + err.message, data: null });
  }
};
