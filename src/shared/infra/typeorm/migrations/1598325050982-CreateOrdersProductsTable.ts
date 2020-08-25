import {
	MigrationInterface,
	QueryRunner,
	Table,
	TableForeignKey,
} from 'typeorm';

export default class CreateOrdersProductsTable1598325050982
	implements MigrationInterface {
	public async up(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.createTable(
			new Table({
				name: 'orders_products',
				columns: [
					{
						name: 'id',
						type: 'varchar',
						isPrimary: true,
						generationStrategy: 'uuid',
						default: 'uuid_generate_v4()',
					},
					{
						name: 'price',
						type: 'decimal',
						precision: 6,
						scale: 2,
						default: 0,
					},
					{
						name: 'quantity',
						type: 'integer',
						default: 0,
					},
					{
						name: 'product_id',
						type: 'varchar',
						isNullable: true,
					},
					{
						name: 'order_id',
						type: 'varchar',
						isNullable: true,
					},
					{
						name: 'created_at',
						type: 'timestamp',
						default: 'now()',
					},
					{
						name: 'updated_at',
						type: 'timestamp',
						default: 'now()',
					},
				],
			}),
		);
		await queryRunner.createForeignKeys('orders_products', [
			new TableForeignKey({
				name: 'fk_orders_products_orders',
				columnNames: ['order_id'],
				referencedColumnNames: ['id'],
				referencedTableName: 'orders',
				onDelete: 'SET NULL',
				onUpdate: 'CASCADE',
			}),
			new TableForeignKey({
				name: 'fk_orders_products_products',
				columnNames: ['product_id'],
				referencedColumnNames: ['id'],
				referencedTableName: 'products',
				onDelete: 'SET NULL',
				onUpdate: 'CASCADE',
			}),
		]);
	}

	public async down(queryRunner: QueryRunner): Promise<void> {
		await queryRunner.dropForeignKey(
			'orders_products',
			'fk_orders_products_orders',
		);
		await queryRunner.dropForeignKey(
			'orders_products',
			'fk_orders_products_products',
		);
		await queryRunner.dropTable('orders_products');
	}
}
