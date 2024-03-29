const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const stripe = require("stripe")(process.env.SECRET_KEY_API)
const port = process.env.PORT || 5000;

// middleWare
app.use(cors())
app.use(express.json())

// verifyJWT
const verifyJWT =(req, res, next)=>{
  const authorization = req.headers.authorization;
  // console.log({authorization})
  if(!authorization){
    return res.status(401).send({error: true, message: 'Unauthorized Access'})
   
  }

  // varify token
  const token = authorization.split(' ')[1]
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded)=>{
    if(err){
      // console.log({err})
      return res.status(401).send({error: true, message: 'Unauthorized Access'})
     
    }
    req.decoded = decoded
    next()
  })
}




const uri =`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pnta7vo.mongodb.net/?retryWrites=true&w=majority`;

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
    const userCollection = client.db("summerCamp").collection("users");
    const classCollection = client.db("summerCamp").collection("classes");
    const myClassCollection = client.db("summerCamp").collection("myclass");


const verifyAdmin = async (req, res, next)=>{
  const email = req.decoded.email;
  const query = {email: email};
  const user = await userCollection.findOne(query);
  if(user?.role !== 'admin'){
    return res.status(403).send({error: true, message: 'Forbidden Access'})
  }
  next()
}

// Json Web Token
app.post('/jwt', (req, res)=>{
  const user = req.body;
  const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' })
  res.send({token})
})

// Users API
app.get('/users', verifyJWT, verifyAdmin, async(req, res)=>{
  const result = await userCollection.find().toArray();
  res.send(result)
})
app.post('/users', async(req, res)=>{
  const users = req.body;
  const query = {email:users.email};
  const existingUser = await userCollection.findOne(query)
  if(existingUser){
    return res.send({message: 'User Already Exist'})
  }
  const result = await userCollection.insertOne(users);
  res.send(result)
})

app.get('/users/admin/:email', verifyJWT, async(req, res)=>{
  const email = req.params.email;

  if(req.decoded.email !== email){
    return res.send({admin: false})
  }
  const query = {email: email};
  const user = await userCollection.findOne(query);
  const result = {admin: user?.role === 'admin'}
  res.send(result)
})

app.patch('/users/admin/:id',async(req, res)=>{
  const id = req.params.id;
  // console.log(id)
  const filter = {_id: new ObjectId(id)};
  const updateUser = {
    $set:{
      role: "admin"
    }
  }
  const result = await userCollection.updateOne(filter, updateUser)
  res.send(result)
})

    // Class API
app.get('/classes', async(req, res)=>{
    const result = await classCollection.find().toArray();
    res.send(result)
})
// My Class Api

app.get('/myclass', verifyJWT, async(req, res)=>{
    const email = req.query.email;
    if(!email){
        res.send([])
    };
    const decodedEmail = req.decoded.email;
    // console.log(req.decoded)
    if(email !== decodedEmail){
    return  res.status(401).send({error: true, message: 'Forbidden Access'})
    
    }
    const query = {email: email};
    const result = await myClassCollection.find(query).toArray();
    res.send(result)
})
app.post('/myclass', async(req, res)=>{
    const classes = req.body;
    // console.log(classes)
    // const query = {email:classes.email};
    // console.log(query)
    // const existingUser = await userCollection.findOne(query)
    // if(existingUser){
    //   return res.send({message: 'Class Already Exist'})
    // }
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