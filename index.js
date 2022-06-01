const express = require("express");
let expressSession = require("express-session");

const app = express();
let {config} = require("./config");
let path = require("path");


app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.use(expressSession({
    secret: config.secret_key,
    resave:false,
    saveUninitialized:false
}))

app.set("views", path.join(__dirname, 'views', 'ejs'));
app.set("view engine", "ejs");

let usuarios = [];

let isLogin = (req, res, next)=>{
    try {
        if(req.session.user){
            next();
        }else{
            res.redirect("/error");
        }
    } catch (error) {
        console.log(error);
    }
}

let isNotLogin = (req, res, next)=>{
    try {
        if(!req.session.user){
            next();
        }else{
            res.redirect("/datos");
        }
    } catch (error) {
        console.log(error);
    }
}

app.get("/registro", isNotLogin, (req,res,next)=>{
    res.render("registro", {});    
});

app.get("/login", isNotLogin, (req,res,next)=>{
    res.render("login", {});
});

app.get("/datos", isLogin, (req,res,next)=>{
    res.render('datos', {usuario: req.session.user} );
});

app.get("/error", isNotLogin, (req,res,next)=>{
    res.render("error",{error:"Estamos en error!"});
});


app.get("/logout", (req,res,next)=>{
    req.session.destroy(err =>{
        if(err) return res.send(JSON.stringify(err));
        res.redirect("/registro");
    })
});


// Métodos post
app.post("/registro", (req,res,next)=>{
    try {
        let { username,  password, telefono} = req.body;
        let usuario = usuarios.find(user => user.username == username);
        if(usuario)return res.json({"Error": "El usuario ya existe!"});
        const user = {
            username, password, telefono
        }
        usuarios.push(user);
        req.session.user = user;
        res.redirect("/datos");
    } catch (error) {
        console.log(error);
    }
});

app.post("/login", (req,res,next)=>{
    try {
        let { username,  password } = req.body;
        let usuario = usuarios.find(user => user.username == username);
        if(!usuario)return res.json({"Error": "El usuario NO existe!"});
        if(usuario.password == password) {
            req.session.user = usuario;
            return res.redirect("/datos");
        }
        return res.json({"Error": "Tus datos no coinciden"});
    } catch (error) {
        console.log(error);
    }
});

app.listen(config.port, ()=>{
    console.log(`Server on http://localhost:${config.port}`);
})