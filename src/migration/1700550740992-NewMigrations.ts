import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1700550740992 implements MigrationInterface {
    name = 'NewMigrations1700550740992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`home_block_configurations\` ADD \`block_type\` enum ('block', 'chatblock') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`home_block_configurations\` DROP COLUMN \`block_type\``);
    }

}
