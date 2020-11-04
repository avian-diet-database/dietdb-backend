import { Connection } from "typeorm";
import { gCall } from "./tst-utils/gCall";
import { GET_AUTOCOMPLETE_PREY, GET_PREDATOR_OF } from "./tst-utils/queries";
import { testConn } from "./tst-utils/testConn";

let conn: Connection;

beforeAll(async () => {
    conn = await testConn();
});

afterAll(async () => {
    await conn.close();
});

// Running against values obtained via R script in https://github.com/ahhurlbert/aviandietdb/blob/d74e34e0a6c0fa24b8fedd7235887c919dbd1f66/R/dietSummaryByPrey.r, particularly the dietSummaryByPrey function
describe('getPredatorOf', () => {
    it("get predators", async () => {
        const response = await gCall({
            source: GET_PREDATOR_OF,
            variableValues: {
                name: "Suliformes" 
            }
        });
        expect(response["data"]!.getPredatorOf.length).toBe(3);
    });
});

describe('getAutocompletePrey', () => {
    it("get autocomplete prey", async () => {
        const response = await gCall({
            source: GET_AUTOCOMPLETE_PREY,
            variableValues: {
                input: "ici" 
            }
        });
        expect(response["data"]!.getAutocompletePrey.length).toBe(8);
    });
});