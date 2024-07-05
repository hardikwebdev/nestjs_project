import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1699423666229 implements MigrationInterface {
    name = 'NewMigrations1699423666229'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blog_posts\` CHANGE \`publish_date\` \`publish_date\` timestamp NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blog_posts\` CHANGE \`publish_date\` \`publish_date\` timestamp NOT NULL`);
    }

}
