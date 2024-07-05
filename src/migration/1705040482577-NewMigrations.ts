import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1705040482577 implements MigrationInterface {
    name = 'NewMigrations1705040482577'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` ADD \`customer_profile_id\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` ADD \`customer_profile_payment_id\` bigint NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` DROP COLUMN \`customer_profile_payment_id\``);
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` DROP COLUMN \`customer_profile_id\``);
    }

}
