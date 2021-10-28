import { AvianDietPending } from "../entities/AvianDietPending";
import { AvianDiet } from "../entities/AvianDiet";
import {Field, Query, Resolver, InputType, Mutation,Arg, Int } from "type-graphql";

//need to figure out how to use either inputType or Argstype on frontend so we don't have to write out arguments every time
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

    //we will use this function once we figure things out
    @Mutation(() => AvianDietPending) 
    async createPendingDiet(@Arg("input", () => PendingDietInput) input: PendingDietInput) {
        const pendingDiet = await AvianDietPending.create(input).save();
        return pendingDiet;
    }

    //we are using this function because it works with frontend but eww
    @Mutation(() => Boolean)
    async createAlternativePendingDiet(
        //add common_name
        @Arg("common_name", () => String) common_name: string,

        //add scientific_name
        @Arg("scientific_name", () => String) scientific_name: string,

        @Arg("subspecies", () => String) subspecies: string,

        //add family
        @Arg("family", () => String) family: string,

        @Arg("taxonomy", () => String) taxonomy: string,
        @Arg("longitude_dd", () => String) longitude_dd: string,
        @Arg("latitude_dd", () => String) latitude_dd: string,
        @Arg("altitude_min_m", () => String) altitude_min_m: string,
        @Arg("altitude_max_m", () => String) altitude_max_m: string,
        @Arg("altitude_mean_m", () => String) altitude_mean_m: string,
        @Arg("location_region", () => String) location_region: string,
        @Arg("location_specific", () => String) location_specific: string,
        @Arg("habitat_type", () => String) habitat_type: string,
        @Arg("observation_month_begin", () => Int) observation_month_begin: number,
        @Arg("observation_month_end", () => Int) observation_month_end: number,
        @Arg("observation_year_begin", () => Int) observation_year_begin: number,
        @Arg("observation_year_end", () => Int) observation_year_end: number,

        //add observation_season
        @Arg("observation_season", () => String) observation_season: string,

        @Arg("analysis_number", () => String) analysis_number: string,

        //add this section prey_kingdom through prey_scientific_name
        @Arg("prey_kingdom", () => String) prey_kingdom: string,
        @Arg("prey_phylum", () => String) prey_phylum: string,
        @Arg("prey_class", () => String) prey_class: string,
        @Arg("prey_order", () => String) prey_order: string,
        @Arg("prey_suborder", () => String) prey_suborder: string,
        @Arg("prey_family", () => String) prey_family: string,
        @Arg("prey_genus", () => String) prey_genus: string,
        @Arg("prey_scientific_name", () => String) prey_scientific_name: string,

        @Arg("inclusive_prey_taxon", () => String) inclusive_prey_taxon: string,

        //add this section prey_name_ITIS_ID through prey_part
        @Arg("prey_name_ITIS_ID", () => String) prey_name_ITIS_ID: string,
        @Arg("prey_name_status", () => String) prey_name_status: string,
        @Arg("prey_stage", () => String) prey_stage: string,
        @Arg("prey_part", () => String) prey_part: string,

        @Arg("prey_common_name", () => String) prey_common_name: string,
        @Arg("fraction_diet", () => String) fraction_diet: string,
        //add diet_type
        @Arg("diet_type", () => String) diet_type: string,
        @Arg("item_sample_size", () => Int) item_sample_size: number,
        @Arg("bird_sample_size", () => Int) bird_sample_size: number,
        @Arg("sites", () => String) sites: string,
        @Arg("study_type", () => String) study_type: string,
        @Arg("notes", () => String) notes: string,
        //add entered_by
        @Arg("entered_by", () => String) entered_by: string,
        @Arg("source", () => String) source: string,
        @Arg("doi", () => String) doi: string,
        @Arg("species", () => String) species: string,
        @Arg("new_species", () => String) new_species: string,
        @Arg("country", () => String) country: string,
        @Arg("state_province", () => String) state_province: string,
        @Arg("location_other", () => String) location_other: string,
        @Arg("lat_long_yn", () => String) lat_long_yn: string,
        @Arg("elevation_yn", () => String) elevation_yn: string,
        @Arg("sex_yn", () => String) sex_yn: string,
        @Arg("sex", () => String) sex: string,
        @Arg("age_class", () => String) age_class: string,
        @Arg("study_location", () => String) study_location: string,
        @Arg("table_fig_number", () => String) table_fig_number: string,
        @Arg("all_prey_diet_yn", () => String) all_prey_diet_yn: string,
        ) {
            await AvianDietPending.insert({common_name,scientific_name,subspecies,family,taxonomy,longitude_dd,latitude_dd,altitude_min_m,altitude_max_m,altitude_mean_m,location_region,location_specific,habitat_type,
                observation_month_begin,observation_month_end,observation_year_begin,observation_year_end,observation_season,analysis_number,prey_kingdom,prey_phylum,prey_class,prey_order,prey_suborder,prey_family,prey_genus,
                prey_scientific_name,inclusive_prey_taxon,prey_name_ITIS_ID,prey_name_status,prey_stage,prey_part,prey_common_name,fraction_diet,diet_type,item_sample_size,bird_sample_size,sites,study_type,notes,entered_by,
                source,doi,species,new_species,country,state_province,location_other,lat_long_yn,elevation_yn,sex_yn,sex,age_class,study_location,table_fig_number,all_prey_diet_yn})
            return true;
        }

    //Upon failure an error array describing the issue will be returned.
    @Mutation(() => Boolean) 
    async createMainDiet(@Arg("input", () => PendingDietInput) input: PendingDietInput) {
        await AvianDiet.insert(input);
        return true;
    }

}

