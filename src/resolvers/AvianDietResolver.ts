import {  Args, ArgsType, Field, Int, ObjectType, Query, Resolver } from "type-graphql";
import { createQueryBuilder } from "typeorm";

@ArgsType()
class GetPredatorOfArgs {
    @Field()
    predatorName: string;

    @Field({ defaultValue: "prey_order"})
    preyLevel: string;

    @Field({ nullable: true })
    dietType?: string;

    @Field(() => Int, { nullable: true })
    startYear?: number;

    @Field(() => Int, { nullable: true })
    endYear?: number;

    @Field({ nullable: true })
    season?: string;

    @Field({ nullable: true })
    region?: string;
}

@ObjectType()
export class Prey {
    @Field({ nullable: true })
    @Field()
    taxon: string;

    @Field({ nullable: true })
    items?: string;

    @Field({ nullable: true })
    wt_or_vol?: string;

    @Field({ nullable: true })
    occurence?: string;

    @Field({ nullable: true })
    unspecified?: string;
}

@Resolver()
export class AvianDietResolver {
    @Query(() => [Prey])
    async getPreyOf(@Args() {predatorName, preyLevel, dietType, startYear, endYear, season, region}: GetPredatorOfArgs) {
        return  await createQueryBuilder()
        .select("diet." + preyLevel + " as taxon"
        + (!dietType || dietType === "items" ? ", SUM(diet.Items) as items" : "")
        + (!dietType || dietType === "occurence" ? ", SUM(diet.Occurrence) as occurence" : "")
        + (!dietType || dietType === "wt_or_vol" ? ", SUM(diet.Wt_or_Vol) as wt_or_vol" : "")
        + (!dietType || dietType === "unspecified" ? ", SUM(diet.Unspecified) as unspecified" : ""))
        .from(subQuery => {
            return subQuery
                .select(preyLevel + ", source, observation_year_begin, observation_month_begin, observation_season, bird_sample_size, habitat_type, location_region, item_sample_size, diet_type, IF(diet_type = 'Items', SUM(fraction_diet), null) as 'Items', IF(diet_type = 'Occurrence', SUM(fraction_diet), null) as 'Occurrence', IF(diet_type = 'Wt_or_Vol', SUM(fraction_diet), null) as 'Wt_or_Vol', if(diet_type = 'Unspecified', SUM(fraction_diet), null) as 'Unspecified'")
                .from("avian_diet", "diet")
                .where("(common_name = :name OR scientific_name = :name) AND :level != '' AND :level IS NOT NULL"
                + (startYear ? " AND observation_year_begin >= :start" : "")
                + (endYear ? " AND observation_year_end <= :end" : "")
                + (season ? " AND observation_season = :season" : "")
                + (region ? " AND location_region = :region" : "")
                , { name: predatorName, level: preyLevel, start: startYear, end: endYear, season: season, region: region })
                .groupBy(preyLevel + ", source, observation_year_begin, observation_month_begin, observation_season, bird_sample_size, habitat_type, location_region, item_sample_size, diet_type")
        }, "diet")
        .where("diet." + preyLevel + " IS NOT NULL")
        .groupBy("diet." + preyLevel + ", diet.source, diet.observation_year_begin, diet.observation_month_begin, diet.observation_season, diet.bird_sample_size, diet.habitat_type, diet.location_region, diet.item_sample_size")
        .getRawMany();
    }
}