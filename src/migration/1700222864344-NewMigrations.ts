import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1700222864344 implements MigrationInterface {
    name = 'NewMigrations1700222864344'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blogs_comments\` ADD CONSTRAINT \`FK_cdefb7787cef937e24e57257e5c\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`blogs_comments\` DROP FOREIGN KEY \`FK_cdefb7787cef937e24e57257e5c\``);
    }

}
