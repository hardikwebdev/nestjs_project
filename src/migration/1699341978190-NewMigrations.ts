import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1699341978190 implements MigrationInterface {
    name = 'NewMigrations1699341978190'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`about_us\` CHANGE \`sub_text\` \`sub_text\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`home_block_configurations\` CHANGE \`sub_text\` \`sub_text\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` CHANGE \`sub_text\` \`sub_text\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` CHANGE \`sub_text\` \`sub_text\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`home_block_configurations\` CHANGE \`sub_text\` \`sub_text\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`about_us\` CHANGE \`sub_text\` \`sub_text\` text NOT NULL`);
    }

}
