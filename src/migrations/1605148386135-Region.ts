import {MigrationInterface, QueryRunner} from "typeorm";

export class Region1605148386135 implements MigrationInterface {
    name = 'Region1605148386135'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `region` CHANGE `region` `region_name` varchar(255) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `region` CHANGE `region_name` `region` varchar(255) NOT NULL");
    }

}
