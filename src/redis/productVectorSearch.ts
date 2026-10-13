import { OpenRouter } from "@openrouter/sdk";
import { redis } from "../server.js";
import { PRODUCT_INDEX_NAME } from "./productVectorIndex.js";

const openrouter = new OpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY,
});

const EMBEDDING_MODEL = "liquid/lfm-2.5-embedding-350m:free";
const CHAT_MODEL = "nvidia/nemotron-3.5-lightning:free";

const searchProductsByText = async (query: string, topK = 5) => {

    const res = await openrouter.embeddings.generate({
        requestBody: { model: EMBEDDING_MODEL, input: query },
    });

    if (typeof res === "string" || !res.data?.[0]) {
        throw new Error("Failed to generate query embedding");
    }

    const embedding = res.data[0].embedding;

    const queryBuffer =
        typeof embedding === "string"
            ? Buffer.from(embedding, "base64")
            : Buffer.from(new Float32Array(embedding).buffer);

    const results = await redis.ft.search(
        PRODUCT_INDEX_NAME,
        "*=>[KNN $K @embedding $BLOB AS score]",
        {
            PARAMS: { K: topK, BLOB: queryBuffer },
            RETURN: ["score", "embeddingText", "data"],
            SORTBY: "score",
            DIALECT: 2,
        }
    );

    return results.documents.map((doc) => ({
        id: doc.id,
        score: Number(doc.value.score),
        ...JSON.parse(doc.value.data as string),
    }));
}

export const askQuestion = async (query: string) => {

    const products = await searchProductsByText(query)

    const context = products.map((p, i) => ({
        n: i + 1,
        name: p.name,
        brand: p.brand,
        price: p.price,
        description: p.description,
        tags: p.tags,
        rating: p.rating_avg,
        stock: p.stock,
    }));

    const completion = await openrouter.chat.send({
        chatRequest: {
            model: CHAT_MODEL,
            messages: [
                {
                    role: "system",
                    content: `You are a helpful shopping assistant.

Answer the user's question using ONLY the products listed below.
- Reference products by name and price.
- If none of the products fit the user's need, say so honestly.
- Keep it concise (2-4 sentences).
- Do not invent products or prices.

Products (most relevant first):
${JSON.stringify(context, null, 2)}`,
                },
                { role: "user", content: query },
            ],
        },
    });

    if (completion instanceof ReadableStream || 'getReader' in completion) {
        throw new Error("Expected a non-streaming response");
    }

    const answer = completion.choices[0]?.message?.content ?? "";


    return { answer, products };
}