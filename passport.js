const express = require("express");
let expressSession = require("express-session");
let passport = require("passport");
let LocalStrategy = require("passport-local").Strategy;
let usuarios = [];

const app = express();
let {config} = require("./config");
let path = require("path");


app.use(express.json());
app.use(express.urlencoded({extended:true}));

app.set("views", path.join(__dirname, 'views', 'ejs'));
app.set("view engine", "ejs");

// ------------------------ PASSPORT-----------------------------------

passport.use('login', new LocalStrategy((username, password, done)=>{
    try {
        let user = usuarios.find(user => user.username == username);
        if(!user)return done(null, false);

        if(user.password !== password)return done(null, false);

        user.contador = 0;
        return done(null, user);
    } catch (error) {
        console.log(error);
    }
}));


passport.use('register', new LocalStrategy({
    passReqToCallback: true
},(req, username, password, done)=>{
    try {
        let { telefono } = req.body;
        let usuario = usuarios.find(user => user.username == username);
        if(usuario) return done("Already registered!")
        const user = {
            username, password, telefono
        }
        usuarios.push(user);
        user.contador = 0;
        return done(null, user);
    } catch (error) {
        console.log(error);
    }
}));

passport.serializeUser((user, done)=>{
    done(null, user.username);
});

passport.deserializeUser((username, done)=>{
    let usuario = usuarios.find(user => user.username == username);
    done(null, usuario);
});

app.use(expressSession({
    secret: config.secret_key,
    resave:false,
    saveUninitialized:false,
    rolling:true
}))


app.use(passport.initialize());
app.use(passport.session());




let isLogin = (req, res, next)=>{
    try {
        if(req.isAuthenticated()){
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
        if(!req.isAuthenticated()){
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
    if(!user.contador) {
        user.contador = 1;
    }else{
        user.contador++;
    }
    res.render('datos', {contador : user.contador, usuario: req.user} );
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
app.post("/registro",  passport.authenticate('register', {failureRedirect:"error", successRedirect:"datos"}));

app.post("/login", passport.authenticate('login', {failureRedirect:"registro", successRedirect:"datos"}));

app.listen(config.port, ()=>{
    console.log(`Server on http://localhost:${config.port}`);
})