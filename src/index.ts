import 'reflect-metadata';
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { createConnection } from "typeorm";
import { createSchema } from './utils/createSchema';

const main = async () => {
    const app = express();

    const conn = await createConnection();
    conn.runMigrations();

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