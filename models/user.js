const mongoose=require('mongoose');
const passportLocalMongoose=require('passport-local-mongoose');

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        minlength:4
    },
    password:{
        type:String
    }

})
userSchema.plugin(passportLocalMongoose);
const User=new mongoose.model('User',userSchema);
module.exports.User=User;