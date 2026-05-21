import mg from 'mongoose';

export const mongoConnection=mg.connect(process.env.MONGO_URI)
.then(()=>{console.log('mongodb connected success')})
.catch((error)=>{console.log('mongodb connection error')})