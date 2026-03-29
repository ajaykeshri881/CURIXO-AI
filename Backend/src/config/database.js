const mongoose = require('mongoose')
const dns = require("dns");

dns.setServers(["8.8.8.8", "8.8.4.4"]); // remove this after developemt..

const connectToDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB connected successfully');
    } catch (error) {
        console.error('Database connection error: ', error);
        process.exit(1);
    }
}

module.exports = connectToDB;