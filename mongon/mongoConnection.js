import { MongoClient } from "mongodb";

const client = new MongoClient(process.env.MONGO_URI);
try {
    await client.connect();
    console.log("connected to mongo db");
} catch (error) {
    console.log("could not connect to mongo", error.message);
}

const db = client.db('test');
const collection = db.collection('users');

// const user = await collection.insertOne({username: "Barak", password: "123456"});
// console.log(user)

// await collection.createIndex({username: 1});

// const findUser = await collection.findOne({username: "Barak", unique: true}); 
// console.log(findUser);

// const updateUser = await collection.updateOne({username: "Barak"}, {$ser: {username: "Hanan"}})
// console.log(updateUser)


// const updateUser = await collection.replaceOne({username: "Barak"}, {username: "Hanan"})

// await collection.findOneAndDelete({username: "Barak"})

const users = await collection.find({}).sort('username ').toArray()
console.log(users)

await client.close();