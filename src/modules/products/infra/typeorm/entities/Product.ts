import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn,
	OneToMany,
} from 'typeorm';

import OrdersProducts from '@modules/orders/infra/typeorm/entities/OrdersProducts';

@Entity('products')
class Product {
	@PrimaryGeneratedColumn()
	id: string;

	@Column()
	name: string;

	@Column()
	price: number;

	@Column('decimal')
	quantity: number;

	@OneToMany(
		_type => OrdersProducts,
		ordersProducts => ordersProducts.product,
	)
	order_products: OrdersProducts[];

	@CreateDateColumn()
	created_at: Date;

	@UpdateDateColumn()
	updated_at: Date;
}

export default Product;
