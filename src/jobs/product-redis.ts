import cron from 'node-cron';
import Product from '../model/product.model.js';
import { redis } from '../server.js';

const cronRedis = cron.schedule("* * * * *", async () => {
    console.log("Cron job running every minute");

    const setAllProductsInRedis = await Product.find()

    const productsInRedis = await redis.get('allProducts')
    if (productsInRedis) {
        return
    }

    for (const product of setAllProductsInRedis) {
        await redis.set(`allProducts:${product._id}`, JSON.stringify(product), { EX: 60 })
    }
});

export default cronRedis;