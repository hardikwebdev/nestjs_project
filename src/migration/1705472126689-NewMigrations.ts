import { MigrationInterface, QueryRunner } from "typeorm";

export class NewMigrations1705472126689 implements MigrationInterface {
    name = 'NewMigrations1705472126689'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tip_payments\` CHANGE \`purchaseOrderNumber\` \`purchaseOrderNumber\` bigint NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`tip_payments\` CHANGE \`purchaseOrderNumber\` \`purchaseOrderNumber\` bigint NOT NULL`);
    }

}
