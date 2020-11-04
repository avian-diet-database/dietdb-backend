import { Connection } from "typeorm";
import { gCall } from "./tst-utils/gCall";
import { GET_AUTOCOMPLETE_PRED, GET_MAP_DATA, GET_NUM_RECORDS_AND_STUDIES, GET_PREY_OF, GET_PREY_OF_SOURCES, GET_REGIONS_PRED, RECORDS_PER_DECADE, RECORDS_PER_DIET_TYPE, RECORDS_PER_SEASON } from "./tst-utils/queries";
import { testConn } from "./tst-utils/testConn";

let conn: Connection;

beforeAll(async () => {
    conn = await testConn();
});

afterAll(async () => {
    await conn.close();
});

// Running against values obtained via R scripts in https://github.com/hurlbertlab/dietdatabase/commit/b184feaa01b695eb66d12911c8b7eccb12b2f3d7, particularly the speciesSummary function
describe('getPreyOf', () => {
    it("get prey", async () => {
        const response = await gCall({
            source: GET_PREY_OF,
            variableValues: {
                name: "Bald Eagle" 
            }
        });
        expect(response["data"]!.getPreyOf.length).toBe(70);
    });

    it("get prey zero result", async () => {
        const response = await gCall({
            source: GET_PREY_OF,
            variableValues: {
                name: "Random Bird" 
            }
        });
        expect(response["data"]!.getPreyOf.length).toBe(0);
    });
});

describe('getPreyOfSources', () => {
    it("get sources", async () => {
        const response = await gCall({
            source: GET_PREY_OF_SOURCES,
            variableValues: {
                name: "Bald Eagle"
            }
        });
        expect(response["data"]!.getPreyOfSources.length).toBe(29);
    });
});

describe('getAutocompletePred', () => {
    it("get autcomplete", async () => {
        const response = await gCall({
            source: GET_AUTOCOMPLETE_PRED,
            variableValues: {
                input: "al"
            }
        });
        expect(response["data"]!.getAutocompletePred.length).toBe(4);
    })
});

describe('getNumRecordsAndStudies', () => {
    it("get number of records and studies", async () => {
        const response = await gCall({
            source: GET_NUM_RECORDS_AND_STUDIES,
            variableValues: {
                name: "Bald Eagle"
            }
        });
        expect(response["data"]!.getNumRecordsAndStudies.studies).toBe('29');
        expect(response["data"]!.getNumRecordsAndStudies.records).toBe('1218');
    })
});

describe('getRecordsPerSeason', () => {
    it("get records per season", async () => {
        const response = await gCall({
            source: RECORDS_PER_SEASON,
            variableValues: {
                name: "Bald Eagle"
            }
        });
        expect(response["data"]!.getRecordsPerSeason.length).toBe(6);
    });
});

describe('getRecordsPerDecade', () => {
    it("get records per decade", async () => {
        const response = await gCall({
            source: RECORDS_PER_DECADE,
            variableValues: {
                name: "Bald Eagle"
            }
        });
        expect(response["data"]!.getRecordsPerDecade.length).toBe(9);
    });
});

describe('getRecordsPerDietType', () => {
    it("get records per diet type", async () => {
        const response = await gCall({
            source: RECORDS_PER_DIET_TYPE,
            variableValues: {
                name: "Bald Eagle"
            }
        });
        expect(response["data"]!.getRecordsPerDietType.length).toBe(4);
    });
});

describe('getRegionsPred', () => {
    it("get list of regions", async () => {
        const response = await gCall({
            source: GET_REGIONS_PRED,
            variableValues: {
                name: "Bald Eagle"
            }
        });
        expect(response["data"]!.getRegionsPred.length).toBe(25);
    });
});

describe('getMapData', () => {
    it("get state record number", async () => {
        const response = await gCall({
            source: GET_MAP_DATA,
            variableValues: {
                name: "Bald Eagle"
            }
        });
        expect(response["data"]!.getMapData.length).toBe(25);
    });
});