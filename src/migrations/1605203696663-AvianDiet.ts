import {MigrationInterface, QueryRunner} from "typeorm";

export class AvianDiet1605203696663 implements MigrationInterface {
    name = 'AvianDiet1605203696663'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `avian_diet` DROP COLUMN `notes`");
        await queryRunner.query("ALTER TABLE `avian_diet` ADD `notes` varchar(500) NULL");
        await queryRunner.query("ALTER TABLE `avian_diet` DROP COLUMN `source`");
        await queryRunner.query("ALTER TABLE `avian_diet` ADD `source` varchar(500) NOT NULL");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `avian_diet` DROP COLUMN `source`");
        await queryRunner.query("ALTER TABLE `avian_diet` ADD `source` varchar(255) NOT NULL");
        await queryRunner.query("ALTER TABLE `avian_diet` DROP COLUMN `notes`");
        await queryRunner.query("ALTER TABLE `avian_diet` ADD `notes` varchar(400) NULL");
    }

}
