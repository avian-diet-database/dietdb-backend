import { AvianDietPending } from "../entities/AvianDietPending";
import { AvianDiet } from "../entities/AvianDiet";
import {Field, Query, Resolver, InputType, Mutation,Arg } from "type-graphql";


@InputType()
class PendingDietInput {
    @Field()
    common_name: string
    @Field()
    source: string

    @Field()
    subspecies: string

    @Field()
    taxonomy: string

    @Field()
    location_region: string

    @Field()
    location_specific: string

    @Field()
    prey_kingdom: string

    @Field()
    diet_type: string

}

@Resolver()
export class PendingPageResolver {
    @Query(() => [AvianDietPending])
    async getPendingDiet() {
        return AvianDietPending.find();
    }

    @Mutation(() => AvianDietPending) 
    async createPendingDiet(@Arg("input", () => PendingDietInput) input: PendingDietInput) {
        const pendingDiet = await AvianDietPending.create(input).save();
        return pendingDiet;
    }

    @Mutation(() => Boolean)
    async createAlternativePendingDiet(
        @Arg("common_name", () => String) common_name: string,
        @Arg("source", () => String) source: string,
        @Arg("subspecies", () => String) subspecies: string,
        @Arg("taxonomy", () => String) taxonomy: string,
        @Arg("location_region", () => String) location_region: string,
        @Arg("location_specific", () => String) location_specific: string,
        @Arg("prey_kingdom", () => String) prey_kingdom: string,
        @Arg("diet_type", () => String) diet_type: string,
        ) {
            await AvianDietPending.insert({common_name,source,subspecies,taxonomy,location_region, location_specific,
                 prey_kingdom,diet_type})
            return true;
        }

    //Upon failure an error array describing the issue will be returned.
    @Mutation(() => Boolean) 
    async createMainDiet(@Arg("input", () => PendingDietInput) input: PendingDietInput) {
        await AvianDiet.insert(input);
        return true;
    }

}

