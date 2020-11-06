import { Field, ObjectType, Query, Resolver } from "type-graphql";
import { getManager } from "typeorm";

@ObjectType()
export class DatabaseResultStats {
    @Field()
    numSpecies: string;

    @Field()
    numStudies: string;

    @Field()
    numRecords: string;
}

@Resolver()
export class HomePageResolver {
    @Query(() => DatabaseResultStats)
    async getDatabaseStats() {
        const speciesCount = await getManager().query("SELECT COUNT(DISTINCT common_name) as count FROM avian_diet");
        const studiesCount = await getManager().query("SELECT COUNT(DISTINCT source) as count FROM avian_diet");
        const recordsCount = await getManager().query("SELECT COUNT(*) as count FROM avian_diet");
        return { numSpecies: speciesCount[0]["count"], numStudies: studiesCount[0]["count"], numRecords: recordsCount[0]["count"] };
    }
}