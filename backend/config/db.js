const mongoose = require('mongoose');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let mongodProcess = null;

const startLocalMongo = async () => {
  return new Promise((resolve) => {
    const dbDir = path.join(__dirname, '..', '..', 'data', 'db');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }
    console.log(`[Database] Attempting to start local mongod at ${dbDir}...`);
    try {
      mongodProcess = spawn('mongod', ['--dbpath', dbDir, '--port', '27017', '--bind_ip', '127.0.0.1'], {
        detached: false,
        stdio: 'ignore'
      });
      mongodProcess.on('error', (err) => {
        console.warn('[Database] Local mongod spawn notice:', err.message);
        resolve(false);
      });
      // Give it 2 seconds to initialize
      setTimeout(() => resolve(true), 2000);
    } catch (e) {
      console.warn('[Database] Could not spawn local mongod:', e.message);
      resolve(false);
    }
  });
};

const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fintrack';
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000
    });
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.log('[Database] Direct connection failed, attempting local auto-launch...');
    await startLocalMongo();
    try {
      const conn = await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000
      });
      console.log(`[Database] MongoDB Connected after auto-launch: ${conn.connection.host}`);
      return conn;
    } catch (retryError) {
      console.error(`[Database Error] ${retryError.message}`);
      console.log('[Database Tip] Ensure MongoDB is running on port 27017 or set MONGO_URI in backend/.env');
    }
  }
};

process.on('SIGINT', () => {
  if (mongodProcess) {
    try { mongodProcess.kill(); } catch (e) {}
  }
  process.exit(0);
});

module.exports = connectDB;
