const express=require('express');
const app=express();
const mongoose=require('mongoose');
const session=require('express-session');
const passport=require('passport')
const flash=require('connect-flash');
const passportLocalMongoose=require('passport-local-mongoose');

// const User=require('./models/user')

app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

app.use(session({
    secret:"This is secret.",
    resave:false,
    saveUninitialized:false,
    cookie:{
        httpOnly:true,
           expires:Date.now()+1000*60*60*24*7,
           maxAge:1000*60*60*24*7
       }
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(flash())

app.use((req,res,next)=>{
    res.locals.user=req.user;
    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.request=req;
    next();
})
const dbUrl='mongodb://localhost:27017/wa';

mongoose.connect(dbUrl, { useCreateIndex: true, useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false },(err,client)=>{
    if(!err)console.log("Database Connected!")
else console.log(err);
})
const userSchema=new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        minlength:4
    },
    email:{
        type:String
    },
    password:{
        type:String
    }

})

userSchema.plugin(passportLocalMongoose);
const User=new mongoose.model('User',userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get('/',(req,res)=>{
    if(!req.user)res.render('home',);
else  res.render('loggedin');
})
app.get('/userhome',(req,res)=>{
    if(req.isAuthenticated()){
        res.render('loggedin')
    }else res.redirect('/');
})
app.post('/login',(req,res)=>{
const user=new User({
    username:req.body.username,
password:req.body.password});
if(user){
req.login(user,(err)=>{
    if(err){
        console.log(err);
        res.redirect('/');
    }
    else {
        passport.authenticate('local',{failureFlash:true,failureRedirect:'/'})(req,res,()=>{
            req.flash('success',`Welcome Back ${req.user.username}`)
            res.redirect('/userhome');
    })
}})}
else {
    req.flash('error',`You need to login first!! Please provide valid login credentials!`)
    res.redirect('/') ;
}
})
app.post('/register',(req,res)=>{
User.register({username:req.body.username,
    email:req.body.email},req.body.password,(err,user)=>{
    if(err){res.redirect('/');}
    else{
        passport.authenticate('local')(req,res,()=>{
            req.flash('success',`Welcome ${req.user.username}`)
            res.redirect('/userhome');
        })
    }
})
})
app.post('/logout',(req,res)=>{
    if(req.isAuthenticated()){
        req.logout();
        req.flash('success',`Bye Bye!`)
    res.redirect('/');}
    else {
        req.flash('error',`You need to login first!!`)
        res.redirect('/') ;}
})
app.get('/create-post',(req,res)=>{
    if(req.isAuthenticated()){
        res.render('postform');
    }
    else {
        req.flash('error',`You need to login first to create a post!!`)
        res.redirect('/') ;
    }
})
app.post('/create-post',(req,res)=>{
    if(req.isAuthenticated()){
        
    }
    else {
        req.flash('error',`You need to login first to create a post!!`)
        res.redirect('/') ;
    }
})
const port=3000;
app.listen(3000,()=>{
    console.log(`Listening at port ${port}`)
})