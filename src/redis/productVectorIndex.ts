import { redis } from "../server.js";

export const PRODUCT_INDEX_NAME = "idx:products";
export const PRODUCT_KEY_PREFIX = "allProducts:";

export async function createProductVectorIndex() {
    let indexExists = true;

    try {
        await redis.ft.info(PRODUCT_INDEX_NAME);
    } catch {
        indexExists = false;
    }

    if (indexExists) {
        console.log(
            `Redis index "${PRODUCT_INDEX_NAME}" already exists.`
        );
    } else {
        console.log("Creating Redis vector index...");

        await redis.ft.create(
            PRODUCT_INDEX_NAME,
            {
                embedding: {
                    type: "VECTOR",
                    ALGORITHM: "HNSW",
                    TYPE: "FLOAT32",
                    DIM: 1024,
                    DISTANCE_METRIC: "COSINE",
                },
                embeddingText: {
                    type: "TEXT",
                },
            },
            {
                ON: "HASH",
                PREFIX: PRODUCT_KEY_PREFIX,
            }
        );

        console.log(
            `Redis vector index "${PRODUCT_INDEX_NAME}" created successfully.`
        );
    }
}