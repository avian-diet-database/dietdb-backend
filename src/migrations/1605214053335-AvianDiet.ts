import {MigrationInterface, QueryRunner} from "typeorm";

export class AvianDiet1605214053335 implements MigrationInterface {
    name = 'AvianDiet1605214053335'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `table_history` DROP PRIMARY KEY");
        await queryRunner.query("ALTER TABLE `table_history` DROP COLUMN `table_name`");
        await queryRunner.query("ALTER TABLE `table_history` ADD `table_name` varchar(255) NOT NULL PRIMARY KEY");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `table_history` DROP COLUMN `table_name`");
        await queryRunner.query("ALTER TABLE `table_history` ADD `table_name` int NOT NULL");
        await queryRunner.query("ALTER TABLE `table_history` ADD PRIMARY KEY (`table_name`)");
    }

}
