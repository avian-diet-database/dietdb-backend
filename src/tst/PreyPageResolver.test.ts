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

// Running against values obtained via R scripts in https://github.com/hurlbertlab/dietdatabase/commit/b184feaa01b695eb66d12911c8b7eccb12b2f3d7, particularly the speciesSummary function
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