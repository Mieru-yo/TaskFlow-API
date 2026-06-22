const mongoose = require('mongoose');

const connect = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/taskflow';
  await mongoose.connect(uri);
};

module.exports = { connect };
