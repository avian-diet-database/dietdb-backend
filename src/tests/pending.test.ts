import {request} from 'graphql-request'
import { createConnection, getManager} from 'typeorm';
import { AvianDietPending } from '../entities/AvianDietPending';

const common_name = "common_name_test";
const source = "source_test";
const subspecies = "subspecies_test";
const taxonomy = "taxonomy_test";
const location_region = "location_region_test";
const location_specific = "location_specific_test";
const prey_kingdom = "prey_kingdom_test";
const diet_type = "diet_type_test";

const createAlternativePendingDietMutation = 
    `mutation {createAlternativePendingDiet(common_name:"${common_name}",source: "${source}",subspecies: "${subspecies}",taxonomy:"${taxonomy}",location_region: "${location_region}",location_specific: "${location_specific}",prey_kingdom: "${prey_kingdom}",diet_type: "${diet_type}")}`

const getPendingDietQuery =
    `query {getPendingDiet{common_name,source,subspecies,taxonomy,location_region,location_specific,prey_kingdom,diet_type}}`;

    test("Register Diet", async () => {
        const response = await request('http://localhost:4000/graphql',createAlternativePendingDietMutation);
        expect(response).toEqual({createAlternativePendingDiet: true});
    })

    test("Retrieve PendingDiet", async () => {
        await request('http://localhost:4000/graphql',getPendingDietQuery);
        await createConnection();
        const users = await AvianDietPending.find({where: {common_name: "common_name_test", source: "source_test",subspecies: "subspecies_test", taxonomy: "taxonomy_test",location_region: "location_region_test", location_specific: "location_specific_test", prey_kingdom: "prey_kingdom_test", diet_type: "diet_type_test"}});
        expect(users).toHaveLength(1);
        const entityManager = getManager();
        entityManager.query(`DELETE FROM avian_diet_pending WHERE common_name = "common_name_test" AND source = "source_test" AND location_specific = "location_specific_test"`);
    })