import 'dotenv/config.js'
import { app } from './app.js'








const server = app.listen(process.env.PORT, () => {
    console.log('Server is running on port 3000');
})

process.on('unhandledRejection', (err) => {

    console.log('unhandledRejection', err)

    server.close(() => {
        process.exit(1)
    });
})

