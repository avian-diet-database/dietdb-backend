import { AvianDietPending } from "../entities/AvianDietPending";
import { Field, Query, Resolver, Mutation, Arg, ArgsType, Args, Int, Float } from "type-graphql";
import { TaxonomySubset } from "../entities/TaxonomySubset";
import { Md5 } from "ts-md5";
import { PreyNames } from "../entities/PreyNames";

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

    @Field(() => Int, { nullable: true })
    observation_month_begin: number;

    @Field(() => Int, { nullable: true })
    observation_month_end: number;

    @Field(() => Int, { nullable: true })
    observation_year_begin: number;

    @Field(() => Int, { nullable: true })
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

    @Field(() => Int, { nullable: true })
    item_sample_size: number;

    @Field(() => Int, { nullable: true })
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

    @Field(() => Int, { nullable: true })
    source_year: number;

    @Field({ nullable: true })
    journal: string;

    @Field(() => Float, { nullable: true })
    total_percent_diet: number;
}


@Resolver()
export class PendingPageResolver {

    async createAnalysisHash(inputs: PendingDietArguments) {

        // group_by(Source, Common_Name, Subspecies, Observation_Year_Begin, Observation_Month_Begin, Observation_Year_End,
        //     Observation_Month_End, Observation_Season, Analysis_Number (not going to include), Bird_Sample_Size, Habitat_type, Location_Region,
        //     Location_Specific, Item_Sample_Size, Diet_Type, Study_Type, Sites)

        let string_observation_year_begin = (inputs.observation_year_begin || 0).toString();
        let string_observation_month_begin = (inputs.observation_month_begin || 0).toString();
        let string_observation_year_end = (inputs.observation_year_end || 0).toString();
        let string_observation_month_end = (inputs.observation_month_end || 0).toString();
        let string_bird_sample_size = (inputs.bird_sample_size || 0).toString();
        let string_item_sample_size = (inputs.item_sample_size || 0).toString();

        inputs.analysis_number = Md5.hashStr(inputs.source.concat(inputs.common_name, inputs.subspecies, string_observation_year_begin,
            string_observation_month_begin, string_observation_year_end, string_observation_month_end, inputs.observation_season,
            string_bird_sample_size, inputs.habitat_type, inputs.location_region, inputs.location_specific, string_item_sample_size,
            inputs.diet_type, inputs.study_type, inputs.sites).toLowerCase())

        return inputs.analysis_number
    }


    @Query(() => [AvianDietPending])
    async getPendingDiet() {
        return AvianDietPending.find({ where: { state: "pending" } });
    }

    @Query(() => [AvianDietPending])
    async getApprovalHistory() {
        return AvianDietPending.find({
            where: [
                { state: "approved"},
                { state: "denied"},
                { state: "approved/processed"}
            ]
        });
    }

    @Query(() => [TaxonomySubset])
    async getScientificNames() {
        return TaxonomySubset.find({
            select: ['sci_name']
        })
            
    }

    @Query(() => [PreyNames])
    async getPreyNames() {
        return PreyNames.find({
            select: ['name']
        })
    }
    //one-table structure
    @Mutation(() => Boolean)
    async createPendingDiet(@Args() inputs: PendingDietArguments, @Arg("new_species", () => Boolean) new_species: boolean) {

        inputs.analysis_number = await this.createAnalysisHash(inputs)
        const state = { "state": "pending" }

        if (new_species) {
            await AvianDietPending.insert({ ...inputs, ...state })
            return true
        }
        else {
            const match_db = await TaxonomySubset.findOneOrFail({ select: ["primary_com_name", "family"], where: { sci_name: inputs.scientific_name } });
            inputs.common_name = match_db.primary_com_name;
            inputs.family = match_db.family;
            await AvianDietPending.insert({ ...inputs, ...state })
            return true
        }
    }

    @Mutation(() => Boolean)
    async approvePendingDiet(@Args() inputs: PendingDietArguments, @Arg("unique_id", () => Int) unique_id: number) {
        const state = { "state": "approved" }
        await AvianDietPending.update({ unique_id }, { ...inputs, ...state})
        return true
    }

    @Mutation(() => Boolean)
    async denyPendingDiet(@Args() inputs: PendingDietArguments, @Arg("unique_id", () => Int) unique_id: number) {
        const state = { "state": "denied" }
        await AvianDietPending.update({ unique_id }, { ...inputs, ...state})
        return true
    }


}


