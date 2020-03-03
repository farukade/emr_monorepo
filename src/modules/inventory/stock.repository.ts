import { EntityRepository, Repository } from 'typeorm';
import { Stock } from './entities/stock.entity';
import { StockDto } from './dto/stock.dto';
import { InventoryCategory } from './entities/inventory.category.entity';
import { InventorySubCategory } from './entities/inventory.sub-category.entity';

@EntityRepository(Stock)
export class StockRepository extends Repository<Stock> {

    async saveStock(stockDto: StockDto, category: InventoryCategory, subCategory: InventorySubCategory): Promise<Stock> {
        const { name, description, stock_code, cost_price, sales_price, quantity } = stockDto;
        const stock       = new Stock();
        stock.name        = name;
        stock.stock_code  = (stock_code !== '') ? 'STU-' + stock_code : 'STU-' + Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5);
        stock.description = description;
        stock.cost_price  = cost_price;
        stock.sales_price = sales_price;
        stock.quantity    = quantity;
        stock.category    = category;
        if (subCategory) {
            stock.subCategory = subCategory;
        }
        await stock.save();
        return stock;
    }
}
