// npm install cors
// npm install -g nodemon
//> nodemon server.js -->  por levantar server
// npm install --save body-parser --> para que entienda file JSON
// npm install jsonwebtoken --save
// npm install mongodb  //* base de datos



var express = require("express");
var cors = require('cors');
var bp = require('body-parser');
var jwt = require('jsonwebtoken');
var config = require('./configs/config');
var mongodb = require("mongodb");

/* Base de datos */

var uri = "mongodb+srv://mongoqwerty:firenzesalerno@cluster0.tb4bgp3.mongodb.net/?retryWrites=true&w=majority";

mongodb.MongoClient.connect(uri, {useUnifiedTopology: true}, function(err, data){
  if(err) throw err;
  var db = data.db('todolist');
  db.collection('tareas').find({}).toArray(function(err, result){
    tareas = result;
  })
})


var app = express();
var corsOpt = {
  origin: 'http://localhost:4200',
  optionsSuccesStatus: 200
}

var tareas = [];

var users = [{nombre: 'fran', email: 'fran@gmail.es', password: 'gogo', id: 0}];

//

app.use(bp.json());// parsea el body de las peticiones en 'json'
var api = express.Router();
var auth = express.Router(); 

api.use(cors());// aplicar siempre politica de 'CORS'


api.get("/tareas", cors(corsOpt), (req, res) => {
  res.json(tareas);
}); 

api.get("/tareas/:username", cors(corsOpt), (req, res) => {
  var username = req.params.username;
  var resultado = tareas.filter(tarea => tarea.usuario == username)
  res.json(resultado);
}); 


api.post("/tarea", cors(corsOpt), (req, res) => {
tareas.push(req.body);
res.json(req.body); 
});

// 'checkauth' està haciendo función de mildware
api.get("/users/yop", cors(corsOpt), checkauth, (req, res) => {
  res.json(users[req.user]);
});

api.post("/users/yop", cors(corsOpt), checkauth, (req, res) => {
  var user = users[req.user];
  user.nombre = req.body.nombre;
  user.email = req.body.email;
  res.json(user);
});

//* aplicando politica de 'CORS' con 'auth'
auth.use(cors());

auth.post("/login", cors(corsOpt), (req, res) => {
 var user = users.find(user => user.email == req.body.email);
 if (!user) 
 senderrorauth(res);
 if (user.password == req.body.password)
 sendtoken(user, res);
 else
 senderrorauth(res)
 //
}); 

auth.post("/register", cors(corsOpt), (req, res) => {
  var index = users.push(req.body) -1;
  var user = users[index];
  user.id = index;
  sendtoken(user, res); 
}); 

function sendtoken(user, res){
 var token = jwt.sign(user.id, config.llave);
 res.json({ nombre: user.nombre, token });
}

function senderrorauth( res){
return res.json({success: false, message: 'Email o passaword erroneo'});
}

// el mildware
function checkauth(req, res, next){
 if(!req.header('Authorization'))
 return res.status(401).send({message: 'No tienes autorización'})
 var token = req.header('authorization').split(' ')[1];
 var decode = jwt.verify(token, config.llave);
 if (!decode)
 return res.status(401).send({ message: "El token no es valido" })
 req.user = decode;
 console.log('ID usuario: ', decode)
 next();
}

app.use("/api", api);
app.use("/auth", auth);

app.listen(7070);
