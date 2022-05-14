const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

function verifyJwt(req, res, next) {
    const authHeader = req.headers.autthorization;
    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (error, decoded) => {
        if (error) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })

}
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.jgepi.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        console.log('db-connected')
        const bikeCollection = client.db('bikeWarehouse').collection('product');
        app.get('/product', async (req, res) => {
            const query = {};
            const cursor = bikeCollection.find(query);
            const products = await cursor.toArray();
            res.send(products)
        });

        app.post('/login', (req, res) => {
            const email = req.body;
            const accessToken = jwt.sign(email, process.env.ACCESS_TOKEN_SECRET);
            res.send({ accessToken });
        });
        
        app.get('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await bikeCollection.findOne(query);
            res.send(service)
        });

        app.get('/myitems', async (req, res) => {
            const email = req.query.email;
                const query = { email };
                const cursor = bikeCollection.find(query);
                const myItems = await cursor.toArray();
                res.send(myItems);
        })


        app.post('/additems', async (req, res) => {
            const newProduct = req.body;
            console.log(newProduct)
            const result = await bikeCollection.insertOne(newProduct);
            res.send(result);
        });
        app.put('/product/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    quantity: data.newQuantity
                }
            };
            const result = await bikeCollection.updateOne(filter, updateDoc, options)
            res.send(result)
        });


        app.delete('/product/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
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



