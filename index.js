const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function verifyJwt(req,res,next){
    const authHeader = req.headers.autthorization;
    if(authHeader){
        return res.status(401).send({message: 'unauthorized access'})
    }
    console.log(authHeader)
    next();
}
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jgepi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const bikeCollection = client.db('bikeWarehouse').collection('product');
        app.get('/product', async(req, res) => {
            const query = {};
            const cursor = bikeCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        });

        app.post('/login', async(req,res) =>{
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET,{
                expiresIn: '2d'
            })
            res.send(accessToken)
        })

        app.get('/product/:id', async(req,res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const service = await bikeCollection.findOne(query);
            res.send(service)
        })

        app.post('/product', verifyJwt, async(req,res) =>{
            const newProduct = req.body;
            const result = await bikeCollection.insertOne(newProduct);
            res.send(result);
        })

        app.delete('/product/:id', async(req,res) =>{
            const id = req.params.id;
            const query = {_id: ObjectId(id)};
            const result = await bikeCollection.deleteOne(query);
            res.send(result);

        });

       

    }
    finally {

    }

}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('running bike warehouse')
})

app.listen(port, () => {
    console.log('this is port', port)
})



