import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1699271575703 implements MigrationInterface {
    name = 'NewMigrations1699271575703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`general_configuration\` ADD \`site_front_logo\` varchar(255) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`general_configuration\` DROP COLUMN \`site_front_logo\``);
    }

}
