import { IsIn } from "class-validator";
import { AvianDiet } from "../entities/AvianDiet";
import { CommonNames } from "../entities/CommonNames";
import { PreyNames } from "../entities/PreyNames";
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
    // Returns original name if not a mapped common name
    static async checkIfCommon(preyName: string) {
        const checkIfCommon = await getManager()
            .createQueryBuilder()
            .select("is_common_name")
            .from(PreyNames, "prey_names")
            .where("name = :name", { name: preyName })
            .getRawOne();
        if (checkIfCommon['is_common_name']) {
            const additionalInfo = await getManager()
                .createQueryBuilder()
                .select("taxon, prey_kingdom, prey_stage")
                .from(CommonNames, "common_names")
                .where("common_name = :input", { input: preyName })
                .getRawOne();
            preyName = additionalInfo['taxon'];
            let preyKingdom = additionalInfo['prey_kingdom'];
            let preyStage = additionalInfo['prey_stage'];
            return { name: preyName, kingdom: preyKingdom, stage: preyStage };
        }
        return { name: preyName };
    }
    @Query(() => [Predator])
    async getPredatorOf(@Args() {preyName, preyStage, startYear, endYear, season, region}: GetPredatorOfArgs) {
        let { name: newName, kingdom: preyKingdom, stage: newStage } = await PreyPageResolver.checkIfCommon(preyName);
        preyStage = newStage && newStage !== "NA" ? newStage : preyStage;

        let qbInitial = getManager()
            .createQueryBuilder()
            .select("common_name, family, diet_type, source, IF(diet_type = \"Occurrence\", MAX(fraction_diet), SUM(fraction_diet)) AS fraction_diet")
            .from(AvianDiet, "avian");
        qbInitial = PreyPageResolver.addArgConditions(qbInitial, newName, preyStage, season, region, startYear, endYear);
        if (preyKingdom) {
            qbInitial = qbInitial.andWhere("prey_kingdom = :kingdom", { kingdom: preyKingdom });
        }
        qbInitial = qbInitial.groupBy("source, common_name, subspecies, family, observation_year_begin, observation_month_begin, observation_year_end, observation_month_end, observation_season, analysis_number, bird_sample_size, habitat_type, location_region, location_specific, item_sample_size, diet_type, study_type, sites");
        
        const qbFinal = getManager()
            .createQueryBuilder()
            .select("common_name, family, diet_type, AVG(fraction_diet) * 100.0 AS fraction_diet, COUNT(DISTINCT source) AS number_of_studies")
            .from("(" + qbInitial.getQuery() + ")", "initial")
            .groupBy("common_name, family, diet_type")
            .setParameters(qbInitial.getParameters());
        return await qbFinal.getRawMany();
    }

    // Searches through all prey levels
    @Query(() => [String])
    async getAutocompletePrey(
        @Arg("input") input: string
    ) {
       const query = `
       SELECT DISTINCT name FROM prey_names WHERE name LIKE ? ORDER BY LENGTH(name) - LENGTH(?) ASC LIMIT 10
       `;

        const rawResult = await getManager().query(query, ["%" + input + "%", input]);
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
        let { name: newName, kingdom: preyKingdom, stage: preyStage } = await PreyPageResolver.checkIfCommon(name);

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
        let qbRegion = getManager()
            .createQueryBuilder()
            .select("DISTINCT location_region AS region")
            .from(AvianDiet, "avian")
            .where(preyFilter, { preyName: newName });
        let qbAcceptableRegions = getManager()
            .createQueryBuilder()
            .select("region_name AS region")
            .from(Regions, "regions");
        let qbStartYear = getManager()
            .createQueryBuilder()
            .select("DISTINCT IFNULL(observation_year_begin, observation_year_end) AS startYear")
            .from(AvianDiet, "avian")
            .where(preyFilter, { preyName: newName })
            .andWhere("observation_year_end IS NOT NULL")
        let qbEndYear = getManager()
            .createQueryBuilder()
            .select("DISTINCT observation_year_end AS endYear")
            .from(AvianDiet, "avian")
            .where(preyFilter, { preyName: newName })
            .andWhere("observation_year_end IS NOT NULL")
        let qbPreyStages = getManager()
            .createQueryBuilder()
            .select("DISTINCT prey_stage AS stage")
            .from(AvianDiet, "avian")
            .where(preyFilter, { preyName: newName })
            .andWhere("prey_stage IS NOT NULL AND prey_stage != 'unspecified'");

        // Probably a way smarter way to do this
        let preyStagesList = new Set;
        if (preyKingdom) {
            qbRegion = qbRegion.andWhere("prey_kingdom = :kingdom", { kingdom: preyKingdom });
            qbStartYear = qbStartYear.andWhere("prey_kingdom = :kingdom", { kingdom: preyKingdom });
            qbEndYear = qbEndYear.andWhere("prey_kingdom = :kingdom", { kingdom: preyKingdom });
            qbPreyStages = qbPreyStages.andWhere("prey_kingdom = :kingdom", { kingdom: preyKingdom });
        }
        if (preyStage && preyStage !== "NA") {
                qbRegion = qbRegion.andWhere("prey_stage LIKE :stage", { stage: preyStage });
                qbStartYear = qbStartYear.andWhere("prey_stage LIKE :stage", { stage: preyStage });
                qbEndYear = qbEndYear.andWhere("prey_stage LIKE :stage", { stage: preyStage });
                preyStagesList.add(preyStage);
        } else {
            const preyStagesRawResult = await qbPreyStages.getRawMany();
            for (let item of preyStagesRawResult) {
                let stages = item["stage"].split(';');
                for (let stage of stages) {
                    preyStagesList.add(stage);
                }
            }
        }

        const regionRawResult = await qbRegion.getRawMany();
        const acceptableRegionsRawResult = await qbAcceptableRegions.getRawMany(); 
        const startYearRawResult = await qbStartYear.orderBy("startYear", "ASC").getRawMany();
        const endYearRawResult = await qbEndYear.orderBy("endYear", "DESC").getRawMany(); 
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
        return { regions: regionList, startYears: startYearsList, endYears: endYearsList, preyStages: preyStagesList };
    }

    @Query(() => StudiesAndRecordsCount)
    async getNumRecordsAndStudiesPrey(
        @Arg("name") name: string
    ) {
        let { name: newName, kingdom: preyKingdom, stage: preyStage } = await PreyPageResolver.checkIfCommon(name);
        let qb = getManager()
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
            `, { preyName: newName });
        if (preyKingdom) {
            qb = qb.andWhere("prey_kingdom = :kingdom", { kingdom: preyKingdom });
        }
        if (preyStage && preyStage !== "NA") {
            qb = qb.andWhere("prey_stage LIKE :stage", { stage: "%" +  preyStage + "%" });
        }

        const rawResult = await qb.getRawMany();
        return {
            studies: rawResult[0]["numStudies"],
            records: rawResult[0]["numRecords"]
        };
    }

    // Assumes sources will never be empty/null in database
    @Query(() => [String])
    async getPredatorOfSources(@Args() {preyName, preyStage, startYear, endYear, season, region}: GetPredatorOfArgs) {            
        let { name: newName, kingdom: preyKingdom, stage: newStage } = await PreyPageResolver.checkIfCommon(preyName);
        preyStage = newStage && newStage !== "NA" ? newStage : preyStage;

        let qb = getManager()
            .createQueryBuilder()
            .select("DISTINCT source")
            .from(AvianDiet, "avian");
        qb = PreyPageResolver.addArgConditions(qb, newName, preyStage, season, region, startYear, endYear);
        if (preyKingdom) {
            qb = qb.andWhere("prey_kingdom = :kingdom", { kingdom: preyKingdom });
        }

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
                qb = qb.andWhere("(avian.prey_stage LIKE :stage OR avian.prey_stage IS NULL)", { stage: "%" + preyStage + "%" })
            } else {
                qb = qb.andWhere("avian.prey_stage LIKE :stage", { stage: "%" + preyStage + "%" })
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
}
