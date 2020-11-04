import Utils from "../utils"

describe('getUnidTaxon', () => {
    it("prepend Unid preylevel kingdom", async () => {
        const result = Utils.getUnidTaxon("prey_kingdom");
        expect(result).toBe("prey_kingdom");
    });

    it("prepend Unid preylevel phylum", async () => {
        const result = Utils.getUnidTaxon("prey_phylum");
        expect(result).toBe("IFNULL(prey_phylum, CONCAT(\"Unid. \", prey_kingdom))");
    });

    it("prepend Unid preylevel class", async () => {
        const result = Utils.getUnidTaxon("prey_class");
        expect(result).toBe("IFNULL(prey_class, CONCAT(\"Unid. \", IFNULL(prey_phylum, prey_kingdom)))");
    });

    it("prepend Unid preylevel order", async () => {
        const result = Utils.getUnidTaxon("prey_order");
        expect(result).toBe("IFNULL(prey_order, CONCAT(\"Unid. \", IFNULL(prey_class, IFNULL(prey_phylum, prey_kingdom))))");
    });

    it("prepend Unid preylevel suborder", async () => {
        const result = Utils.getUnidTaxon("prey_suborder");
        expect(result).toBe("IFNULL(prey_suborder, CONCAT(\"Unid. \", IFNULL(prey_order, IFNULL(prey_class, IFNULL(prey_phylum, prey_kingdom)))))");
    });

    it("prepend Unid preylevel genus", async () => {
        const result = Utils.getUnidTaxon("prey_genus");
        expect(result).toBe("IFNULL(prey_genus, CONCAT(\"Unid. \", IFNULL(prey_suborder, IFNULL(prey_order, IFNULL(prey_class, IFNULL(prey_phylum, prey_kingdom))))))");
    });

    it("prepend Unid preylevel scientific name", async () => {
        const result = Utils.getUnidTaxon("prey_scientific_name");
        expect(result).toBe("IFNULL(prey_scientific_name, CONCAT(\"Unid. \", IFNULL(prey_genus, IFNULL(prey_suborder, IFNULL(prey_order, IFNULL(prey_class, IFNULL(prey_phylum, prey_kingdom)))))))");
    });
});