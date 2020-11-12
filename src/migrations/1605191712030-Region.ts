import {MigrationInterface, QueryRunner} from "typeorm";

export class Region1605191712030 implements MigrationInterface {
    name = 'Region1605191712030'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `region` (`region_name` varchar(255) NOT NULL, PRIMARY KEY (`region_name`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `region`");
    }

}
