import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1700478656348 implements MigrationInterface {
    name = 'NewMigrations1700478656348'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`about_us\` CHANGE \`media\` \`media\` text NULL`);
        await queryRunner.query(`ALTER TABLE \`testimonial\` CHANGE \`media\` \`media\` text NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`testimonial\` CHANGE \`media\` \`media\` text NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`about_us\` CHANGE \`media\` \`media\` text NOT NULL`);
    }

}
