import { IsIn } from "class-validator";
import { Arg, Args, ArgsType, Field, ObjectType, Query, Resolver } from "type-graphql";
import { getManager } from "typeorm";
import { FilterValues, StudiesAndRecordsCount } from "../utils";

// For prey page, we list predators
@ArgsType()
class GetPredatorOfArgs {
    @Field()
    preyName: string;

    @Field({ defaultValue: "any" })
    @IsIn(["any", "larva", "pupa", "adult"])
    preyStage: string;

    @Field({ defaultValue: "all"})
    @IsIn(["wt_or_vol", "items", "occurrence", "unspecified", "all"])
    dietType: string;

    @Field({ nullable: true })
    startYear?: string;

    @Field({ nullable: true })
    endYear?: string;

    @Field({ defaultValue: "all"})
    @IsIn(["spring", "summer", "fall", "winter", "multiple", "unspecified", "all"])
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
    async getPredatorOf(@Args() {preyName, preyStage, dietType, startYear, endYear, season, region}: GetPredatorOfArgs) {
        const argConditions = `
        (prey_kingdom = "${preyName}" OR prey_phylum = "${preyName}" OR prey_class = "${preyName}" OR prey_order = "${preyName}" OR prey_suborder = "${preyName}" OR prey_family = "${preyName}" OR prey_genus = "${preyName}" OR prey_scientific_name = "${preyName}")
        ${preyStage !== "any" ? (preyStage === "adult" ? " AND (prey_stage = \"" + preyStage + "\" OR prey_stage IS NULL)" : " AND prey_stage = \"" + preyStage + "\"") : ""}
        ${startYear !== undefined ? " AND observation_year_begin >= " + startYear : ""}
        ${endYear !== undefined ? " AND observation_year_end <= " + endYear : ""}
        ${season !== "all" ? " AND observation_season LIKE \"%" + season + "%\"" : ""}
        ${region !== "all" ? " AND location_region LIKE \"%" + region + "%\"" : ""}
        `;

        const query = `
        SELECT
                common_name, family, diet_type, AVG(fraction_diet) * 100.0 AS fraction_diet, COUNT(DISTINCT source) AS number_of_studies
        FROM
            (SELECT
                common_name, family, diet_type, source,
                IF(diet_type = "Occurrence", MAX(fraction_diet), SUM(fraction_diet)) AS fraction_diet
            FROM
                avian_diet
            WHERE ${argConditions}
            GROUP BY source, common_name, subspecies, family, observation_year_begin, observation_month_begin, observation_year_end, observation_month_end, observation_season, analysis_number, bird_sample_size, habitat_type, location_region, location_specific, item_sample_size, diet_type, study_type, sites
        ) final1
        GROUP BY common_name, family, diet_type
        ${dietType !== "all" ? "HAVING diet_type = \"" + dietType + "\"" : ""}
        `;

        return await getManager().query(query);
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
        WHERE name != "Unknown"
        ORDER BY LENGTH(name) - LENGTH("${input}") ASC LIMIT 10
        `;

        const rawResult = await getManager().query(query);
        let resultList = [];
        for (let item of rawResult) {
            resultList.push(item["name"]);
        }
        return resultList;
    }

    // Right now, this function will create a new set every time it is called to check that regions grabbed from the avian_diet table is in the acceptable region list in the region table
    // This is extremely inefficient
    // Assumes that regions from avian_diet has the same capitilization as regions in region table
    @Query(() => FilterValues)
    async getFilterValuesPrey(
        @Arg("name") name: string
    ) {
        const preyFilter = `
            prey_kingdom = "${name}" OR
            prey_phylum = "${name}" OR
            prey_class = "${name}" OR
            prey_order = "${name}" OR
            prey_suborder = "${name}" OR
            prey_family = "${name}" OR
            prey_genus = "${name}" OR
            prey_scientific_name = "${name}"
        `;
        const regionQuery = `
        SELECT DISTINCT location_region as region FROM avian_diet WHERE ${preyFilter}
        `;
        const acceptableRegionsQuery = `
        SELECT region_name AS region FROM regions
        `;
        const startYearQuery = `
        SELECT DISTINCT IFNULL(observation_year_begin, observation_year_end) AS startYear FROM avian_diet WHERE ${preyFilter} ORDER BY startYear ASC
        `;
        const endYearQuery = `
        SELECT DISTINCT observation_year_end AS endYear FROM avian_diet WHERE ${preyFilter} ORDER BY endYear DESC
        `;

        const regionRawResult = await getManager().query(regionQuery);
        const acceptableRegionsRawResult = await getManager().query(acceptableRegionsQuery);
        const startYearRawResult = await getManager().query(startYearQuery);
        const endYearRawResult = await getManager().query(endYearQuery);
        let acceptableRegions = new Set();
        let startYearsList = [];
        let endYearsList = [];
        let regionList = new Set();
        for (let item of acceptableRegionsRawResult) {
            acceptableRegions.add(item["region"]);
        }
        for (let item of regionRawResult) {
            let regions = item["region"].split(';');
            for (let region of regions) {
                if (acceptableRegions.has(region)) {
                    regionList.add(region);
                }
            }
        }
        for (let item of startYearRawResult) {
            startYearsList.push(item["startYear"]);
        }
        for (let item of endYearRawResult) {
            endYearsList.push(item["endYear"]);
        }
        return { regions: regionList, startYears: startYearsList, endYears: endYearsList };
    }

    @Query(() => StudiesAndRecordsCount)
    async getNumRecordsAndStudiesPrey(
        @Arg("name") name: string
    ) {
        const studiesQuery = `
        SELECT COUNT(*) as numRecords, COUNT(DISTINCT source) AS numStudies FROM avian_diet WHERE
            prey_kingdom = "${name}" OR
            prey_phylum = "${name}" OR
            prey_class = "${name}" OR
            prey_order = "${name}" OR
            prey_suborder = "${name}" OR
            prey_family = "${name}" OR
            prey_genus = "${name}" OR
            prey_scientific_name = "${name}"
        `;
        const rawResult = await getManager().query(studiesQuery);
        return {
            studies: rawResult[0]["numStudies"],
            records: rawResult[0]["numRecords"]
        };
    }
}
