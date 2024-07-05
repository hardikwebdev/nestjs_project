import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1700718509638 implements MigrationInterface {
    name = 'NewMigrations1700718509638'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`general_configuration\` ADD \`media_config\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`general_configuration\` DROP COLUMN \`media_config\``);
    }

}
