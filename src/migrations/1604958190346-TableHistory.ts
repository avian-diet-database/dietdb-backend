import {MigrationInterface, QueryRunner} from "typeorm";

export class TableHistory1604958190346 implements MigrationInterface {
    name = 'TableHistory1604958190346'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `table_history` (`table_name` int NOT NULL, `last_updated` varchar(255) NOT NULL, PRIMARY KEY (`table_name`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("DROP TABLE `table_history`");
    }

}
