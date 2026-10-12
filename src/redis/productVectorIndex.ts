import { redis } from "../server.js";

export const PRODUCT_INDEX_NAME = "idx:products";
export const PRODUCT_KEY_PREFIX = "allProducts:";

export async function createProductVectorIndex() {
    try {
        await redis.ft.info(PRODUCT_INDEX_NAME);

        console.log(
            `Redis index "${PRODUCT_INDEX_NAME}" already exists.`
        );

        return;
    } catch {
        // Index doesn't exist. Create it below.
    }

    await redis.ft.create(
        PRODUCT_INDEX_NAME,
        {
            embedding: {
                type: 'VECTOR',
                ALGORITHM: 'HNSW',
                TYPE: "FLOAT32",
                DIM: 1024,
                DISTANCE_METRIC: "COSINE",
            },

            embeddingText: {
                type: 'TEXT',
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