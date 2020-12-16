import { IsIn } from "class-validator";
import { AvianDiet } from "../entities/AvianDiet";
import { CommonNames } from "../entities/CommonNames";
import { Regions } from "../entities/Regions";
import { Arg, Args, ArgsType, Field, ObjectType, Query, Resolver } from "type-graphql";
import { getManager, SelectQueryBuilder } from "typeorm";
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
            .select(`source, observation_year_begin, observation_month_begin, observation_season, bird_sample_size, habitat_type, location_region, item_sample_size, diet_type, prey_stage, analysis_number, prey_kingdom,
                ${Utils.getUnidTaxon("prey_" + preyLevel)} AS taxonUnid,
			    IF(diet_type = "Items", fraction_diet, NULL) AS Items,
			    IF(diet_type = "Wt_or_Vol", fraction_diet, NULL) AS Wt_or_Vol,
			    IF(diet_type = "Occurrence", fraction_diet, NULL) AS Occurrence,
                IF(diet_type = "Unspecified", fraction_diet, NULL) AS Unspecified
            `)
            .from(AvianDiet, "avian");
        qbInitialSplit = PredatorPageResolver.addArgConditions(qbInitialSplit, predatorName, season, region, startYear, endYear);

        // For each of those specific prey of a specific study, group them and sum together the diet, separating by type
        // If preyLevel is lower than prey class, we append the prey_stage to the prey name
        // We additionally group by prey_kingdom, prey_stage for matching with common_name later on. This aggregation is required for sql_mode=full_group_by
        // Grouping by prey_stage is essentially being done when we group taxon
        const qbInitialSum = getManager()
            .createQueryBuilder()
            .select(`diet_type, prey_kingdom, taxonUnid,
                prey_stage AS original_stage,
                ${preyLevel !== "kingdom" && preyLevel !== "phylum" && preyLevel !== "class" ? "IF(prey_stage IS NOT NULL AND prey_stage != \"adult\", CONCAT(taxonUnid, ' ', prey_stage), taxonUnid)" : "taxonUnid"} AS taxon,
                SUM(Items) AS Items,
                SUM(Wt_or_Vol) AS Wt_or_Vol,
                MAX(Occurrence) AS Occurrence,
                SUM(Unspecified) AS Unspecified
            `)
            .from("(" + qbInitialSplit.getQuery() + ")", "initialSplit")
            .groupBy("source, observation_year_begin, observation_month_begin, observation_season, bird_sample_size, habitat_type, location_region, item_sample_size, taxon, diet_type, analysis_number, prey_kingdom, prey_stage");

        // Group together the columns that identify unique prey studies and count number of records that each has per diet type
        const totalPerDietType = getManager()
            .createQueryBuilder()
            .select("diet_type, COUNT(*) AS n")
            .from(subQuery => {
                return PredatorPageResolver.addArgConditions(subQuery
                .select("DISTINCT source, observation_year_begin, observation_month_begin, observation_season, bird_sample_size, habitat_type, location_region, location_specific, item_sample_size, diet_type, study_type, analysis_number")
                .from(AvianDiet, "avian"), predatorName, season, region, startYear, endYear);
            }, "distinctCombo")
            .groupBy("diet_type");
        
        // Divide initial obtained from query qbInitialSum by number of records per diet type we obtained in totalPerDietType and multiply by 100 to get a percentage
        const qbInitialPercentage = getManager()
            .createQueryBuilder()
            .select("taxon, prey_kingdom, taxonUnid, original_stage, initialSum.diet_type, SUM(Items) * 100.0 / n AS Items, SUM(Wt_or_Vol) * 100.0 / n AS Wt_or_Vol, SUM(Occurrence) * 100.0 / n AS Occurrence, SUM(Unspecified) * 100.0 / n AS Unspecified")
            .from("(" + qbInitialSum.getQuery() + ")", "initialSum")
            .from("(" + totalPerDietType.getQuery() + ")", "totalPerDietType")
            .where("totalPerDietType.diet_type = initialSum.diet_type")
            .groupBy("taxon, diet_type")
            .setParameters(qbInitialSum.getParameters())
            .setParameters(totalPerDietType.getParameters());
        
        // There are multiple records for a single prey since each record corresponds to one of the four diet types. This will group those records together so we end up having one record with four filled out columns for each diet type
        const finalCombine = await getManager()
            .createQueryBuilder()
            .select("taxon, prey_kingdom, taxonUnid, original_stage, SUM(Items) AS items, SUM(Wt_or_Vol) AS wt_or_vol, SUM(Occurrence) AS occurrence, SUM(Unspecified) AS unspecified")
            .from("(" + qbInitialPercentage.getQuery() + ")", "initialPercentage")
            .groupBy("taxon")
            .setParameters(qbInitialPercentage.getParameters())
            .getRawMany();

        // Appending common name if exists
        const qbMatchCommonName = getManager()
            .createQueryBuilder()
            .select("common_name")
            .from(CommonNames, "names");
        for (let record of finalCombine) {
            // Skip any unidentified prey
            if (record["taxonUnid"].substring(0, Utils.unidentifiedPrefix.length) !== Utils.unidentifiedPrefix) {
                // First we check if the records prey_stage has an exact match
                let result = await qbMatchCommonName
                    .where("taxon = :name AND taxonomic_rank = :rank AND prey_kingdom = :kingdom AND prey_stage = :stage",
                    { name: record['taxonUnid'], rank: preyLevel, kingdom: record['prey_kingdom'], stage: record['original_stage'] }).getRawOne();
                // Otherwise we check for a match when prey_stage doesn't matter
                if (result === undefined) {
                    result = await qbMatchCommonName
                        .where("taxon = :name AND taxonomic_rank = :rank AND prey_kingdom = :kingdom AND prey_stage = :stage",
                        { name: record['taxonUnid'], rank: preyLevel, kingdom: record['prey_kingdom'], stage: "NA" }).getRawOne();
                }
                // Append if common_name exists
                if (result !== undefined) {
                    record["taxon"] = record["taxon"] + " [" + result["common_name"] + "]" ;
                }
            }
        }
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
        qb = PredatorPageResolver.addArgConditions(qb, predatorName, season, region, startYear, endYear);

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
            .select("COUNT(DISTINCT source) AS studiesCount, COUNT(*) AS recordsCount")
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
            .select("IFNULL(observation_season, \"unspecified\") AS season, COUNT(*) AS count")
            .from(AvianDiet, "avian");
        qb = PredatorPageResolver.addArgConditions(qb, predatorName, season, region, startYear, endYear)
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
            .select("observation_year_end AS year, COUNT(*) AS count")
            .from(AvianDiet, "avian");
        qbYears = PredatorPageResolver.addArgConditions(qbYears, predatorName, season, region, startYear, endYear)
            .andWhere("observation_year_end IS NOT NULL")
            .groupBy("observation_year_end")
            .orderBy("observation_year_end", "ASC");
        const rawResult = await qbYears.getRawMany();

        const minMaxDecades = await getManager()
            .createQueryBuilder()
            .select("MIN(observation_year_end) AS min, MAX(observation_year_end) AS max")
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
            .select("diet_type AS diet, COUNT(*) AS count")
            .from(AvianDiet, "avian");
        qb = PredatorPageResolver.addArgConditions(qb, predatorName, season, region, startYear, endYear)
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
        const qbMain = getManager()
            .createQueryBuilder()
            .select("DISTINCT location_region AS region")
            .from(AvianDiet, "avian")
            .where("common_name = :predName OR scientific_name = :predName", { predName: name });
        const qbAcceptableRegions = getManager()
            .createQueryBuilder()
            .select("region_name AS region")
            .from(Regions, "regions");
        const qbStartYear = getManager()
            .createQueryBuilder()
            .select("DISTINCT IFNULL(observation_year_begin, observation_year_end) AS startYear")
            .from(AvianDiet, "avian")
            .where("(common_name = :predName OR scientific_name = :predName)", { predName: name })
            .andWhere("observation_year_end IS NOT NULL")
            .orderBy("startYear", "ASC");
        const qbEndYear = getManager()
            .createQueryBuilder()
            .select("DISTINCT observation_year_end AS endYear")
            .from(AvianDiet, "avian")
            .where("(common_name = :predName OR scientific_name = :predName)", { predName: name })
            .andWhere("observation_year_end IS NOT NULL")
            .orderBy("endYear", "DESC");

        const regionRawResult = await qbMain.getRawMany();
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

    
    @Query(() => [regionCountTuple])
    async getMapData(@Args() {predatorName, startYear, endYear, season, region}: GetPreyOfArgs) {
        let qb = getManager()
            .createQueryBuilder()
            .select("location_region AS region, COUNT(location_region) AS count")
            .from(AvianDiet, "avian");
        qb = PredatorPageResolver.addArgConditions(qb, predatorName, season, region, startYear, endYear)
            .groupBy("location_region");

        const rawResult = await qb.getRawMany();
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

    // Assumes AvianDiet alias is avian
    static addArgConditions(qb: SelectQueryBuilder<any>, predatorName: string, season: string, region: string, startYear?: string, endYear?: string) {
        qb = qb.where("(avian.common_name = :name OR avian.scientific_name = :name)", { name: predatorName });

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
}
