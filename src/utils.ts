import { Field, ObjectType } from "type-graphql";

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
}

@ObjectType()
export class StudiesAndRecordsCount {
    @Field()
    studies: string;

    @Field()
    records: string;
}