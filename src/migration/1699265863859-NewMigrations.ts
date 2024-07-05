import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1699265863859 implements MigrationInterface {
    name = 'NewMigrations1699265863859'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blog_posts\` DROP COLUMN \`short_description\``);
        await queryRunner.query(`ALTER TABLE \`blog_posts\` ADD \`short_description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`about_us\` DROP COLUMN \`sub_text\``);
        await queryRunner.query(`ALTER TABLE \`about_us\` ADD \`sub_text\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`home_block_configurations\` DROP COLUMN \`sub_text\``);
        await queryRunner.query(`ALTER TABLE \`home_block_configurations\` ADD \`sub_text\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` DROP COLUMN \`sub_text\``);
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` ADD \`sub_text\` text NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` DROP COLUMN \`sub_text\``);
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` ADD \`sub_text\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`home_block_configurations\` DROP COLUMN \`sub_text\``);
        await queryRunner.query(`ALTER TABLE \`home_block_configurations\` ADD \`sub_text\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`about_us\` DROP COLUMN \`sub_text\``);
        await queryRunner.query(`ALTER TABLE \`about_us\` ADD \`sub_text\` varchar(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`blog_posts\` DROP COLUMN \`short_description\``);
        await queryRunner.query(`ALTER TABLE \`blog_posts\` ADD \`short_description\` varchar(255) NULL`);
    }

}
