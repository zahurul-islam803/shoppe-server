const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const morgan = require("morgan");
const port = process.env.PORT || 5000;

// middleware
const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));


const client = new MongoClient(process.env.DB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    const usersCollection = client.db("trendBurst").collection("users");
    const productsCollection = client.db("trendBurst").collection("products");
    const cartsCollection = client.db("trendBurst").collection("carts");

    // get all product
    app.get("/products", async (req, res) => {
      let queryObj = {};
      const category = req.query.category;
      if (category) {
        queryObj.category = category;
      }
      const result = await productsCollection.find(queryObj).toArray();
      res.send(result);
    });

    // get single product
    app.get('/products/:id', async(req, res) => {
      const id = req.params.id;
      const result = await productsCollection.findOne({_id: new ObjectId(id)});
      res.send(result);
    })

    // post data to cart
    app.post('/products/cart', async(req, res)=> {
      const cart = req.body;
      const result = await cartsCollection.insertOne(cart);
      res.send(result);
    })

    // get cart data
    app.get('/carts', async(req, res)=>{
      const email = req.query.userEmail;
      const query = {email: email};
      const result = await cartsCollection.find(query).toArray();
      res.send(result);
    })

    // delete cart item
    app.delete('/carts/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await cartsCollection.deleteOne(query);
      res.send(result);
    })

    // Save or modify user email, status in Database
    app.put("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const options = { upsert: true };
      const result = await usersCollection.updateOne(
        query,
        {
          $set: user,
        },
        options
      );
      res.send(result);
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from TrendBurst Server..");
});

app.listen(port, () => {
  console.log(`TrendBurst is running on port ${port}`);
});