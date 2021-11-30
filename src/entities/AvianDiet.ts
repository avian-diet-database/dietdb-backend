import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class AvianDiet extends BaseEntity {
    @PrimaryGeneratedColumn()
    unique_id: number;

    @Column()
    common_name: string;

    @Column({ nullable: true })
    scientific_name: string;

    @Column({ nullable: true })
    subspecies: string;

    @Column({ nullable: true })
    family: string;

    @Column({ nullable: true })
    taxonomy: string;

    @Column({ nullable: true })
    longitude_dd: string;

    @Column({ nullable: true })
    latitude_dd: string;

    @Column({ nullable: true })
    altitude_min_m: string;

    @Column({ nullable: true })
    altitude_max_m: string;

    @Column({ nullable: true })
    altitude_mean_m: string;

    @Column()
    location_region: string;

    @Column({ nullable: true })
    location_specific: string;

    @Column({ nullable: true })
    habitat_type: string;

    @Column({ nullable: true })
    observation_month_begin: number;

    @Column({ nullable: true })
    observation_month_end: number;

    @Column({ nullable: true })
    observation_year_begin: number;

    @Column({ nullable: true })
    observation_year_end: number;

    @Column({ nullable: true })
    observation_season: string;

    @Column({ nullable: true })
    analysis_number: string;

    @Column()
    prey_kingdom: string;

    @Column({ nullable: true })
    prey_phylum: string;

    @Column({ nullable: true })
    prey_class: string;

    @Column({ nullable: true })
    prey_order: string;

    @Column({ nullable: true })
    prey_suborder: string;

    @Column({ nullable: true })
    prey_family: string;

    @Column({ nullable: true })
    prey_genus: string;

    @Column({ nullable: true })
    prey_scientific_name: string;

    @Column({ nullable: true })
    inclusive_prey_taxon: string;

    @Column({ nullable: true })
    prey_name_ITIS_ID: string;

    @Column({ nullable: true })
    prey_name_status: string;

    @Column({ nullable: true })
    prey_stage: string;

    @Column({ nullable: true })
    prey_part: string;

    @Column({ nullable: true })
    prey_common_name: string;

    @Column({ nullable: true })
    fraction_diet: string;

    @Column()
    diet_type: string;

    @Column({ nullable: true })
    item_sample_size: number;

    @Column({ nullable: true })
    bird_sample_size: number;

    @Column({ nullable: true })
    sites: string;

    @Column({ nullable: true })
    study_type: string;

    @Column({ length: 500, nullable: true })
    notes: string;

    @Column({ nullable: true })
    entered_by: string;

    @Column({ length: 500 })
    source: string;

    //Spring 2021 additional columns
    @Column({ nullable: true })
    doi: string;

    @Column({ nullable: true })
    sex: string;

    @Column({ nullable: true })
    age_class: string;

    @Column({ nullable: true })
    within_study_data_source: string;

    @Column({ nullable: true })
    table_fig_number: string;

    @Column({ nullable: true })
    title: string;

    @Column({ nullable: true })
    lastname_author: string;

    @Column({ nullable: true })
    source_year: number;

    @Column({ nullable: true })
    journal: string;

}