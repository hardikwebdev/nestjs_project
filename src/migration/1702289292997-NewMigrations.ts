import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1702289292997 implements MigrationInterface {
    name = 'NewMigrations1702289292997'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`general_configuration\` ADD \`header_footer_bg_color\` varchar(255) NOT NULL DEFAULT '#132E58'`);
        await queryRunner.query(`ALTER TABLE \`general_configuration\` ADD \`header_footer_font_color\` varchar(255) NOT NULL DEFAULT '#ffffff'`);
        await queryRunner.query(`ALTER TABLE \`home_block_configurations\` CHANGE \`block_type\` \`block_type\` enum ('block', 'chatblock', 'tipblock') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` CHANGE \`slider_type\` \`slider_type\` enum ('home', 'aboutus', 'blog', 'news', 'tipheader') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` CHANGE \`slider_type\` \`slider_type\` enum ('home', 'aboutus', 'blog', 'news') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`home_block_configurations\` CHANGE \`block_type\` \`block_type\` enum ('block', 'chatblock') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`general_configuration\` DROP COLUMN \`header_footer_font_color\``);
        await queryRunner.query(`ALTER TABLE \`general_configuration\` DROP COLUMN \`header_footer_bg_color\``);
    }

}
