const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());


app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ghizsnl.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
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

    const productCollection = client.db("prsCollection").collection("productData");
    const userDataCollection = client.db("prsCollection").collection("userData");
    const requestedProductCollection = client
      .db("prsCollection")
      .collection("requestedProduct");
    
    app.post("/addProduct", async (req, res) => {
        const addProduct = req.body;
        // console.log(addProduct);

      const result = await productCollection.insertOne(addProduct);
      res.send(result);
    });
      
      app.get("/allProduct", async (req, res) => {
        const cursor = productCollection.find();
        const result = await cursor.toArray();
        res.send(result);
      });
    
    app.post("/requestProduct", async (req, res) => {
      const addRequestedProduct = req.body;
      // console.log(addProduct);

      const result = await requestedProductCollection.insertOne(addRequestedProduct);
      res.send(result);
    });

    app.get("/allRequestProduct", async (req, res) => {
      const cursor = requestedProductCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });



    app.post("/addUser", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userDataCollection.findOne(query);

      if (existingUser) {
        return res.send({ message: "user already exists" });
      }

      const result = await userDataCollection.insertOne(user);
      res.send(result);
    });

    app.get("/checkUser/:email", async (req, res) => {
      const email = req.params.email;

      const query = { email: email };
      const user = await userDataCollection.findOne(query);
      if (user) {
        const result = {  role: user.role };
        res.send(result);
      } else {
        res.status(404).send({ message: "User not found." });
      }
    });


    app.get("/allUser", async (req, res) => {
      const cursor = userDataCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.patch("/users/approve/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          approval: "approve",
        },
      };

      const result = await userDataCollection.updateOne(filter, updateDoc);
      res.send(result);
    });


    app.patch("/users/denied/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          approval: "denied",
        },
      };

      const result = await userDataCollection.updateOne(filter, updateDoc);
      res.send(result);
    });


    

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("server is running");
});

app.listen(port, () => {
  console.log(`server is running on port: ${port}`);
});
