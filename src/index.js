
const express = require('express');
const bodyParser = require('body-parser');
const app  = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded ({ extended: false }));

app.use(function (req, res, next)
{
    res.header('Access-Control-Allow-Origin', '*');
     res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization'); 
     res.header('Access-Control-Allow-Credentials', true);
     next(); 
});

//app.get("/", (req, res)=> {
//res.send("ola");
//});
require('./app/controllers/index')(app);


app.listen(3001);

