import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1700221909981 implements MigrationInterface {
    name = 'NewMigrations1700221909981'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` CHANGE \`slider_type\` \`slider_type\` enum ('home', 'aboutus', 'blog', 'news') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` CHANGE \`slider_type\` \`slider_type\` enum ('home', 'aboutus', 'blogs', 'news') NOT NULL`);
    }

}
