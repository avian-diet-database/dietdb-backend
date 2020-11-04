import { createConnection } from "typeorm";

// Ensure that such a test database exists before testing
export const testConn = (drop: boolean = false) => {
    return createConnection({
        type: "mysql",
        host: "localhost",
        port: 3306,
        username: "dietdatabase",
        password: "password",
        database: "local_dietdatabase",
        synchronize: drop,
        dropSchema: drop,
        entities: [__dirname + "/../../entities/*.js"],
        migrations: [__dirname + "/../../migrations/*.js"]
    })
}