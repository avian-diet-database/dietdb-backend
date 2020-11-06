import { IsIn } from "class-validator";
import { Arg, Args, ArgsType, Field, ObjectType, Query, Resolver } from "type-graphql";
import { getManager } from "typeorm";
import Utils from "../utils"

@ArgsType()
class GetPreyOfArgs {
    @Field()
    predatorName: string;

    @Field({ defaultValue: "order"})
    @IsIn(["kingdom", "phylum", "class", "order", "suborder", "family", "genus", "scientific_name"])
    preyLevel: string;

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
export class StudiesAndRecordsCount {
    @Field()
    studies: string;

    @Field()
    records: string;
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
    @Query(() => [Prey])
    async getPreyOf(@Args() {predatorName, preyLevel, dietType, startYear, endYear, season, region}: GetPreyOfArgs) {
        const argConditions = `
        (common_name = "${predatorName}" OR scientific_name = "${predatorName}")
        ${startYear !== undefined ? " AND observation_year_begin >= " + startYear : ""}
        ${endYear !== undefined ? " AND observation_year_end <= " + endYear : ""}
        ${season !== "all" ? " AND observation_season LIKE \"%" + season + "%\"" : ""}
        ${region !== "all" ? " AND location_region LIKE \"%" + region + "%\"" : ""}
        `;

        const query = `
        SELECT taxon
            ${dietType === "all" || dietType == "items" ? ", SUM(Items) as items" : "" }
            ${dietType === "all" || dietType == "wt_or_vol" ? ", SUM(Wt_or_Vol) as wt_or_vol" : "" }
            ${dietType === "all" || dietType == "occurrence" ? ", SUM(Occurrence) as occurrence" : "" }
            ${dietType === "all" || dietType == "unspecified" ? ", SUM(Unspecified) as unspecified" : "" }
        FROM
            (SELECT taxon, final1.diet_type,
                SUM(Items) * 100.0 / n as Items,
                SUM(Wt_or_Vol) * 100.0 / n as Wt_or_Vol,
                SUM(Occurrence) * 100.0 / n as Occurrence,
                SUM(Unspecified) * 100.0 / n as Unspecified
            FROM
                (SELECT diet_type,
                    ${preyLevel !== "kingdom" && preyLevel !== "phylum" && preyLevel !== "class" ? "IF(prey_stage IS NOT NULL AND prey_stage != \"adult\", CONCAT(taxonUnid, ' ', prey_stage), taxonUnid)" : "taxonUnid"} AS taxon,
                    SUM(Items) as Items,
                    SUM(Wt_or_Vol) as Wt_or_Vol,
                    MAX(Occurrence) as Occurrence,
                    SUM(Unspecified) as Unspecified
                FROM
		            (SELECT source, observation_year_begin, observation_month_begin, observation_season, bird_sample_size, habitat_type, location_region, item_sample_size, diet_type, prey_stage,
			            ${Utils.getUnidTaxon("prey_" + preyLevel)} AS taxonUnid,
			            IF(diet_type = "Items", fraction_diet, NULL) as Items,
			            IF(diet_type = "Wt_or_Vol", fraction_diet, NULL) as Wt_or_Vol,
			            IF(diet_type = "Occurrence", fraction_diet, NULL) as Occurrence,
                        IF(diet_type = "Unspecified", fraction_diet, NULL) as Unspecified
                    FROM avian_diet
                    WHERE ${argConditions}
                    ) AS final0
                GROUP BY source, observation_year_begin, observation_month_begin, observation_season, bird_sample_size, habitat_type, location_region, item_sample_size, taxon, diet_type
            ) final1,
            (SELECT diet_type, COUNT(*) AS n
		    FROM
			    (SELECT DISTINCT *
				FROM
					(SELECT *
                    FROM
						(SELECT source, observation_year_begin, observation_month_begin, observation_season, bird_sample_size, habitat_type, location_region, location_specific, item_sample_size, diet_type, study_type
                        FROM avian_diet
                        WHERE ${argConditions}
                        ) AS dietspUnid)
                    AS dietsp)
                AS distinctCombo GROUP BY diet_type
            ) totalPerDietType
            WHERE totalPerDietType.diet_type = final1.diet_type
            GROUP BY taxon, diet_type
        ) final2
        GROUP BY taxon
        ${dietType !== "all" ? "HAVING" : ""} 
            ${dietType == "items" ? "SUM(Items) IS NOT NULL" : "" }
            ${dietType == "wt_or_vol" ? "SUM(Wt_or_Vol) IS NOT NULL" : "" }
            ${dietType == "occurrence" ? "SUM(Occurrence) IS NOT NULL" : "" }
            ${dietType == "unspecified" ? "SUM(Unspecified) IS NOT NULL" : "" }
        `;

        return await getManager().query(query);
    }

    // Assumes sources will never be empty/null in database
    // Prey Level doesn't matter since we will always include a record regardless of level, we prepend 'Unid.' with the next lowest level, see getPreyOf query for more detail
    @Query(() => [String])
    async getPreyOfSources(@Args() {predatorName, dietType, startYear, endYear, season, region}: GetPreyOfArgs) {            
        const argConditions = `
        (common_name = "${predatorName}" OR scientific_name = "${predatorName}")
        ${startYear !== undefined ? " AND observation_year_begin >= " + startYear : ""}
        ${endYear !== undefined ? " AND observation_year_end <= " + endYear : ""}
        ${season !== "all" ? " AND observation_season LIKE \"%" + season + "%\"" : ""}
        ${region !== "all" ? " AND location_region LIKE \"%" + region + "%\"" : ""}
        ${dietType !== "all" ? " AND diet_type = \"" + dietType + "\"" : ""}
        `;

        const query = `
		SELECT DISTINCT source
        FROM avian_diet
        WHERE ${argConditions}
        `;
        const rawResult = await getManager().query(query);

        let sourceList = [];
        for (let source of rawResult) {
            sourceList.push(source["source"]);
        }

        return sourceList;
    }

    // Searches through common_name and scientific_name
    @Query(() => [String])
    async getAutocompletePred(
        @Arg("input") input: string
    ) {
        const query = `
        SELECT DISTINCT name FROM
	        (SELECT DISTINCT common_name AS name FROM avian_diet WHERE common_name LIKE "%${input}%"
	        UNION
	        SELECT DISTINCT scientific_name AS name FROM avian_diet WHERE scientific_name LIKE "%${input}%") result
        ORDER BY LENGTH(name) - LENGTH("${input}") ASC
        LIMIT 10
        `;

        const rawResult = await getManager().query(query);
        let resultList = [];
        for (let item of rawResult) {
            resultList.push(item["name"]);
        }
        return resultList;
    }

    @Query(() => StudiesAndRecordsCount)
    async getNumRecordsAndStudies(
        @Arg("name") name: string
    ) {
        const numStudies = await getManager().query(`SELECT COUNT(DISTINCT source) AS count FROM avian_diet WHERE common_name = "${name}" OR scientific_name = "${name}"`);
        const numRecords = await getManager().query(`SELECT COUNT(*) AS count FROM avian_diet WHERE common_name = "${name}" OR scientific_name = "${name}"`);
        return {
            studies: numStudies[0]["count"],
            records: numRecords[0]["count"]
        };
    }

    @Query(() => [graphXY])
    async getRecordsPerSeason(@Args() {predatorName, dietType, startYear, endYear, season, region}: GetPreyOfArgs) {
        const argConditions = `
        (common_name = "${predatorName}" OR scientific_name = "${predatorName}")
        ${startYear !== undefined ? " AND observation_year_begin >= " + startYear : ""}
        ${endYear !== undefined ? " AND observation_year_end <= " + endYear : ""}
        ${season !== "all" ? " AND observation_season LIKE \"%" + season + "%\"" : ""}
        ${region !== "all" ? " AND location_region LIKE \"%" + region + "%\"" : ""}
        ${dietType !== "all" ? " AND diet_type = \"" + dietType + "\"" : ""}
        `;

        const rawResult = await getManager().query(`SELECT IFNULL(observation_season, "unspecified") AS season, COUNT(*) as count FROM avian_diet WHERE ${argConditions} GROUP BY observation_season`);
        let summer: graphXY =  { x: "Summer", y: 0 };
        let spring: graphXY =  { x: "Spring", y: 0 };
        let fall: graphXY =  { x: "Fall", y: 0 };
        let winter: graphXY =  { x: "Winter", y: 0 };
        let multipleUnspecified: graphXY =  { x: "Unspecified", y: 0 };

        for (let item of rawResult) {
            if (String(item["season"]).includes('summer')) {
                summer.y += +item["count"];
            }
            if (String(item["season"]).includes('spring')) {
                spring.y += +item["count"];
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
        return [summer, spring, fall, winter, multipleUnspecified];
    }

    // Only includes decades with actual data points
    @Query(() => [graphXY])
    async getRecordsPerDecade(@Args() {predatorName, dietType, startYear, endYear, season, region}: GetPreyOfArgs) {            
        const argConditions = `
        (common_name = "${predatorName}" OR scientific_name = "${predatorName}")
        ${startYear !== undefined ? " AND observation_year_begin >= " + startYear : ""}
        ${endYear !== undefined ? " AND observation_year_end <= " + endYear : ""}
        ${season !== "all" ? " AND observation_season LIKE \"%" + season + "%\"" : ""}
        ${region !== "all" ? " AND location_region LIKE \"%" + region + "%\"" : ""}
        ${dietType !== "all" ? " AND diet_type = \"" + dietType + "\"" : ""}
        `;

        const rawResult = await getManager().query(`SELECT observation_year_end as year, COUNT(*) as count FROM avian_diet WHERE ${argConditions} AND observation_year_end IS NOT NULL GROUP BY observation_year_end ORDER BY observation_year_end ASC`);
        const minMaxDecades = await getManager().query(`SELECT MIN(observation_year_end) as min, MAX(observation_year_end) as max FROM avian_diet WHERE (common_name = "${predatorName}" OR scientific_name = "${predatorName}") AND observation_year_end IS NOT NULL`);
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
    async getRecordsPerDietType(@Args() {predatorName, dietType, startYear, endYear, season, region}: GetPreyOfArgs) {
        const argConditions = `
        (common_name = "${predatorName}" OR scientific_name = "${predatorName}")
        ${startYear !== undefined ? " AND observation_year_begin >= " + startYear : ""}
        ${endYear !== undefined ? " AND observation_year_end <= " + endYear : ""}
        ${season !== "all" ? " AND observation_season LIKE \"%" + season + "%\"" : ""}
        ${region !== "all" ? " AND location_region LIKE \"%" + region + "%\"" : ""}
        ${dietType !== "all" ? " AND diet_type = \"" + dietType + "\"" : ""}
        `;

        const rawResult = await getManager().query(`SELECT diet_type as diet, COUNT(*) as count FROM avian_diet WHERE ${argConditions} GROUP BY diet_type`);
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

    @Query(() => [String])
    async getRegionsPred(
        @Arg("name") name: string
    ) {
        const query = `
        SELECT DISTINCT location_region AS region FROM avian_diet WHERE common_name = "${name}" OR scientific_name = "${name}"
        `;

        const rawResult = await getManager().query(query);
        let regionList = new Set();
        for (let item of rawResult) {
            let regions = item["region"].split(';');
            for (let region of regions) {
                regionList.add(region);
            }
        }
        return regionList;
    }
    
    @Query(() => [regionCountTuple])
    async getMapData(@Args() {predatorName, dietType, startYear, endYear, season, region}: GetPreyOfArgs) {
        const argConditions = `
        (common_name = "${predatorName}" OR scientific_name = "${predatorName}")
        ${startYear !== undefined ? " AND observation_year_begin >= " + startYear : ""}
        ${endYear !== undefined ? " AND observation_year_end <= " + endYear : ""}
        ${season !== "all" ? " AND observation_season LIKE \"%" + season + "%\"" : ""}
        ${region !== "all" ? " AND location_region LIKE \"%" + region + "%\"" : ""}
        ${dietType !== "all" ? " AND diet_type = \"" + dietType + "\"" : ""}
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
