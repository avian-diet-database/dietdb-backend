import { IsIn } from "class-validator";
import { AvianDiet } from "../entities/AvianDiet";
import { CommonNames } from "../entities/CommonNames";
import { Regions } from "../entities/Regions";
import { Arg, Args, ArgsType, Field, ObjectType, Query, Resolver } from "type-graphql";
import { getManager, SelectQueryBuilder } from "typeorm";
import { FilterValues, StudiesAndRecordsCount } from "../utils";

// For prey page, we list predators
@ArgsType()
class GetPredatorOfArgs {
    @Field()
    preyName: string;

    @Field({ defaultValue: "any" })
    @IsIn(["any", "larva", "pupa", "adult"])
    preyStage: string;

    // TODO: Remove this field, no longer used
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
    async getPredatorOf(@Args() {preyName, preyStage, startYear, endYear, season, region}: GetPredatorOfArgs) {
        preyName = await PreyPageResolver.getTaxonGivenCommonName(preyName);
        let qbInitial = getManager()
            .createQueryBuilder()
            .select("common_name, family, diet_type, source, IF(diet_type = \"Occurrence\", MAX(fraction_diet), SUM(fraction_diet)) AS fraction_diet")
            .from(AvianDiet, "avian");
        qbInitial = PreyPageResolver.addArgConditions(qbInitial, preyName, preyStage, season, region, startYear, endYear)
            .groupBy("source, common_name, subspecies, family, observation_year_begin, observation_month_begin, observation_year_end, observation_month_end, observation_season, analysis_number, bird_sample_size, habitat_type, location_region, location_specific, item_sample_size, diet_type, study_type, sites");
        
        const qbFinal = getManager()
            .createQueryBuilder()
            .select("common_name, family, diet_type, AVG(fraction_diet) * 100.0 AS fraction_diet, COUNT(DISTINCT source) AS number_of_studies")
            .from("(" + qbInitial.getQuery() + ")", "initial")
            .groupBy("common_name, family, diet_type")
            .setParameters(qbInitial.getParameters());
        return await qbFinal.getRawMany();
    }

    // Searches through all prey levels
    // Can't use QueryBuilder because there is no union function
    @Query(() => [String])
    async getAutocompletePrey(
        @Arg("input") input: string
    ) {
        // Last query in union list allows users to look up prey via common name. The query ensures the common name has a match in the database.
        const query = `
        SELECT DISTINCT name FROM
            (SELECT DISTINCT prey_kingdom AS name FROM avian_diet WHERE prey_kingdom LIKE "${input}%"
            UNION
            SELECT DISTINCT prey_phylum AS name FROM avian_diet WHERE prey_phylum LIKE "${input}%"
            UNION
            SELECT DISTINCT prey_class AS name FROM avian_diet WHERE prey_class LIKE "${input}%"
            UNION
            SELECT DISTINCT prey_order AS name FROM avian_diet WHERE prey_order LIKE "${input}%"
            UNION
            SELECT DISTINCT prey_suborder AS name FROM avian_diet WHERE prey_suborder LIKE "${input}%"
            UNION
            SELECT DISTINCT prey_family AS name FROM avian_diet WHERE prey_family LIKE "${input}%"
            UNION
            SELECT DISTINCT prey_genus AS name FROM avian_diet WHERE prey_genus LIKE "${input}%"
            UNION
            SELECT DISTINCT prey_scientific_name AS name FROM avian_diet WHERE prey_scientific_name LIKE "${input}%"
            UNION
            SELECT DISTINCT c.common_name AS name FROM avian_diet a, common_names c
            WHERE c.taxon IN(a.prey_kingdom, a.prey_phylum, a.prey_class, a.prey_order, a.prey_suborder, a.prey_family, a.prey_genus, a.prey_scientific_name) AND c.common_name LIKE "${input}%"
            ) combinedResult
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
        name = await PreyPageResolver.getTaxonGivenCommonName(name);
        const preyFilter = `
            (prey_kingdom = :preyName OR
            prey_phylum = :preyName OR
            prey_class = :preyName OR
            prey_order = :preyName OR
            prey_suborder = :preyName OR
            prey_family = :preyName OR
            prey_genus = :preyName OR
            prey_scientific_name = :preyName)
        `;
        const qbRegion = getManager()
            .createQueryBuilder()
            .select("DISTINCT location_region AS region")
            .from(AvianDiet, "avian")
            .where(preyFilter, { preyName: name });
        const qbAcceptableRegions = getManager()
            .createQueryBuilder()
            .select("region_name AS region")
            .from(Regions, "regions");
        const qbStartYear = getManager()
            .createQueryBuilder()
            .select("DISTINCT IFNULL(observation_year_begin, observation_year_end) AS startYear")
            .from(AvianDiet, "avian")
            .where(preyFilter, { preyName: name })
            .andWhere("observation_year_end IS NOT NULL")
            .orderBy("startYear", "ASC");
        const qbEndYear = getManager()
            .createQueryBuilder()
            .select("DISTINCT observation_year_end AS endYear")
            .from(AvianDiet, "avian")
            .where(preyFilter, { preyName: name })
            .andWhere("observation_year_end IS NOT NULL")
            .orderBy("endYear", "DESC");

        const regionRawResult = await qbRegion.getRawMany();
        const acceptableRegionsRawResult = await qbAcceptableRegions.getRawMany(); 
        const startYearRawResult = await qbStartYear.getRawMany();
        const endYearRawResult = await qbEndYear.getRawMany(); 
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
        name = await PreyPageResolver.getTaxonGivenCommonName(name);
        const qb = getManager()
            .createQueryBuilder()
            .select("COUNT(*) as numRecords, COUNT(DISTINCT source) AS numStudies")
            .from(AvianDiet, "avian")
            .where(`
                prey_kingdom = :preyName OR
                prey_phylum = :preyName OR
                prey_class = :preyName OR
                prey_order = :preyName OR
                prey_suborder = :preyName OR
                prey_family = :preyName OR
                prey_genus = :preyName OR
                prey_scientific_name = :preyName
            `, { preyName: name });

        const rawResult = await qb.getRawMany();
        return {
            studies: rawResult[0]["numStudies"],
            records: rawResult[0]["numRecords"]
        };
    }

    // Assumes sources will never be empty/null in database
    @Query(() => [String])
    async getPredatorOfSources(@Args() {preyName, preyStage, startYear, endYear, season, region}: GetPredatorOfArgs) {            
        preyName = await PreyPageResolver.getTaxonGivenCommonName(preyName);
        let qb = getManager()
            .createQueryBuilder()
            .select("DISTINCT source")
            .from(AvianDiet, "avian");
        qb = PreyPageResolver.addArgConditions(qb, preyName, preyStage, season, region, startYear, endYear);

        const rawResult = await qb.getRawMany();
        let sourceList = [];
        for (let source of rawResult) {
            sourceList.push(source["source"]);
        }
        return sourceList;
    }

    // Assumes AvianDiet alias is avian
    static addArgConditions(qb: SelectQueryBuilder<any>, preyName: string, preyStage: string, season: string, region: string, startYear?: string, endYear?: string) {
        qb = qb.where("(prey_kingdom = :name OR prey_phylum = :name OR prey_class = :name OR prey_order = :name OR prey_suborder = :name OR prey_family = :name OR prey_genus = :name OR prey_scientific_name = :name)", { name: preyName });

        if (preyStage !== "any") {
            if (preyStage === "adult") {
                qb = qb.andWhere("(avian.prey_stage = :stage OR avian.prey_stage IS NULL)", { stage: preyStage })
            } else {
                qb = qb.andWhere("avian.prey_stage = :stage", { stage: preyStage })
            }
        }
        if (startYear !== undefined) {
            qb = qb.andWhere("avian.observation_year_begin >= :startYear", { startYear: startYear });
        }
        if (endYear !== undefined) {
            qb = qb.andWhere("avian.observation_year_end <= :endYear", { endYear: endYear });
        }
        if (season !== "all") {
            qb = qb.andWhere("avian.observation_season LIKE :season", { season: "%" + season + "%" });
        }
        if (region !== "all") {
            qb = qb.andWhere("avian.location_region LIKE :region", { region: "%" + region + "%" });
        }
        return qb;
    }

    static async getTaxonGivenCommonName(name: string) {
        // Checks to see if the preyName given is a common name
        const matchCommonToTaxon = await getManager()
            .createQueryBuilder()
            .select("taxon")
            .from(CommonNames, "common_names")
            .where("common_name = :input", { input: name })
            .getRawOne();
        // If a mapping exists, return mapped taxon
        if (matchCommonToTaxon !== undefined) {
            return matchCommonToTaxon["taxon"];
        }
        return name;
    }
}
