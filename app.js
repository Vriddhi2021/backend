const express = require('express');

const app = express();

app.use(express.json());

app.use('/test',(req,res) => {
    res.status(200).json({"test" : "Workingggggggg"});
})

app.listen(5000);