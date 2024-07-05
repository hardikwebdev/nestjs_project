import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1699362853479 implements MigrationInterface {
    name = 'NewMigrations1699362853479'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`about_us\` DROP COLUMN \`sub_text\``);
        await queryRunner.query(`ALTER TABLE \`about_us\` ADD \`sub_text\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`blog_posts\` DROP COLUMN \`long_description\``);
        await queryRunner.query(`ALTER TABLE \`blog_posts\` ADD \`long_description\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`chats\` DROP COLUMN \`message\``);
        await queryRunner.query(`ALTER TABLE \`chats\` ADD \`message\` longtext NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`home_block_configurations\` DROP COLUMN \`sub_text\``);
        await queryRunner.query(`ALTER TABLE \`home_block_configurations\` ADD \`sub_text\` longtext NULL`);
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` DROP COLUMN \`sub_text\``);
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` ADD \`sub_text\` longtext NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` DROP COLUMN \`sub_text\``);
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` ADD \`sub_text\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`home_block_configurations\` DROP COLUMN \`sub_text\``);
        await queryRunner.query(`ALTER TABLE \`home_block_configurations\` ADD \`sub_text\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`chats\` DROP COLUMN \`message\``);
        await queryRunner.query(`ALTER TABLE \`chats\` ADD \`message\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`blog_posts\` DROP COLUMN \`long_description\``);
        await queryRunner.query(`ALTER TABLE \`blog_posts\` ADD \`long_description\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`about_us\` DROP COLUMN \`sub_text\``);
        await queryRunner.query(`ALTER TABLE \`about_us\` ADD \`sub_text\` text NULL`);
    }

}
