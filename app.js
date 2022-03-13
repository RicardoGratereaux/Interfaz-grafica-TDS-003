



const express = require('express');
const app = express();

app.use(express.urlencoded({extended:false}));
app.use(express.json());

//llamado a dotenv
const dotenv = require('dotenv');
dotenv.config({path:'./env/.env'});

//llamado a public
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

//establece el motor de plantillas ejs
app.set('view engine', 'ejs');

//llamado a bcryptjs
const bcryptjs = require('bcryptjs');

//var. del session
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

//llamado al modulo de conexión de la BD
const connection = require('./database/db');
const { Router } = require('express');
const res = require('express/lib/response');


app.get('/login', (req, res) => {
    res.render('login');
})

app.post('/login', async (req, res) => {
    const name = req.body.name;
    const user = req.body.email;
    const pass = req.body.pass;
    let passwordHash = await bcryptjs.hash(pass, 8);
    connection.query('INSERT INTO user SET ?', {name:name, email:user, pass:passwordHash}, async (error, results) =>{
        if(error) {
            console.log(error);
        } else {
            res.render('login', {
                alert: true,
                alertTitle:'Registro',
                alertMessage: 'Registro Completado!',
                alertIcon: 'success',
                showConfirmButtom: false,
                timer: '',
                ruta: ''
            });
        }
    })
})

app.post('/auth', async (req, res) => {
    const user = req.body.login1;
    const pass = req.body.pass1;
    let passwordHash = await bcryptjs.hash(pass, 8);
    connection.query('SELECT * FROM user WHERE email = ?', [user], async (error, results) => {
        if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))) {
            res.render('login', {
                alert: true,
                alertTitle: 'Error',
                alertMessage: 'Usuario y/o contraseña incorrectas',
                alertIcon: 'error',
                showConfirmButtom: true,
                timer: '',
                ruta: 'login'
            });
        } else {
            req.session.loggedid = true;
            req.session.name = results[0].name
            res.render('login', {
                alert: true,
                alertTitle: 'Iniciando sesión...',
                alertMessage: '',
                alertIcon: 'success',
                showConfirmButtom: false,
                timer: 2000,
                ruta: ''
            });
        }
    })
})

app.get('/', (req, res) => {
    if(req.session.loggedid) {
        res.render('index', {
            login: true,
            name: req.session.name
        })
    } else {
        res.render('index', {
            login: false,
            name: ''
        })
    }
})

app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})

app.listen(3000, (req, res) => {
    console.log('SERVER RUNNING IN http://localhost:3000');
})