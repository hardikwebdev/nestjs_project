import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1700476712917 implements MigrationInterface {
    name = 'NewMigrations1700476712917'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` CHANGE \`media\` \`media\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sliders_configurations\` CHANGE \`media\` \`media\` text NOT NULL`);
    }

}
