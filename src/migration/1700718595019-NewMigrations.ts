import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1700718595019 implements MigrationInterface {
    name = 'NewMigrations1700718595019'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`general_configuration\` DROP COLUMN \`media_config\``);
        await queryRunner.query(`ALTER TABLE \`general_configuration\` ADD \`media_config\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`general_configuration\` DROP COLUMN \`media_config\``);
        await queryRunner.query(`ALTER TABLE \`general_configuration\` ADD \`media_config\` varchar(255) NULL`);
    }

}
