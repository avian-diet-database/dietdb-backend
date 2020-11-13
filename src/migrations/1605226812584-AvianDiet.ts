import {MigrationInterface, QueryRunner} from "typeorm";

export class AvianDiet1605226812584 implements MigrationInterface {
    name = 'AvianDiet1605226812584'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `avian_diet` (`unique_id` int NOT NULL AUTO_INCREMENT, `common_name` varchar(255) NOT NULL, `scientific_name` varchar(255) NULL, `subspecies` varchar(255) NULL, `family` varchar(255) NULL, `taxonomy` varchar(255) NULL, `longitude_dd` varchar(255) NULL, `latitude_dd` varchar(255) NULL, `altitude_min_m` varchar(255) NULL, `altitude_max_m` varchar(255) NULL, `altitude_mean_m` varchar(255) NULL, `location_region` varchar(255) NOT NULL, `location_specific` varchar(255) NULL, `habitat_type` varchar(255) NULL, `observation_month_begin` int NULL, `observation_month_end` int NULL, `observation_year_begin` int NULL, `observation_year_end` int NULL, `observation_season` varchar(255) NULL, `analysis_number` varchar(255) NULL, `prey_kingdom` varchar(255) NOT NULL, `prey_phylum` varchar(255) NULL, `prey_class` varchar(255) NULL, `prey_order` varchar(255) NULL, `prey_suborder` varchar(255) NULL, `prey_family` varchar(255) NULL, `prey_genus` varchar(255) NULL, `prey_scientific_name` varchar(255) NULL, `inclusive_prey_taxon` varchar(255) NULL, `prey_name_ITIS_ID` varchar(255) NULL, `prey_name_status` varchar(255) NULL, `prey_stage` varchar(255) NULL, `prey_part` varchar(255) NULL, `prey_common_name` varchar(255) NULL, `fraction_diet` varchar(255) NULL, `diet_type` varchar(255) NOT NULL, `item_sample_size` int NULL, `bird_sample_size` int NULL, `sites` varchar(255) NULL, `study_type` varchar(255) NULL, `notes` varchar(500) NULL, `entered_by` varchar(255) NULL, `source` varchar(500) NOT NULL, PRIMARY KEY (`unique_id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `regions` (`region_name` varchar(255) NOT NULL, PRIMARY KEY (`region_name`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `table_history` (`table_name` varchar(255) NOT NULL, `last_updated` varchar(255) NOT NULL, PRIMARY KEY (`table_name`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `table_history`");
        await queryRunner.query("DROP TABLE `regions`");
        await queryRunner.query("DROP TABLE `avian_diet`");
    }

}
