import { Field, Int, ObjectType } from "type-graphql";
import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@ObjectType()
@Entity()
export class AvianDiet extends BaseEntity {
    @Field()
    @PrimaryGeneratedColumn()
    unique_id: number;

    @Field()
    @Column()
    common_name: string;

    @Field()
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

    @Field()
    @Column()
    location_region: string;

    @Column({ nullable: true })
    location_specific: string;

    @Column({ nullable: true })
    habitat_type: string;

    @Field()
    @Column({ nullable: true })
    observation_month_begin: number;

    @Field()
    @Column({ nullable: true })
    observation_month_end: number;

    @Field(() => Int)
    @Column({ nullable: true })
    observation_year_begin: number;

    @Field(() => Int)
    @Column({ nullable: true })
    observation_year_end: number;

    @Field()
    @Column({ nullable: true })
    observation_season: string;

    @Column({ nullable: true })
    analysis_number: string;

    @Field()
    @Column()
    prey_kingdom: string;

    @Field()
    @Column({ nullable: true })
    prey_phylum: string;

    @Field()
    @Column({ nullable: true })
    prey_class: string;

    @Field()
    @Column({ nullable: true })
    prey_order: string;

    @Field()
    @Column({ nullable: true })
    prey_suborder: string;

    @Field()
    @Column({ nullable: true })
    prey_family: string;

    @Field()
    @Column({ nullable: true })
    prey_genus: string;

    @Field()
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

    @Field()
    @Column({ nullable: true })
    fraction_diet: string;

    @Field()
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

    @Column({ length: 400, nullable: true })
    notes: string;

    @Column({ nullable: true })
    entered_by: string;

    @Field()
    @Column()
    source: string;
}