const mongoose = require('mongoose');

const conectaDB = async ()=>{
    try{
        await mongoose.connect(process.env.DB_MONGO,{
            // useNewUrlParser: true,
            // useUnifiedTopology: true,
            // useFindAndModify: false,
            // useCreateIndex: true
        });
        console.log("Db conectada");
    }catch(error){
        console.log("Error");
        console.log(error);
        process.exit(1)
    }
}

module.exports = conectaDB;