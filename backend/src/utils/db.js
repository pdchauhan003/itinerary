import mg from 'mongoose';

export const connectDB = async () => {
    try {
        await mg.connect(process.env.MONGO_URI);

        console.log('MongoDB connected successfully');
    } catch (error) {
        console.log('MongoDB connection error', error);
        process.exit(1);
    }
};