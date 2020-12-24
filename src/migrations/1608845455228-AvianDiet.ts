import {MigrationInterface, QueryRunner} from "typeorm";

export class AvianDiet1608845455228 implements MigrationInterface {
    name = 'AvianDiet1608845455228'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `prey_names` (`name` varchar(255) NOT NULL, `is_common_name` tinyint NOT NULL, PRIMARY KEY (`name`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `prey_names`");
    }

}
