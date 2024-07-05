import { MigrationInterface, QueryRunner } from 'typeorm';

export class NewMigrations1703760459092 implements MigrationInterface {
  name = 'NewMigrations1703760459092';
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`tip_payments\` (\`id\` int NOT NULL AUTO_INCREMENT, \`customerId\` varchar(255), \`amount\` double, \`name\` varchar(255) NOT NULL, \`message\` varchar(255), \`metadata\` json, \`status\` tinyint NOT NULL DEFAULT '0',\`purchaseOrderNumber\` bigint NOT NULL,\`transactionId\` varchar(255), \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deletedAt\` timestamp(6) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE \`tip_payments\``);
  }
}
