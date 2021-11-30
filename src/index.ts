import 'reflect-metadata';
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";
import { createSchema } from './utils/createSchema';

const main = async () => {
    const app = express();

    await createConnection();

    const apolloServer = new ApolloServer({
        schema: await createSchema(),
        context: ({ req, res }) => ({ req, res })
    });

    apolloServer.applyMiddleware({ app });

    app.listen(4000, () => {
        console.log('Server running on port 4000');
    });
};

main();