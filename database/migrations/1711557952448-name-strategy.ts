import { MigrationInterface, QueryRunner } from 'typeorm';

export class NameStrategy1711557952448 implements MigrationInterface {
  name = 'NameStrategy1711557952448';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE \`org_position\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`project_id\` varchar(255) NOT NULL, \`name\` varchar(255) NOT NULL, \`external_id\` int NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`org_stakeholder_department_position\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`project_id\` varchar(255) NOT NULL, \`stakeholder_id\` varchar(36) NULL, \`department_id\` varchar(36) NULL, \`position_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`org_stakeholder_user\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`user_id\` varchar(255) NOT NULL, \`is_user\` tinyint NOT NULL DEFAULT 0, \`stakeholder\` varchar(36) NULL, UNIQUE INDEX \`REL_1bf2a3e85fc8a9107bc16f6249\` (\`stakeholder\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`org_influence\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`type\` varchar(255) NOT NULL, \`influencerId\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`org_influencer\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`project_id\` varchar(255) NOT NULL, \`is_excluded\` tinyint NOT NULL, \`selected_future_process\` varchar(255) NOT NULL, \`stakeholder_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`org_project_role\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`name\` varchar(255) NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`org_stakeholder\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`code\` int NOT NULL, \`name\` varchar(255) NOT NULL, \`email\` varchar(255) NOT NULL, \`project_id\` varchar(255) NOT NULL, \`project_role\` varchar(36) NULL, UNIQUE INDEX \`IDX_f10ee1bbac2375f49854302dfa\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`org_department\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`project_id\` varchar(255) NOT NULL, \`code\` int NOT NULL, \`name\` varchar(255) NOT NULL, \`parent_id\` varchar(36) NULL, \`stakeholder_id\` varchar(36) NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `CREATE TABLE \`org_sprint\` (\`id\` varchar(36) NOT NULL, \`created_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), \`deleted_at\` timestamp(6) NULL, \`name\` varchar(255) NOT NULL, \`code\` int NOT NULL, \`project_id\` varchar(255) NOT NULL, \`start_date\` datetime NOT NULL, \`due_date\` datetime NOT NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_stakeholder_department_position\` ADD CONSTRAINT \`FK_50a35807ab75fdead3bd4377085\` FOREIGN KEY (\`stakeholder_id\`) REFERENCES \`org_stakeholder\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_stakeholder_department_position\` ADD CONSTRAINT \`FK_65e4ebae08fde17704e02339ee2\` FOREIGN KEY (\`department_id\`) REFERENCES \`org_department\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_stakeholder_department_position\` ADD CONSTRAINT \`FK_90d3968170348538f2379a9c1ac\` FOREIGN KEY (\`position_id\`) REFERENCES \`org_position\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_stakeholder_user\` ADD CONSTRAINT \`FK_1bf2a3e85fc8a9107bc16f62492\` FOREIGN KEY (\`stakeholder\`) REFERENCES \`org_stakeholder\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_influence\` ADD CONSTRAINT \`FK_806223d052dc6539f400e7d3972\` FOREIGN KEY (\`influencerId\`) REFERENCES \`org_influencer\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_influencer\` ADD CONSTRAINT \`FK_7f3ee2c203132eaa6a9e60f13d3\` FOREIGN KEY (\`stakeholder_id\`) REFERENCES \`org_stakeholder\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_stakeholder\` ADD CONSTRAINT \`FK_26abbabcb78da9bd1a02f5543ee\` FOREIGN KEY (\`project_role\`) REFERENCES \`org_project_role\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_department\` ADD CONSTRAINT \`FK_a17d5664b6c8d71a1d4a2968eea\` FOREIGN KEY (\`parent_id\`) REFERENCES \`org_department\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_department\` ADD CONSTRAINT \`FK_b76c947ccfc7b79dca44c354e62\` FOREIGN KEY (\`stakeholder_id\`) REFERENCES \`org_stakeholder\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`org_department\` DROP FOREIGN KEY \`FK_b76c947ccfc7b79dca44c354e62\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_department\` DROP FOREIGN KEY \`FK_a17d5664b6c8d71a1d4a2968eea\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_stakeholder\` DROP FOREIGN KEY \`FK_26abbabcb78da9bd1a02f5543ee\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_influencer\` DROP FOREIGN KEY \`FK_7f3ee2c203132eaa6a9e60f13d3\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_influence\` DROP FOREIGN KEY \`FK_806223d052dc6539f400e7d3972\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_stakeholder_user\` DROP FOREIGN KEY \`FK_1bf2a3e85fc8a9107bc16f62492\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_stakeholder_department_position\` DROP FOREIGN KEY \`FK_90d3968170348538f2379a9c1ac\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_stakeholder_department_position\` DROP FOREIGN KEY \`FK_65e4ebae08fde17704e02339ee2\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`org_stakeholder_department_position\` DROP FOREIGN KEY \`FK_50a35807ab75fdead3bd4377085\``,
    );
    await queryRunner.query(`DROP TABLE \`org_sprint\``);
    await queryRunner.query(`DROP TABLE \`org_department\``);
    await queryRunner.query(
      `DROP INDEX \`IDX_f10ee1bbac2375f49854302dfa\` ON \`org_stakeholder\``,
    );
    await queryRunner.query(`DROP TABLE \`org_stakeholder\``);
    await queryRunner.query(`DROP TABLE \`org_project_role\``);
    await queryRunner.query(`DROP TABLE \`org_influencer\``);
    await queryRunner.query(`DROP TABLE \`org_influence\``);
    await queryRunner.query(
      `DROP INDEX \`REL_1bf2a3e85fc8a9107bc16f6249\` ON \`org_stakeholder_user\``,
    );
    await queryRunner.query(`DROP TABLE \`org_stakeholder_user\``);
    await queryRunner.query(
      `DROP TABLE \`org_stakeholder_department_position\``,
    );
    await queryRunner.query(`DROP TABLE \`org_position\``);
  }
}
