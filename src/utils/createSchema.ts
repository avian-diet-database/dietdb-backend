import { HomePageResolver } from "../resolvers/HomePageResolver";
import { PredatorPageResolver } from "../resolvers/PredatorPageResolver";
import { PreyPageResolver } from "../resolvers/PreyPageResolver";
import { buildSchema } from "type-graphql";
import { PendingPageResolver } from "../resolvers/PendingPageResolver";

export const createSchema = () => buildSchema({
    resolvers: [PredatorPageResolver, PreyPageResolver, HomePageResolver, PendingPageResolver],
});