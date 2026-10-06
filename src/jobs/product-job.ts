
import cron from "node-cron";
import { OpenRouter } from "@openrouter/sdk";

import Product from "../model/product.model.js";
import { redis } from "../server.js";

const openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

const EMBEDDING_MODEL = "liquid/lfm-2.5-embedding-350m:free";

const cronRedis = cron.schedule("* * * * *", async () => {
    console.log("Product sync cron running...");

    try {

        const products = await Product
            .find()
            .populate("category")
            .lean();

        for (const product of products) {
            const redisKey = `allProducts:${product._id}`;

            const existingProduct = await redis.hGet(
                redisKey,
                "data"
            );


            if (existingProduct) {
                const cachedProduct = JSON.parse(existingProduct);

                const mongoUpdatedAt = new Date(
                    product.updatedAt
                ).getTime();

                const redisUpdatedAt = new Date(
                    cachedProduct.updatedAt
                ).getTime();


                if (mongoUpdatedAt <= redisUpdatedAt) {
                    continue;
                }

                console.log(
                    `Product ${product._id} changed. Updating...`
                );
            } else {
                console.log(
                    `New product ${product._id}. Creating...`
                );
            }


            const categoryName =
                typeof product.category === "object" &&
                    product.category !== null
                    ? (product.category as any).name ?? ""
                    : "";

            const embeddingText = `
                Product: ${product.name ?? ""}

                Brand: ${product.brand ?? ""}

                Category: ${categoryName}

                Description: ${product.description ?? ""}

                Tags: ${Array.isArray(product.tags) ? product.tags.join(", ") : ""
                }
            `.trim();

            console.log(
                `Generating embedding for product ${product._id}...`
            );


            const embeddingResponse =
                await openrouter.embeddings.generate({
                    requestBody: {
                        model: EMBEDDING_MODEL,
                        input: embeddingText,
                    },
                });


            console.log("embeddingResponse", embeddingResponse);

            if (typeof embeddingResponse === "string") {
                console.error(
                    `OpenRouter returned a string instead of embeddings for product ${product._id}:`,
                    embeddingResponse
                );
                continue;
            }

            if (!embeddingResponse.data?.[0]) {
                console.error(
                    `OpenRouter returned no embeddings for product ${product._id}:`,
                    embeddingResponse
                );
                continue; 
            }

            const embedding =
                embeddingResponse.data[0].embedding;


            let embeddingBuffer: Buffer;

            if (typeof embedding === "string") {
                embeddingBuffer = Buffer.from(embedding, "base64");
            } else {
                embeddingBuffer = Buffer.from(
                    new Float32Array(embedding).buffer
                );
            }

            await redis.hSet(redisKey, {
                data: JSON.stringify(product),
                embedding: embeddingBuffer,
                embeddingText,
            });

            console.log(
                `Product ${product._id} successfully stored in Redis.`
            );
        }

        console.log("Product sync completed.");
    } catch (error) {
        console.error(
            "Product Redis sync error:",
            error
        );
    }
});

export default cronRedis;

