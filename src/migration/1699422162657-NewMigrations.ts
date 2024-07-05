import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1699422162657 implements MigrationInterface {
    name = 'NewMigrations1699422162657'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blog_posts\` CHANGE \`publish_date\` \`publish_date\` timestamp NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blog_posts\` CHANGE \`publish_date\` \`publish_date\` timestamp NULL`);
    }

}
