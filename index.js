const express = require("express");

const app = express();
const port = process.env.PORT || 3003;

const {MongoClient, ServerApiVersion} = require("mongodb");
const uri = "mongodb+srv://cukinacha:SMfIkhwpVg54GBnj@cluster0.b9x0pn0.mongodb.net/?retryWrites=true&w=majority";
// const uri = "mongodb://127.0.0.1:27017";

const dbName = "ezss";
const dbColSetting = "setting";
const dbColShort = "short";

const moment = require('moment');
const md5 = require('md5');
const bodyParser = require('body-parser');

app.use(bodyParser());

app.set('view engine', 'ejs');


app.get('/', (req, res) => {
    const client = new MongoClient(uri);
    async function run() {
    try {
        // Connect to the "insertDB" database and access its "haiku" collection
        // const database = client.db(dbName);
        // const short = database.collection(dbColShort);

        // const getShorts = short.find({}).sort({time: -1}).limit(100);

        // var shortData = [];
        // for await (const short of getShorts) {
        //     shortData.push({
        //         title : short.title,
        //         time : moment(short.created_at).format("HH:mm:ss DD/MM/YYYY"),
        //         encode : short.encode,
        //         decode : short.decode,
        //         type: short.type,
        //         password: short.password
        //     })
        // }
       
        console.log(createRandomCode())

        // random characters

       // let randomCharacters = (Math.random() + 6).toString(36).slice(2,8);

        //console.log(randomCharacters);
        res.render('index',{
            //shortData : shortData,
            //randomCharacters: randomCharacters.toUpperCase()
        });
        

    } finally {
        // Close the MongoDB client connection
        await client.close();
    }
    }
    // Run the function and handle any errors
    run().catch(console.dir);
    
})

app.get("/ShortLink", (req, res) => {
    res.render('shortLink');
})

app.post('/ShortLink', (req, res) => {
    // console.log(req.body)
    if(req.body.url){
        const client = new MongoClient(uri);
        async function run() {
        try {
            const database = client.db(dbName);
            const short = database.collection(dbColShort);
            var alias = "";
            if(req.body.alias.length){
                alias = req.body.alias;
                const queryCheckAlias = await short.findOne({encode: alias});
                if(queryCheckAlias == null){
                    const insertResult = await short.insertOne({ 
                        type: "url",
                        encode: alias,
                        decode: req.body.url, 
                        title: req.body.title, 
                        password: req.body.password, 
                        time: new Date().getTime() 
                    });
                    console.log('Inserted a Short URL =>', insertResult);
                    res.send({
                        status: true,
                        messageCode: 1,
                        shortCode: alias
                    });
                }
                else{
                    res.send({
                        status: false,
                        messageCode: -2
                    });
                }
            }
            else{
                alias = createRandomCode();
                const insertResult = await short.insertOne({ 
                    type: "url",
                    encode: alias,
                    decode: req.body.url, 
                    title: req.body.title, 
                    password: req.body.password, 
                    time: new Date().getTime() 
                });
                console.log('Inserted a Short URL =>', insertResult);
                res.send({
                    status: true,
                    messageCode: 1,
                    shortCode: alias
                });
            }            
            

        } finally {
            // Close the MongoDB client connection
            await client.close();
        }
        }
        // Run the function and handle any errors
        run().catch(console.dir);
    }
    else{
        res.send({
            status: false,
            messageCode: -1
        });
    }
})


app.get('/list', (req, res) => {
    const client = new MongoClient(uri);
    async function run() {
    try {
        const database = client.db(dbName);
        const short = database.collection(dbColShort);

        const getShorts = short.find({}).sort({time: -1}).limit(100);

        var shortData = [];
        for await (const short of getShorts) {
            shortData.push({
                title : short.title,
                time : moment(short.created_at).format("HH:mm:ss DD/MM/YYYY"),
                encode : short.encode,
                decode : short.decode,
                type: short.type,
                password: short.password
            })
        }
       
        // console.log(createRandomCode())

        // random characters

       // let randomCharacters = (Math.random() + 6).toString(36).slice(2,8);

        //console.log(randomCharacters);
        res.render('list',{
            shortData : shortData
        });
        

    } finally {
        // Close the MongoDB client connection
        await client.close();
    }
    }
    // Run the function and handle any errors
    run().catch(console.dir);
    
})


app.get("/:shortCode", (req, res) => {
    const client = new MongoClient(uri);
    async function run() {
    try {
        // Connect to the "insertDB" database and access its "haiku" collection
        const database = client.db(dbName);
        const short = database.collection(dbColShort);

        const getShort = await short.findOne({ encode: req.params.shortCode });

        if(getShort != null){
            if(getShort.decode.length)
                res.redirect(getShort.decode);
            else{
                res.render('error',{
                    message : "không có thông tin decode cho: " + req.params.shortCode,
                });
            }
        }
        else{
            res.render('error',{
                message : "không có code này: " + req.params.shortCode,
            });
        }
        
        
        

    } finally {
        // Close the MongoDB client connection
        await client.close();
    }
    }
    // Run the function and handle any errors
    run().catch(console.dir);
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})


function createRandomCode(){
    let randomCharacters = (Math.random() + 6).toString(36).slice(2,7);
    var encodeChars = "";
    for(const char in randomCharacters){
        var randomBoolean = Math.random() < 0.5;
        if(randomBoolean)
            encodeChars += randomCharacters[char].toUpperCase();
        else
            encodeChars += randomCharacters[char];
    }
    return encodeChars;
}