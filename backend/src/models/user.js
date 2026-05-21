import mg, { model } from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema=new mg.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    refreshToken:{type:String},
    createdAt:{type:String,default:Date.now},
})

userSchema.index({email:1,createdAt:-1});

userSchema.pre('save',async function(next){
    if(!this.isModified('password')){
        return next();
    }
    this.password=await bcrypt.hash(this.password,10);
    next();
})

userSchema.methods.conparePassword=async function(password){
    return await bcrypt.compare(password,this.password);
}

const User=new model('User',userSchema);

export {User};