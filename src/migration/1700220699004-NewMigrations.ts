import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1700220699004 implements MigrationInterface {
    name = 'NewMigrations1700220699004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` CHANGE \`slider_type\` \`slider_type\` enum ('home', 'aboutus', 'blogs', 'news') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` CHANGE \`slider_type\` \`slider_type\` enum ('home', 'aboutus') NOT NULL`);
    }

}
