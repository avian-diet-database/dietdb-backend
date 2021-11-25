import { AvianDietPending } from "../entities/AvianDietPending";
import { AvianDietApproved } from "../entities/AvianDietApproved";
import { AvianDietApprovalHistory } from "../entities/AvianDietApprovalHistory";
import { Field, Query, Resolver, Mutation, Arg, ArgsType, Args, Int } from "type-graphql";
import { TaxonomySubset } from "../entities/TaxonomySubset";
import {Md5} from "ts-md5";


//non-nullable fields in db: common_name, location_region, prey_kingdom, diet_type, source, (auto-generated in DB) unique_id ****As of 11/14 we make scientific_name non nullable in query and common_name nullable
//notes and source have length 500
//int field types: observation_month_begin, observation_month_end, observation_year_begin, observation_year_end, item_sample_size, bird_sample_size, year, (auto-generated in DB) unique_id
@ArgsType()
class PendingDietArguments {
    @Field({ nullable: true })
    common_name: string;

    @Field()
    scientific_name: string;

    @Field({ nullable: true })
    subspecies: string;

    @Field({ nullable: true })
    family: string;

    @Field({ nullable: true })
    taxonomy: string;

    @Field({ nullable: true })
    longitude_dd: string;

    @Field({ nullable: true })
    latitude_dd: string;

    @Field({ nullable: true })
    altitude_min_m: string;

    @Field({ nullable: true })
    altitude_max_m: string;

    @Field({ nullable: true })
    altitude_mean_m: string;

    @Field()
    location_region: string;

    @Field({ nullable: true })
    location_specific: string;

    @Field({ nullable: true })
    habitat_type: string;

    @Field({ nullable: true })
    observation_month_begin: number;

    @Field({ nullable: true })
    observation_month_end: number;

    @Field({ nullable: true })
    observation_year_begin: number;

    @Field({ nullable: true })
    observation_year_end: number;

    @Field({ nullable: true })
    observation_season: string;

    @Field({ nullable: true })
    analysis_number: string;

    @Field()
    prey_kingdom: string;

    @Field({ nullable: true })
    prey_phylum: string;

    @Field({ nullable: true })
    prey_class: string;

    @Field({ nullable: true })
    prey_order: string;

    @Field({ nullable: true })
    prey_suborder: string;

    @Field({ nullable: true })
    prey_family: string;

    @Field({ nullable: true })
    prey_genus: string;

    @Field({ nullable: true })
    prey_scientific_name: string;

    @Field({ nullable: true })
    inclusive_prey_taxon: string;

    @Field({ nullable: true })
    prey_name_ITIS_ID: string;

    @Field({ nullable: true })
    prey_name_status: string;

    @Field({ nullable: true })
    prey_stage: string;

    @Field({ nullable: true })
    prey_part: string;

    @Field({ nullable: true })
    prey_common_name: string;

    @Field({ nullable: true })
    fraction_diet: string;

    @Field()
    diet_type: string;

    @Field({ nullable: true })
    item_sample_size: number;

    @Field({ nullable: true })
    bird_sample_size: number;

    @Field({ nullable: true })
    sites: string;

    @Field({ nullable: true })
    study_type: string;

    @Field({ nullable: true })
    notes: string;

    @Field({ nullable: true })
    entered_by: string;

    @Field()
    source: string;

    //Spring 2021 additional columns
    @Field({ nullable: true })
    doi: string;

    @Field({ nullable: true })
    sex: string;

    @Field({ nullable: true })
    age_class: string;

    @Field({ nullable: true })
    within_study_data_source: string;

    @Field({ nullable: true })
    table_fig_number: string;

    @Field({ nullable: true })
    title: string;

    @Field({ nullable: true })
    lastname_author: string;

    @Field({ nullable: true })
    year: number;

    @Field({ nullable: true })
    journal: string;
}


@Resolver()
export class PendingPageResolver {

    async createAnalysisHash(inputs: PendingDietArguments ) {

        // group_by(Source, Common_Name, Subspecies, Observation_Year_Begin, Observation_Month_Begin, Observation_Year_End,
        //     Observation_Month_End, Observation_Season, Analysis_Number (not going to include), Bird_Sample_Size, Habitat_type, Location_Region,
        //     Location_Specific, Item_Sample_Size, Diet_Type, Study_Type, Sites)

        let string_observation_year_begin = (inputs.observation_year_begin || 0).toString();
        let string_observation_month_begin = (inputs.observation_month_begin || 0).toString();
        let string_observation_year_end = (inputs.observation_year_end || 0).toString();
        let string_observation_month_end = (inputs.observation_month_end || 0).toString();
        let string_bird_sample_size = (inputs.bird_sample_size || 0).toString();
        let string_item_sample_size = (inputs.item_sample_size || 0).toString();

        inputs.analysis_number = Md5.hashStr(inputs.source.concat(inputs.common_name,inputs.subspecies,string_observation_year_begin,
            string_observation_month_begin,string_observation_year_end,string_observation_month_end,inputs.observation_season,
            string_bird_sample_size,inputs.habitat_type,inputs.location_region,inputs.location_specific,string_item_sample_size,
            inputs.diet_type,inputs.study_type,inputs.sites).toLowerCase())

        return inputs.analysis_number
    }

    @Query(() => [AvianDietPending])
    async getPendingDiet() {
        return AvianDietPending.find();
    }

    //could throw this query into a new resolver file
    @Query(() => [AvianDietApprovalHistory])
    async getApprovalHistory() {
        return AvianDietApprovalHistory.find();
    }

    @Mutation(() => Boolean)
    async createPendingDiet(@Args() inputs: PendingDietArguments, @Arg("new_species", () => Boolean) new_species: boolean) {

        inputs.analysis_number = await this.createAnalysisHash(inputs)

        if (new_species) {
            await AvianDietPending.insert(inputs)
            return true
        }
        else {
            const match_db = await TaxonomySubset.findOneOrFail({ select: ["primary_com_name", "family"], where: { sci_name: inputs.scientific_name } });
            inputs.common_name = match_db.primary_com_name;
            inputs.family = match_db.family;
            await AvianDietPending.insert(inputs)
            return true
        }
    }

    @Mutation(() => Boolean)
    async approvePendingDiet(@Args() inputs: PendingDietArguments, @Arg("unique_id", () => Int) unique_id: number, @Arg("approved", () => Boolean) approved: boolean) {
        await AvianDietApproved.insert({...inputs,unique_id})
        await AvianDietApprovalHistory.insert({...inputs,unique_id,approved})
        await AvianDietPending.delete(unique_id)
        return true
    }

    @Mutation(() => Boolean)
    async denyPendingDiet(@Args() inputs: PendingDietArguments, @Arg("unique_id", () => Int) unique_id: number, @Arg("approved", () => Boolean) approved: boolean) {
        await AvianDietApprovalHistory.insert({...inputs,unique_id,approved})
        await AvianDietPending.delete(unique_id)
        return true
    }










    //we are using this function because it works with frontend but eww
    //non-nullable fields in db, once query is working for sure, we will prob make scientific_name non nullable in query : common_name, location_region, prey_kingdom, diet_type, source, (auto-generated in DB) unique_id ****As of 11/14 we make scientific_name non nullable in query and common_name nullable
    @Mutation(() => Boolean)
    async createAlternativePendingDietFull(

        @Arg("common_name", () => String, { nullable: true }) common_name: string,
        @Arg("scientific_name", () => String) scientific_name: string,
        @Arg("subspecies", () => String, { nullable: true }) subspecies: string,
        @Arg("family", () => String, { nullable: true }) family: string,
        @Arg("taxonomy", () => String, { nullable: true }) taxonomy: string,
        @Arg("longitude_dd", () => String, { nullable: true }) longitude_dd: string,
        @Arg("latitude_dd", () => String, { nullable: true }) latitude_dd: string,
        @Arg("altitude_min_m", () => String, { nullable: true }) altitude_min_m: string,
        @Arg("altitude_max_m", () => String, { nullable: true }) altitude_max_m: string,
        @Arg("altitude_mean_m", () => String, { nullable: true }) altitude_mean_m: string,
        @Arg("location_region", () => String) location_region: string,
        @Arg("location_specific", () => String, { nullable: true }) location_specific: string,
        @Arg("habitat_type", () => String, { nullable: true }) habitat_type: string,
        @Arg("observation_month_begin", () => Int, { nullable: true }) observation_month_begin: number,
        @Arg("observation_month_end", () => Int, { nullable: true }) observation_month_end: number,
        @Arg("observation_year_begin", () => Int, { nullable: true }) observation_year_begin: number,
        @Arg("observation_year_end", () => Int, { nullable: true }) observation_year_end: number,
        @Arg("observation_season", () => String, { nullable: true }) observation_season: string,
        @Arg("analysis_number", () => String, { nullable: true }) analysis_number: string,
        @Arg("prey_kingdom", () => String) prey_kingdom: string,
        @Arg("prey_phylum", () => String, { nullable: true }) prey_phylum: string,
        @Arg("prey_class", () => String, { nullable: true }) prey_class: string,
        @Arg("prey_order", () => String, { nullable: true }) prey_order: string,
        @Arg("prey_suborder", () => String, { nullable: true }) prey_suborder: string,
        @Arg("prey_family", () => String, { nullable: true }) prey_family: string,
        @Arg("prey_genus", () => String, { nullable: true }) prey_genus: string,
        @Arg("prey_scientific_name", () => String, { nullable: true }) prey_scientific_name: string,
        @Arg("inclusive_prey_taxon", () => String, { nullable: true }) inclusive_prey_taxon: string,
        @Arg("prey_name_ITIS_ID", () => String, { nullable: true }) prey_name_ITIS_ID: string,
        @Arg("prey_name_status", () => String, { nullable: true }) prey_name_status: string,
        @Arg("prey_stage", () => String, { nullable: true }) prey_stage: string,
        @Arg("prey_part", () => String, { nullable: true }) prey_part: string,
        @Arg("prey_common_name", () => String, { nullable: true }) prey_common_name: string,
        @Arg("fraction_diet", () => String, { nullable: true }) fraction_diet: string,
        @Arg("diet_type", () => String) diet_type: string,
        @Arg("item_sample_size", () => Int, { nullable: true }) item_sample_size: number,
        @Arg("bird_sample_size", () => Int, { nullable: true }) bird_sample_size: number,
        @Arg("sites", () => String, { nullable: true }) sites: string,
        @Arg("study_type", () => String, { nullable: true }) study_type: string,
        @Arg("notes", () => String, { nullable: true }) notes: string,
        @Arg("entered_by", () => String, { nullable: true }) entered_by: string,
        @Arg("source", () => String) source: string,
        @Arg("doi", () => String, { nullable: true }) doi: string,
        @Arg("sex", () => String, { nullable: true }) sex: string,
        @Arg("age_class", () => String, { nullable: true }) age_class: string,
        @Arg("study_location", () => String, { nullable: true }) within_study_data_source: string,
        @Arg("table_fig_number", () => String, { nullable: true }) table_fig_number: string,
        @Arg("title", () => String, { nullable: true }) title: string,
        @Arg("lastname_author", () => String, { nullable: true }) lastname_author: string,
        @Arg("year", () => Int, { nullable: true }) year: number,
        @Arg("journalr", () => String, { nullable: true }) journal: string,
        @Arg("new_species", () => Boolean,) new_species: boolean
    ) {
        if (new_species) {

            await AvianDietPending.insert({
                common_name, scientific_name, subspecies, family, taxonomy, longitude_dd, latitude_dd, altitude_min_m, altitude_max_m, altitude_mean_m, location_region, location_specific, habitat_type,
                observation_month_begin, observation_month_end, observation_year_begin, observation_year_end, observation_season, analysis_number, prey_kingdom, prey_phylum, prey_class, prey_order, prey_suborder, prey_family, prey_genus,
                prey_scientific_name, inclusive_prey_taxon, prey_name_ITIS_ID, prey_name_status, prey_stage, prey_part, prey_common_name, fraction_diet, diet_type, item_sample_size, bird_sample_size, sites, study_type, notes, entered_by,
                source, doi, sex, age_class, within_study_data_source, table_fig_number, title, lastname_author, year, journal
            })
            return true;

        }
        else {
            const match_db = await TaxonomySubset.findOneOrFail({ select: ["primary_com_name", "family"], where: { sci_name: scientific_name } });
            common_name = match_db.primary_com_name;
            family = match_db.family;
            await AvianDietPending.insert({
                common_name, scientific_name, subspecies, family, taxonomy, longitude_dd, latitude_dd, altitude_min_m, altitude_max_m, altitude_mean_m, location_region, location_specific, habitat_type,
                observation_month_begin, observation_month_end, observation_year_begin, observation_year_end, observation_season, analysis_number, prey_kingdom, prey_phylum, prey_class, prey_order, prey_suborder, prey_family, prey_genus,
                prey_scientific_name, inclusive_prey_taxon, prey_name_ITIS_ID, prey_name_status, prey_stage, prey_part, prey_common_name, fraction_diet, diet_type, item_sample_size, bird_sample_size, sites, study_type, notes, entered_by,
                source, doi, sex, age_class, within_study_data_source, table_fig_number, title, lastname_author, year, journal
            })
            return true;

        }

    }



    //temporary before full implementation
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
        await AvianDietPending.insert({
            common_name, source, subspecies, taxonomy, location_region, location_specific,
            prey_kingdom, diet_type
        })
        return true;
    }


//Tried to use input diet but object structure did not match with frontend, could try to use destructure syntax but went with argtypes instead
// @InputType()
// class PendingDietInput {

// }

//Also shows useing create and save to return what you inputted after insertion
// @Mutation(() => AvianDietPending) 
// async createPendingDiet(@Args() inputs: PendingDietArguments) {
//        const pendingDiet = await AvianDietPending.create(inputs).save()
//        return pendingDiet;
// }

// //Upon failure an error array describing the issue will be returned.
// @Mutation(() => Boolean) 
// async createMainDiet(@Arg("input", () => PendingDietInput) input: PendingDietInput) {
//     await AvianDiet.insert(input);
//     return true;
// }

}

