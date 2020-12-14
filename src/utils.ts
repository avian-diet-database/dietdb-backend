import { Field, ObjectType } from "type-graphql";
import { SelectQueryBuilder } from "typeorm";

export class Utils {
    // Assumes preyLevel is one of the 8 valid prey levels
    // This should be checked before use of function
    static getUnidTaxon(preyLevel: string) {
        // Kingdom assumed to never be null
        if (preyLevel === "prey_kingdom") {
            return preyLevel;
        }
        let initialLeft = "IFNULL(prey_phylum, ";
        let initialRight = "prey_kingdom)";
        if (preyLevel === "prey_phylum") {
            return `${initialLeft}CONCAT("Unid. ", ${initialRight})`;
        }
        initialRight = initialLeft + initialRight + ")";
        initialLeft = "IFNULL(prey_class, ";
        if (preyLevel === "prey_class") {
            return `${initialLeft}CONCAT("Unid. ", ${initialRight})`;
        }
        initialRight = initialLeft + initialRight + ")";
        initialLeft = "IFNULL(prey_order, ";
        if (preyLevel === "prey_order") {
            return `${initialLeft}CONCAT("Unid. ", ${initialRight})`;
        }
        initialRight = initialLeft + initialRight + ")";
        initialLeft = "IFNULL(prey_suborder, ";
        if (preyLevel === "prey_suborder") {
            return `${initialLeft}CONCAT("Unid. ", ${initialRight})`;
        }
        initialRight = initialLeft + initialRight + ")";
        initialLeft = "IFNULL(prey_genus, ";
        if (preyLevel === "prey_genus") {
            return `${initialLeft}CONCAT("Unid. ", ${initialRight})`;
        }
        initialRight = initialLeft + initialRight + ")";
        initialLeft = "IFNULL(prey_scientific_name, ";
        return `${initialLeft}CONCAT("Unid. ", ${initialRight})`;
    }

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

@ObjectType()
export class StudiesAndRecordsCount {
    @Field()
    studies: string;

    @Field()
    records: string;
}

@ObjectType()
export class FilterValues {
    @Field(() => [String])
    regions: string[];

    @Field(() => [String])
    startYears: string[];

    @Field(() => [String])
    endYears: string[];
}