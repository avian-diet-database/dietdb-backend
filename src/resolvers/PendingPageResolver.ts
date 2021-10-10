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

    @Mutation(() => Boolean) 
    async createPendingDiet(@Arg("input", () => PendingDietInput) input: PendingDietInput) {
        await AvianDietPending.insert(input);
        return true;
    }

    @Mutation(() => Boolean) 
    async createMainDiet(@Arg("input", () => PendingDietInput) input: PendingDietInput) {
        await AvianDiet.insert(input);
        return true;
    }

}

