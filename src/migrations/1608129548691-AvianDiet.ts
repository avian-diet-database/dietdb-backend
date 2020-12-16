import {MigrationInterface, QueryRunner} from "typeorm";

export class AvianDiet1608129548691 implements MigrationInterface {
    name = 'AvianDiet1608129548691'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `common_names` (`taxon` varchar(100) NOT NULL, `taxonomic_rank` varchar(100) NOT NULL, `prey_kingdom` varchar(100) NOT NULL, `prey_stage` varchar(50) NOT NULL, `common_name` varchar(255) NOT NULL, PRIMARY KEY (`taxon`, `taxonomic_rank`, `prey_kingdom`, `prey_stage`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `common_names`");
    }

}
