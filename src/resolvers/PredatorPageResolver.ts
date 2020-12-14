import { IsIn } from "class-validator";
import { AvianDiet } from "../entities/AvianDiet";
import { Arg, Args, ArgsType, Field, ObjectType, Query, Resolver } from "type-graphql";
import { getManager } from "typeorm";
import { Utils, StudiesAndRecordsCount, FilterValues } from "../utils"

@ArgsType()
class GetPreyOfArgs {
    @Field()
    predatorName: string;

    @Field({ defaultValue: "order"})
    @IsIn(["kingdom", "phylum", "class", "order", "suborder", "family", "genus", "scientific_name"])
    preyLevel: string;

    //TODO: Remove this field, no longer used
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
export class graphXY {
    @Field()
    x: string;

    @Field()
    y: number;
}

@ObjectType()
export class regionCountTuple {
    @Field({ nullable: true })
    region: string;

    @Field({ nullable: true })
    count: number;
}

@ObjectType()
export class Prey {
    @Field()
    taxon: string;

    @Field({ nullable: true })
    items?: string;

    @Field({ nullable: true })
    wt_or_vol?: string;

    @Field({ nullable: true })
    occurrence?: string;

    @Field({ nullable: true })
    unspecified?: string;
}

@Resolver()
export class PredatorPageResolver {
    // Only have to worry about securing values against SQL injection for those not checked by GetPreyOfArgs
    // That is: predatorName, startYear, endYear, region
    @Query(() => [Prey])
    async getPreyOf(@Args() {predatorName, preyLevel, startYear, endYear, season, region}: GetPreyOfArgs) {
        // Selecting columns that identifies a specific prey of a specific study and creating new columns for each of the four diet types
        let qbInitialSplit = getManager()
            .createQueryBuilder()
            .select(`source, observation_year_begin, observation_month_begin, observation_season, bird_sample_size, habitat_type, location_region, item_sample_size, diet_type, prey_stage, analysis_number,
                ${Utils.getUnidTaxon("prey_" + preyLevel)} AS taxonUnid,
			    IF(diet_type = "Items", fraction_diet, NULL) as Items,
			    IF(diet_type = "Wt_or_Vol", fraction_diet, NULL) as Wt_or_Vol,
			    IF(diet_type = "Occurrence", fraction_diet, NULL) as Occurrence,
                IF(diet_type = "Unspecified", fraction_diet, NULL) as Unspecified
            `)
            .from(AvianDiet, "avian");
        qbInitialSplit = Utils.addArgConditions(qbInitialSplit, predatorName, season, region, startYear, endYear);

        // For each of those specific prey of a specific study, group them and sum together the diet, separating by type
        // If preyLevel is lower than prey class, we append the prey_stage to the prey name
        const qbInitialSum = getManager()
            .createQueryBuilder()
            .select(`diet_type,
                ${preyLevel !== "kingdom" && preyLevel !== "phylum" && preyLevel !== "class" ? "IF(prey_stage IS NOT NULL AND prey_stage != \"adult\", CONCAT(taxonUnid, ' ', prey_stage), taxonUnid)" : "taxonUnid"} AS taxon,
                SUM(Items) as Items,
                SUM(Wt_or_Vol) as Wt_or_Vol,
                MAX(Occurrence) as Occurrence,
                SUM(Unspecified) as Unspecified
            `)
            .from("(" + qbInitialSplit.getQuery() + ")", "initialSplit")
            .groupBy("source, observation_year_begin, observation_month_begin, observation_season, bird_sample_size, habitat_type, location_region, item_sample_size, taxon, diet_type, analysis_number");

        // Group together the columns that identify unique prey studies and count number of records that each has per diet type
        const totalPerDietType = getManager()
            .createQueryBuilder()
            .select("diet_type, COUNT(*) as n")
            .from(subQuery => {
                return Utils.addArgConditions(subQuery
                .select("DISTINCT source, observation_year_begin, observation_month_begin, observation_season, bird_sample_size, habitat_type, location_region, location_specific, item_sample_size, diet_type, study_type, analysis_number")
                .from(AvianDiet, "avian"), predatorName, season, region, startYear, endYear);
            }, "distinctCombo")
            .groupBy("diet_type");
        
        // Divide initial obtained from query qbInitialSum by number of records per diet type we obtained in totalPerDietType and multiply by 100 to get a percentage
        const qbInitialPercentage = getManager()
            .createQueryBuilder()
            .select("taxon, initialSum.diet_type, SUM(Items) * 100.0 / n as Items, SUM(Wt_or_Vol) * 100.0 / n as Wt_or_Vol, SUM(Occurrence) * 100.0 / n as Occurrence, SUM(Unspecified) * 100.0 / n as Unspecified")
            .from("(" + qbInitialSum.getQuery() + ")", "initialSum")
            .from("(" + totalPerDietType.getQuery() + ")", "totalPerDietType")
            .where("totalPerDietType.diet_type = initialSum.diet_type")
            .groupBy("taxon, diet_type")
            .setParameters(qbInitialSum.getParameters())
            .setParameters(totalPerDietType.getParameters());
        
        // There are multiple records for a single prey since each record corresponds to one of the four diet types. This will group those records together so we end up having one record with four filled out columns for each diet type
        const finalCombine = await getManager()
            .createQueryBuilder()
            .select("taxon, SUM(Items) as items, SUM(Wt_or_Vol) as wt_or_vol, SUM(Occurrence) as occurrence, SUM(Unspecified) as unspecified")
            .from("(" + qbInitialPercentage.getQuery() + ")", "initialPercentage")
            .groupBy("taxon")
            .setParameters(qbInitialPercentage.getParameters())
            .getRawMany();
        
        return finalCombine;
    }

    // Assumes sources will never be empty/null in database
    // Prey Level doesn't matter since we will always include a record regardless of level, we prepend 'Unid.' with the next lowest level, see getPreyOf query for more detail
    @Query(() => [String])
    async getPreyOfSources(@Args() {predatorName, startYear, endYear, season, region}: GetPreyOfArgs) {            
        let qb = getManager()
            .createQueryBuilder()
            .select("DISTINCT source")
            .from(AvianDiet, "avian");
        qb = Utils.addArgConditions(qb, predatorName, season, region, startYear, endYear);

        const rawResult = await qb.getRawMany();

        let sourceList = [];
        for (let source of rawResult) {
            sourceList.push(source["source"]);
        }

        return sourceList;
    }

    // Searches through common_name and scientific_name
    // Can't use QueryBuilder because there is no union function
    @Query(() => [String])
    async getAutocompletePred(@Arg("input") input: string) {
        const query = `
        SELECT DISTINCT name FROM
	        (SELECT DISTINCT common_name AS name FROM avian_diet WHERE common_name LIKE ?
	        UNION
	        SELECT DISTINCT scientific_name AS name FROM avian_diet WHERE scientific_name LIKE ?) result
        ORDER BY LENGTH(name) - LENGTH(?) ASC
        LIMIT 10
        `;

        const rawResult = await getManager().query(query, ["%" + input + "%", "%" + input + "%", input]);
        let resultList = [];
        for (let item of rawResult) {
            resultList.push(item["name"]);
        }
        return resultList;
    }

    @Query(() => StudiesAndRecordsCount)
    async getNumRecordsAndStudiesPred(@Arg("name") name: string) {
        const numRecordsAndStudies = await getManager()
            .createQueryBuilder()
            .select("COUNT(DISTINCT source) as studiesCount, COUNT(*) as recordsCount")
            .from(AvianDiet, "avian")
            .where("common_name = :predName OR scientific_name = :predName", { predName: name })
            .getRawMany();

        return {
            studies: numRecordsAndStudies[0]["studiesCount"],
            records: numRecordsAndStudies[0]["recordsCount"]
        };
    }

    @Query(() => [graphXY])
    async getRecordsPerSeason(@Args() {predatorName, startYear, endYear, season, region}: GetPreyOfArgs) {
        let qb = getManager()
            .createQueryBuilder()
            .select("IFNULL(observation_season, \"unspecified\") AS season, COUNT(*) as count")
            .from(AvianDiet, "avian");
        qb = Utils.addArgConditions(qb, predatorName, season, region, startYear, endYear)
            .groupBy("observation_season");

        const rawResult = await qb.getRawMany();

        let summer: graphXY =  { x: "Summer", y: 0 };
        let spring: graphXY =  { x: "Spring", y: 0 };
        let fall: graphXY =  { x: "Fall", y: 0 };
        let winter: graphXY =  { x: "Winter", y: 0 };
        let multipleUnspecified: graphXY =  { x: "Unspecified", y: 0 };

        for (let item of rawResult) {
            if (String(item["season"]).includes('spring')) {
                spring.y += +item["count"];
            }
            if (String(item["season"]).includes('summer')) {
                summer.y += +item["count"];
            }
            if (String(item["season"]).includes('fall')) {
                fall.y += +item["count"];
            }
            if (String(item["season"]).includes('winter')) {
                winter.y += +item["count"];
            }
            if (String(item["season"]).includes('multiple') || String(item["season"]).includes('unspecified') ) {
                multipleUnspecified.y += +item["count"];
            }
        }
        return [spring, summer, fall, winter, multipleUnspecified];
    }

    // Only includes decades with actual data points
    @Query(() => [graphXY])
    async getRecordsPerDecade(@Args() {predatorName, startYear, endYear, season, region}: GetPreyOfArgs) {            
        let qbYears = getManager()
            .createQueryBuilder()
            .select("observation_year_end as year, COUNT(*) as count")
            .from(AvianDiet, "avian");
        qbYears = Utils.addArgConditions(qbYears, predatorName, season, region, startYear, endYear)
            .andWhere("observation_year_end IS NOT NULL")
            .groupBy("observation_year_end")
            .orderBy("observation_year_end");
        const rawResult = await qbYears.getRawMany();

        const minMaxDecades = await getManager()
            .createQueryBuilder()
            .select("MIN(observation_year_end) as min, MAX(observation_year_end) as max")
            .from(AvianDiet, "avian")
            .where("(common_name = :name OR scientific_name = :name)", { name: predatorName })
            .andWhere("observation_year_end IS NOT NULL")
            .getRawMany();

        const minDecade = Math.floor(+minMaxDecades[0]["min"] / 10) * 10;
        const maxDecade = Math.floor(+minMaxDecades[0]["max"] / 10) * 10;

        let decades = new Map();

        for (let i = 0; i <= maxDecade - minDecade; i += 10) {
            const currDecade = minDecade + i;
            decades.set(currDecade, { x: currDecade.toString(), y: 0 });
        }

        for (let item of rawResult) {
            let decadeNum = Math.floor(+item["year"] / 10) * 10;
            let decadeXY: graphXY = decades.get(decadeNum);
            if (decadeXY === undefined) {
                // The previous loop is supposed to gaurantee all relevant decades are in decades map
                // TODO: More detail in error message
                throw new Error(`${decadeNum} not found in decade map`);
            }
            decadeXY.y += +item["count"];
        }
        return decades.values();
    }

    @Query(() => [graphXY])
    async getRecordsPerDietType(@Args() {predatorName, startYear, endYear, season, region}: GetPreyOfArgs) {
        let qb = getManager()
            .createQueryBuilder()
            .select("diet_type as diet, COUNT(*) as count")
            .from(AvianDiet, "avian");
        qb = Utils.addArgConditions(qb, predatorName, season, region, startYear, endYear)
            .groupBy("diet_type");
        const rawResult = await qb.getRawMany();

        let itemCount = 0;
        let wtVolCount = 0;
        let occurrenceCount = 0;
        let unspecifiedCount = 0;

        for (let item of rawResult) {
            switch(item["diet"]) {
                case "Items": {
                    itemCount += +item["count"];
                    break;
                }
                case "Wt_or_Vol": {
                    wtVolCount += +item["count"];
                    break;
                }
                case "Occurrence": {
                    occurrenceCount += +item["count"];
                    break;
                }
                case "Unspecified": {
                    unspecifiedCount += +item["count"];
                    break;
                }
            }
        }
        return [{ x: "Items", y: itemCount }, { x: "Weight/vol", y: wtVolCount }, { x: "Occurrence", y: occurrenceCount }, { x: "Unspecified", y: unspecifiedCount }];
    }

    // Right now, this function will create a new set every time it is called to check that regions grabbed from the avian_diet table is in the acceptable region list in the region table
    // This is extremely inefficient
    // Assumes that regions from avian_diet has the same capitilization as regions in region table
    @Query(() => FilterValues)
    async getFilterValuesPred(@Arg("name") name: string) {
        const regionQuery = `
        SELECT DISTINCT location_region AS region FROM avian_diet WHERE common_name = "${name}" OR scientific_name = "${name}"
        `;
        const acceptableRegionsQuery = `
        SELECT region_name AS region FROM regions
        `;
        const startYearQuery = `
        SELECT DISTINCT IFNULL(observation_year_begin, observation_year_end) AS startYear FROM avian_diet WHERE (common_name = "${name}" OR scientific_name = "${name}") AND observation_year_end IS NOT NULL ORDER BY startYear ASC
        `;
        const endYearQuery = `
        SELECT DISTINCT observation_year_end AS endYear FROM avian_diet WHERE (common_name = "${name}" OR scientific_name = "${name}") AND observation_year_end IS NOT NULL ORDER BY endYear DESC
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

    
    @Query(() => [regionCountTuple])
    async getMapData(@Args() {predatorName, startYear, endYear, season, region}: GetPreyOfArgs) {
        const argConditions = `
        (common_name = "${predatorName}" OR scientific_name = "${predatorName}")
        ${startYear !== undefined ? " AND observation_year_begin >= " + startYear : ""}
        ${endYear !== undefined ? " AND observation_year_end <= " + endYear : ""}
        ${season !== "all" ? " AND observation_season LIKE \"%" + season + "%\"" : ""}
        ${region !== "all" ? " AND location_region LIKE \"%" + region + "%\"" : ""}
        `;

        const query = `SELECT location_region as region, COUNT(location_region) as count FROM avian_diet WHERE ${argConditions} GROUP BY location_region`;

        const rawResult = await getManager().query(query);
        let regionCount = new Map();
        for (let item of rawResult) {
            let regions = item["region"].split(';');
            for (let region of regions) {
                let count: regionCountTuple = regionCount.get(region);
                if (count === undefined) {
                    count = { region: region, count: 0 };
                    regionCount.set(region, count);
                }
                count.count += +item["count"];
            }
        }
        return regionCount.values();
    }
}
