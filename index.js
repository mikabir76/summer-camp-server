const express = require('express');
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const port = process.env.PORT || 5000;

// middleWare
app.use(cors())
app.use(express.json())






const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pnta7vo.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const classCollection = client.db("summerCamp").collection("classes");
    const myClassCollection = client.db("summerCamp").collection("myclass");

    // Class API
app.get('/classes', async(req, res)=>{
    const result = await classCollection.find().toArray();
    res.send(result)
})
// My Class Api

app.get('/myclass', async(req, res)=>{
    const email = req.query.email;
    if(!email){
        res.send([])
    }
    const query = {email: email};
    const result = await myClassCollection.find(query).toArray();
    res.send(result)
})
app.post('/myclass', async(req, res)=>{
    const classes = req.body;
    const result = await myClassCollection.insertOne(classes);
    res.send(result)
});
app.delete('/myclass/:id', async(req, res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)};
    const result = await myClassCollection.deleteOne(query)
    res.send(result)
})

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);









app.get('/', (req, res)=>{
    res.send('Summer School Camp is Running')
})

app.listen(port, ()=>{
    console.log(`Summer camp running or port ${port}`)
})