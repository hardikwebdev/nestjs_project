import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1699428877689 implements MigrationInterface {
    name = 'NewMigrations1699428877689'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blogs_comments\` ADD CONSTRAINT \`FK_7453d3d62bab62e98dbd932a04a\` FOREIGN KEY (\`blog_id\`) REFERENCES \`blog_posts\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blogs_comments\` DROP FOREIGN KEY \`FK_7453d3d62bab62e98dbd932a04a\``);
    }

}
