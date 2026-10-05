import 'dotenv/config.js'
import { app } from './app.js'
import mongoose from 'mongoose'
import { createClient } from 'redis'


export const redis = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
})

redis.on('error', (err) => {
  console.error('Redis Error:', err)
})


await redis.connect()
console.log('Redis connected')


mongoose.connect(process.env.MONGODB_URI!).then((connection) => {
  console.log('Connected to the database');
}).catch((err) => {
  console.log('Error connecting to the database', err);
});


const server = app.listen(process.env.PORT, () => {
  console.log('Server is running on port 3000');
})

process.on('unhandledRejection', (err) => {

  console.log('unhandledRejection', err)

  server.close(() => {
    process.exit(1)
  });
})

