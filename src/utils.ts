export default class Utils {
    // Assumes preyLevel is one of the 8 valid prey levels
    // This should be checked before use of function
    static getUnidTaxon(preyLevel: string) {
        if (preyLevel === "prey_kingdom") {
            return preyLevel;
        }
        let initial = "IFNULL(prey_phylum, prey_kingdom)";
        if (preyLevel === "prey_phylum") {
            return initial;
        }
        initial = "IFNULL(prey_class, " + initial + ")";
        if (preyLevel === "prey_class") {
            return initial;
        }
        initial = "IFNULL(prey_order, " + initial + ")";
        if (preyLevel === "prey_order") {
            return initial;
        }
        initial = "IFNULL(prey_suborder, " + initial + ")";
        if (preyLevel === "prey_suborder") {
            return initial;
        }
        initial = "IFNULL(prey_genus, " + initial + ")";
        if (preyLevel === "prey_genus") {
            return initial;
        }
        initial = "IFNULL(prey_scientific_name, " + initial + ")";
        return initial
    }
}