// npm install cors
// npm install -g nodemon
//> nodemon server.js -->  por levantar server
// npm install --save body-parser --> para que entienda file JSON
// npm install jsonwebtoken --save
// npm install mongodb  //* base de datos


const express = require("express");
const cors = require('cors');
const bp = require('body-parser');
const jwt = require('jsonwebtoken');
const config = require('./configs/config');
const MongoClient = require("mongodb").MongoClient;


/* Base de datos */
const uri = "mongodb+srv://mongoqwerty:firenzesalerno@cluster0.tb4bgp3.mongodb.net/?retryWrites=true&w=majority";

const app = express();
const corsOpt = {
  origin: "http://localhost:4200",
  optionsSuccesStatus: 200,
};

//
MongoClient.connect(uri, {useUnifiedTopology: true}, function(err, data){
  if(err) throw err;
  let db = data.db('todolist');
  const mtareas = db.collection('tareas');

let tareas = [];

// let users = [{nombre: 'fran', email: 'fran@gmail.es', password: 'gogo', id: 0}];

//
app.use(bp.json());// parsea el body de las peticiones en 'json'
const api = express.Router();
const auth = express.Router(); 

api.use(cors());// aplicar siempre politica de 'CORS'

api.get("/tareas", cors(corsOpt), (req, res) => {
  mtareas.find({}).toArray(function(err, result) {
    tareas = result;
  })
  res.json(tareas);
}); 

api.get("/tareas/:username", cors(corsOpt), (req, res) => {
  let username = req.params.username;
  let resultado = tareas.filter(tarea => tarea.usuario == username)
  res.json(resultado);
}); 


api.post("/tarea", cors(corsOpt), (req, res) => {
  mtareas.insertOne(req.body).then(result => {
    console.log(result)
  }).catch(error => console.log(error))
  res.json(req.body); 
});

// 'checkauth' està haciendo función de mildware
api.get("/users/yop", cors(corsOpt), checkauth, (req, res) => {
  res.json(users[req.user]);
});

api.post("/users/yop", cors(corsOpt), checkauth, (req, res) => {
  let user = users[req.user];
  user.nombre = req.body.nombre;
  user.email = req.body.email;
  res.json(user);
});


//* aplicando politica de 'CORS' con 'auth'
auth.use(cors());

auth.post("/login", cors(corsOpt), (req, res) => {
 let user = users.find(user => user.email == req.body.email);
 if (!user) 
 senderrorauth(res);
 if (user.password == req.body.password)
 sendtoken(user, res);
 else
 senderrorauth(res)
}); 

auth.post("/register", cors(corsOpt), (req, res) => {
  let index = users.push(req.body) -1;
  let user = users[index];
  user.id = index;
  sendtoken(user, res); 
}); 

function sendtoken(user, res){
 let token = jwt.sign(user.id, config.llave);
 res.json({ nombre: user.nombre, token });
};

function senderrorauth( res){
return res.json({success: false, message: 'Email o passaword erroneo'});
};

// el mildware
function checkauth(req, res, next){
 if(!req.header('Authorization'))
 return res.status(401).send({message: 'No tienes autorización'})
 let token = req.header('authorization').split(' ')[1];
 let decode = jwt.verify(token, config.llave);
 if (!decode)
 return res.status(401).send({ message: "El token no es valido" })
 req.user = decode;
 console.log('ID usuario: ', decode)
 next();
};

app.use("/api", api);
app.use("/auth", auth);

app.listen(7070);

});



