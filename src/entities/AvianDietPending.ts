import { Field, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class AvianDietPending extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    unique_id: number;

    @Field()
    @Column()
    common_name: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    scientific_name: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    subspecies: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    family: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    taxonomy: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    longitude_dd: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    latitude_dd: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    altitude_min_m: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    altitude_max_m: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    altitude_mean_m: string;

    @Field()
    @Column()
    location_region: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    location_specific: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    habitat_type: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    observation_month_begin: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    observation_month_end: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    observation_year_begin: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    observation_year_end: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    observation_season: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    analysis_number: string;

    @Field()
    @Column()
    prey_kingdom: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    prey_phylum: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    prey_class: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    prey_order: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    prey_suborder: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    prey_family: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    prey_genus: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    prey_scientific_name: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    inclusive_prey_taxon: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    prey_name_ITIS_ID: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    prey_name_status: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    prey_stage: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    prey_part: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    prey_common_name: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    fraction_diet: string;

    @Field()
    @Column()
    diet_type: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    item_sample_size: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    bird_sample_size: number;

    @Field({ nullable: true })
    @Column({ nullable: true })
    sites: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    study_type: string;

    @Field({ nullable: true })
    @Column({ length: 500, nullable: true })
    notes: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    entered_by: string;

    @Field()
    @Column({ length: 500 })
    source: string;

    //Spring 2021 additional columns
    @Field({ nullable: true })
    @Column({ nullable: true })
    doi: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    species: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    new_species: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    country: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    state_province: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    location_other: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    lat_long_yn: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    elevation_yn: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    sex_yn: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    sex: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    age_class: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    study_location: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    table_fig_number: string;

    @Field({ nullable: true })
    @Column({ nullable: true })
    all_prey_diet_yn: string;

}