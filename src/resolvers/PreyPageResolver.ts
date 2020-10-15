import { Arg, Args, ArgsType, Field, ObjectType, Query, Resolver } from "type-graphql";
import { getManager } from "typeorm";

// For prey page, we list predators
@ArgsType()
class GetPredatorOfArgs {
    @Field()
    preyName: string;

    @Field({ defaultValue: "order"})
    preyLevel: string;

    @Field({ nullable: true })
    preyStage: string;

    @Field({ defaultValue: "all"})
    dietType: string;

    @Field({ nullable: true })
    startYear?: string;

    @Field({ nullable: true })
    endYear?: string;

    @Field({ defaultValue: "all"})
    season: string;

    @Field({ defaultValue: "all"})
    region: string;
}

@ObjectType()
export class Predator {
    @Field()
    common_name: string;

    @Field()
    family: string;

    @Field()
    diet_type: string;

    @Field()
    fraction_diet: string;

    @Field()
    number_of_studies: string;
}

@Resolver()
export class PreyPageResolver {
    @Query(() => [Predator])
    async getPredatorOf(@Args() {preyName, preyLevel, dietType, startYear, endYear, season, region}: GetPredatorOfArgs) {
        let list =  [{ common_name: "Bobolink", family: "Icteridae", diet_type: "Items", fraction_diet: "71.5", number_of_studies: "1" },
    { common_name: "Grasshopper Sparrow", family: "Passerellidae", diet_type: "Items", fraction_diet: "70.7", number_of_studies: "1" },
    { common_name: "Philadelphia Vireo", family: "Vireonidae", diet_type: "Items", fraction_diet: "68.7", number_of_studies: "2" },
    { common_name: "Indigo Bunting", family: "Cardinalidae", diet_type: "Items", fraction_diet: "68", number_of_studies: "1" },
    { common_name: "Oak Titmouse", family: "Paridae", diet_type: "Items", fraction_diet: "66.3", number_of_studies: "4" },
    { common_name: "Yellow-billed Cuckoo", family: "Cuculidae", diet_type: "Items", fraction_diet: "63", number_of_studies: "2" },
    { common_name: "Golden-crowned Kinglet", family: "Regulidae", diet_type: "Items", fraction_diet: "59.8", number_of_studies: "1" },
    { common_name: "California Scrub-Jay", family: "Corvidae", diet_type: "Occurrence", fraction_diet: "86", number_of_studies: "3" },
    { common_name: "Yello-billed cuckoo", family: "Cuculidae", diet_type: "Occurrence", fraction_diet: "83.5", number_of_studies: "2" },
    { common_name: "Yellow-billed Magpie", family: "Corvidae", diet_type: "Occurrence", fraction_diet: "79.7", number_of_studies: "3" },
    { common_name: "Baltimore Oriole", family: "Icteridae", diet_type: "Occurrence", fraction_diet: "78.1", number_of_studies: "4" },
    { common_name: "Cedar Waxwing", family: "Bombycillidae", diet_type: "Wt_or_Vol", fraction_diet: "86.5", number_of_studies: "8" },
    { common_name: "Tennessee Warbler", family: "Parulidae", diet_type: "Wt_or_Vol", fraction_diet: "83", number_of_studies: "1" },
    { common_name: "Elegant Trogon", family: "Trogonidae", diet_type: "Wt_or_Vol", fraction_diet: "82.5", number_of_studies: "1" },
    { common_name: "Evening Grosbeak", family: "Fringillidae", diet_type: "Wt_or_Vol", fraction_diet: "80", number_of_studies: "1" },
    { common_name: "Chipping Sparrow", family: "Passerellidae", diet_type: "Wt_or_Vol", fraction_diet: "69", number_of_studies: "1" }
    ]
        let test: Predator = { common_name: "Mock Data", family: "Mock Data", diet_type: "Mock Data", fraction_diet: "Mock Diet", number_of_studies: "Mock Data"}
        if (preyName || preyLevel || dietType || startYear || endYear || season || region) {
            list.push(test);
        }
        return list;
    }

    // Searches through all prey levels
    @Query(() => [String])
    async getAutocompletePrey(
        @Arg("input") input: string
    ) {
        const query = `
        SELECT DISTINCT name FROM
            (SELECT DISTINCT prey_kingdom AS name FROM avian_diet WHERE prey_kingdom LIKE "%${input}%"
            UNION
            SELECT DISTINCT prey_phylum AS name FROM avian_diet WHERE prey_phylum LIKE "%${input}%"
            UNION
            SELECT DISTINCT prey_class AS name FROM avian_diet WHERE prey_class LIKE "%${input}%"
            UNION
            SELECT DISTINCT prey_order AS name FROM avian_diet WHERE prey_order LIKE "%${input}%"
            UNION
            SELECT DISTINCT prey_suborder AS name FROM avian_diet WHERE prey_suborder LIKE "%${input}%"
            UNION
            SELECT DISTINCT prey_family AS name FROM avian_diet WHERE prey_family LIKE "%${input}%"
            UNION
            SELECT DISTINCT prey_genus AS name FROM avian_diet WHERE prey_genus LIKE "%${input}%"
            UNION
            SELECT DISTINCT prey_scientific_name AS name FROM avian_diet WHERE prey_scientific_name LIKE "%${input}%") combinedResult
        ORDER BY LENGTH(name) - LENGTH("${input}") ASC LIMIT 10
        `

        const rawResult = await getManager().query(query);
        let resultList = [];
        for (let item of rawResult) {
            resultList.push(item["name"]);
        }
        return resultList;
    }
}
