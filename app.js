const express=require('express');
const app=express();
const mongoose=require('mongoose');
const session=require('express-session');
const passport=require('passport')
const passportLocalMongoose=require('passport-local-mongoose');
const connectEnsureLogin=require('connect-ensure-login');
const flash=require('connect-flash')
const methodOverride = require('method-override');
app.use(methodOverride('_method'));



app.set('view engine','ejs');
app.use(express.urlencoded({extended:false}));
app.use(express.static('public'))

app.use(session({
    secret:"This is secret.",
    resave:false,
    saveUninitialized:true
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
//const y=' || 'mongodb://localhost:27017/wa' ||;
const dbUrl= process.env.DB_URL || 'mongodb://localhost:27017/wa';
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
const postSchema=new mongoose.Schema({
    title:{
        type:String,
        
    },
    body:{
        type:String
    },
    author:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
    
})
const Post=new mongoose.model('Post',postSchema);
app.get('/',(req,res)=>{
    if(req.isAuthenticated()) res.redirect('/userhome');
else res.render('home')
})
app.get('/userhome',connectEnsureLogin.ensureLoggedIn('/'),async (req,res)=>{
    const y=await Post.find({}).populate('author');
   
res.render('loggedin',{user:req.user,y});

})
app.post('/login', passport.authenticate('local', { failureFlash:true,failureRedirect: '/' }),  function(req, res) {
                req.flash('success',`Welcome ${req.user.username}`)
	res.redirect('/userhome');

})
app.get('/:id/edit-post',async (req,res)=>{
    if(req.isAuthenticated()){
        const {id}=req.params;
        const y=await Post.findById(id);
        console.log(y);
        res.render('edit',{y});
    }
    else {
        req.flash('error','You must be logged in to create a post!')
        res.redirect('/');
    }
})
app.put('/:id/update',async (req,res)=>{
const y=req.params;
console.log(y);
const newp=await Post.findByIdAndUpdate(y.id,{title:req.body.title,body:req.body.body});
await newp.save();
 res.redirect('/userhome');


})
app.delete('/:id/delete',async (req,res)=>{
    const y=req.params;
    console.log(y);
  await Post.findByIdAndDelete(y.id);
     res.redirect('/userhome');
    
    
    })
app.post('/register',(req,res)=>{
    User.register({username:req.body.username,
        email:req.body.email},req.body.password,(err,user)=>{
            
            if(err){ req.flash('error','Invalid');res.redirect('/');}
        else{
            passport.authenticate('local',{ failureFlash:true})(req,res,()=>{
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
        req.flash('error','You must be logged in to create a post!')
        res.redirect('/');
    }
})
app.post('/create-post',async (req,res)=>{

const y=new Post({title:req.body.title,body:req.body.body,author:req.user._id});
await y.save();
console.log(y);
res.redirect('/userhome');
})
const port=3000;
app.listen(3000,()=>{
    console.log(`Listening at port ${port}`)
})