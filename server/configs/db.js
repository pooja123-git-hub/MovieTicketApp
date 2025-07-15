import mongoose from "mongoose";
const connectDb=async()=>{
    try {
        mongoose.connection.on('connected',()=>{console.log('Database Connected')});
        await mongoose.connect(`${process.env.MONGODB_URL}/QuickShow`)
    } catch (error) {
        console.log(error.message);
    }
}
export default connectDb;