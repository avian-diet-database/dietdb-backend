import { Arg, Args, ArgsType, Field, ObjectType, Query, Resolver } from "type-graphql";
import { getManager } from "typeorm";
import Utils from "../utils"

@ArgsType()
class GetPredatorOfArgs {
    @Field()
    predatorName: string;

    @Field({ defaultValue: "order"})
    preyLevel: string;

    @Field({ nullable: true })
    dietType?: string;

    @Field({ nullable: true })
    startYear?: string;

    @Field({ nullable: true })
    endYear?: string;

    @Field({ nullable: true })
    season?: string;

    @Field({ nullable: true })
    region?: string;
}
@ObjectType()
export class PreySources {
    @Field({ nullable: true })
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

@ObjectType()
export class Prey {
    @Field({ nullable: true })
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
export class AvianDietResolver {
    @Query(() => [Prey])
    async getPreyOf(@Args() {predatorName, preyLevel, dietType, startYear, endYear, season, region}: GetPredatorOfArgs) {
        const argConditions = `
        (common_name = "${predatorName}" OR scientific_name = "${predatorName}")
        ${startYear !== undefined ? " AND observation_year_begin >= " + startYear : ""}
        ${endYear !== undefined ? " AND observation_year_end <= " + endYear : ""}
        ${season !== undefined ? " AND observation_season = \"" + season + "\"" : ""}
        ${region !== undefined ? " AND location_region = \"" + region + "\"" : ""}
        `
        const query = `
        SELECT taxon
            ${!dietType || dietType == "items" ? ", SUM(Items) as items" : "" }
            ${!dietType || dietType == "wt_or_vol" ? ", SUM(Wt_or_Vol) as wt_or_vol" : "" }
            ${!dietType || dietType == "occurrence" ? ", SUM(Occurrence) as occurrence" : "" }
            ${!dietType || dietType == "unspecified" ? ", SUM(Unspecified) as unspecified" : "" }
        FROM
            (SELECT taxon, final1.diet_type,
                ROUND(SUM(Items) * 100.0 / n, 3) as Items,
                ROUND(SUM(Wt_or_Vol) * 100.0 / n, 3) as Wt_or_Vol,
                ROUND(SUM(Occurrence) * 100.0 / n, 3) as Occurrence,
                ROUND(SUM(Unspecified) * 100.0 / n, 3) as Unspecified
            FROM
                (SELECT diet_type,
                    IF(prey_stage IS NOT NULL AND prey_stage != "adult", CONCAT(taxonUnid, ' ', prey_stage), taxonUnid) AS taxon,
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
        `
        return await getManager().query(query);
    }

    // Assumes sources will never be empty/null in database
    // Prey Level doesn't matter since we will always include a record regardless of level, we prepend 'Unid.' with the next lowest level, see getPreyOf query for more detail
    @Query(() => [String])
    async getPreyOfSources(@Args() {predatorName, dietType, startYear, endYear, season, region}: GetPredatorOfArgs) {            
        const argConditions = `
        (common_name = "${predatorName}" OR scientific_name = "${predatorName}")
        ${startYear !== undefined ? " AND observation_year_begin >= " + startYear : ""}
        ${endYear !== undefined ? " AND observation_year_end <= " + endYear : ""}
        ${season !== undefined ? " AND observation_season = \"" + season + "\"" : ""}
        ${region !== undefined ? " AND location_region = \"" + region + "\"" : ""}
        ${dietType !== undefined ? " AND diet_type = \"" + dietType + "\"" : ""}
        `

        const query = `
		SELECT DISTINCT source
        FROM avian_diet
        WHERE ${argConditions}
        `
        const rawResult = await getManager().query(query);

        let sourceList = [];
        for (let source of rawResult) {
            sourceList.push(source["source"]);
        }

        return sourceList;
    }

    @Query(() => [String])
    async getAutocomplete(
        @Arg("input") input: string
    ) {
        const query = `
        SELECT name FROM
	        (SELECT common_name AS name FROM avian_diet WHERE common_name LIKE "%${input}%"
	        UNION
	        SELECT  scientific_name AS name FROM avian_diet WHERE scientific_name LIKE "%${input}%") result
        ORDER BY LENGTH(name) - LENGTH("${input}") ASC
        LIMIT 10`

        const rawResult = await getManager().query(query);
        let resultList = [];
        for (let item of rawResult) {
            resultList.push(item["name"]);
        }
        return resultList;
    }
}
