export enum ItemType {
  AGED_BRIE = 'Aged Brie',
  BACKSTAGE_PASS = 'Backstage passes to a TAFKAL80ETC concert',
  SULFURAS = 'Sulfuras, Hand of Ragnaros',
  STANDARD = 'Standard'
}

export const QUALITY_CONSTANTS = {
  MAX_QUALITY: 50,
  MIN_QUALITY: 0,
  BACKSTAGE_LONG_THRESHOLD: 11,
  BACKSTAGE_MEDIUM_THRESHOLD: 6,
  BACKSTAGE_CLOSE_THRESHOLD: 0
} as const;

export class Item {
  constructor(
    public name: string,
    public sellIn: number,
    public quality: number
  ) {}

  static validate(item: Item): void {
    if (item.quality < QUALITY_CONSTANTS.MIN_QUALITY) {
      throw new Error('Quality cannot be negative');
    }
    if (item.quality > QUALITY_CONSTANTS.MAX_QUALITY && item.name !== ItemType.SULFURAS) {
      throw new Error('Quality cannot exceed 50 except for Sulfuras');
    }
  }
}

export class GildedRose {
  constructor(private items: Array<Item> = []) {
    // Validate all items on construction
    items.forEach(Item.validate);
  }

  private updateStandardItem(item: Item): void {
    if (item.quality > QUALITY_CONSTANTS.MIN_QUALITY) {
      item.quality--;
      if (item.sellIn <= 0 && item.quality > QUALITY_CONSTANTS.MIN_QUALITY) {
        item.quality--;
      }
    }
  }

  private updateAgedBrie(item: Item): void {
    if (item.quality < QUALITY_CONSTANTS.MAX_QUALITY) {
      item.quality++;
      if (item.sellIn <= 0 && item.quality < QUALITY_CONSTANTS.MAX_QUALITY) {
        item.quality++;
      }
    }
  }

  private updateBackstagePass(item: Item): void {
    if (item.sellIn <= QUALITY_CONSTANTS.BACKSTAGE_CLOSE_THRESHOLD) {
      item.quality = 0;
      return;
    }

    if (item.quality < QUALITY_CONSTANTS.MAX_QUALITY) {
      item.quality++;
      
      if (item.sellIn <= QUALITY_CONSTANTS.BACKSTAGE_MEDIUM_THRESHOLD) {
        item.quality = Math.min(item.quality + 2, QUALITY_CONSTANTS.MAX_QUALITY);
      } else if (item.sellIn <= QUALITY_CONSTANTS.BACKSTAGE_LONG_THRESHOLD) {
        item.quality = Math.min(item.quality + 1, QUALITY_CONSTANTS.MAX_QUALITY);
      }
    }
  }

  private updateItemQuality(item: Item): void {
    switch (item.name) {
      case ItemType.AGED_BRIE:
        this.updateAgedBrie(item);
        break;
      case ItemType.BACKSTAGE_PASS:
        this.updateBackstagePass(item);
        break;
      case ItemType.SULFURAS:
        // Sulfuras never changes
        break;
      default:
        this.updateStandardItem(item);
    }
  }

  updateQuality(): Array<Item> {
    for (const item of this.items) {
      if (item.name !== ItemType.SULFURAS) {
        item.sellIn--;
      }
      this.updateItemQuality(item);
    }
    return this.items;
  }
}
