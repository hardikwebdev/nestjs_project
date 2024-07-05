import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1705571077126 implements MigrationInterface {
    name = 'NewMigrations1705571077126'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`transaction_history\` DROP COLUMN \`invoice_id\``);
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` DROP COLUMN \`subscription_details\``);
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` DROP COLUMN \`subscription_id\``);
        await queryRunner.query(`ALTER TABLE \`transaction_history\` ADD \`transaction_id\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`transaction_history\` ADD \`transaction_details\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` ADD \`transaction_id\` bigint NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` DROP COLUMN \`transaction_id\``);
        await queryRunner.query(`ALTER TABLE \`transaction_history\` DROP COLUMN \`transaction_details\``);
        await queryRunner.query(`ALTER TABLE \`transaction_history\` DROP COLUMN \`transaction_id\``);
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` ADD \`subscription_id\` bigint NULL`);
        await queryRunner.query(`ALTER TABLE \`subscribed_users\` ADD \`subscription_details\` json NULL`);
        await queryRunner.query(`ALTER TABLE \`transaction_history\` ADD \`invoice_id\` varchar(255) NOT NULL`);
    }

}
