import { PredatorPageResolver } from "../resolvers/PredatorPageResolver";
import { PreyPageResolver } from "../resolvers/PreyPageResolver";
import { buildSchema } from "type-graphql";

export const createSchema = () => buildSchema({
    resolvers: [PredatorPageResolver, PreyPageResolver],
});