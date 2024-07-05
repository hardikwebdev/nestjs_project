import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1705037922621 implements MigrationInterface {
    name = 'NewMigrations1705037922621'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tip_payments\` ADD \`user_id\` int NULL`);
        await queryRunner.query(`ALTER TABLE \`tip_payments\` ADD CONSTRAINT \`FK_29c104448efce7f7952f2fa815b\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tip_payments\` DROP FOREIGN KEY \`FK_29c104448efce7f7952f2fa815b\``);
        await queryRunner.query(`ALTER TABLE \`tip_payments\` DROP COLUMN \`user_id\``);
    }

}
