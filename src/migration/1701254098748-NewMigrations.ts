import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1701254098748 implements MigrationInterface {
    name = 'NewMigrations1701254098748'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`about_us\` ADD \`card_width\` enum ('full', 'half') NOT NULL DEFAULT 'full'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`about_us\` DROP COLUMN \`card_width\``);
    }

}
