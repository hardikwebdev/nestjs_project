import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1704968990278 implements MigrationInterface {
    name = 'NewMigrations1704968990278'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` ADD \`subscription_id\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` DROP COLUMN \`subscription_details\``);
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` ADD \`subscription_details\` json NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` DROP COLUMN \`subscription_details\``);
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` ADD \`subscription_details\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` DROP COLUMN \`subscription_id\``);
    }

}
