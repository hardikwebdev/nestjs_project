import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1705560463172 implements MigrationInterface {
    name = 'NewMigrations1705560463172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`subscriptions_plans\` DROP COLUMN \`price_id\``);
        await queryRunner.query(`ALTER TABLE \`subscriptions_plans\` DROP COLUMN \`product_id\``);
        await queryRunner.query(`ALTER TABLE \`subscriptions_plans\` ADD \`description\` varchar(255) NOT NULL DEFAULT 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Maxime, temporibus.'`);
        await queryRunner.query(`ALTER TABLE \`subscriptions_plans\` ADD \`sub_description\` longtext NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`subscriptions_plans\` DROP COLUMN \`sub_description\``);
        await queryRunner.query(`ALTER TABLE \`subscriptions_plans\` DROP COLUMN \`description\``);
        await queryRunner.query(`ALTER TABLE \`subscriptions_plans\` ADD \`product_id\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`subscriptions_plans\` ADD \`price_id\` varchar(255) NULL`);
    }

}
