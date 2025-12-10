import { ProductGridSection } from "./ProductGridSection";

// Mock product data for demonstration
const mockProducts = [
  {
    id: "1",
    title: "Apple iPhone 16 Pro (256GB Storage, Natural Titanium)",
    handle: "iphone-16-pro-natural-titanium",
    thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/iphone.jpg",
    price: { amount: 1890000, currencyCode: "MNT" },
    originalPrice: { amount: 2100000, currencyCode: "MNT" },
    collection: { id: "col_1", title: "Шилдэг борлуулалт", handle: "best-sellers" },
  },
  {
    id: "2",
    title: "Samsung Galaxy S24 Ultra (12GB RAM, 256GB Storage, Titanium Gray)",
    handle: "samsung-s24-ultra",
    thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/phone.jpg",
    price: { amount: 1650000, currencyCode: "MNT" },
    originalPrice: { amount: 1890000, currencyCode: "MNT" },
    collection: { id: "col_2", title: "Санал болгох", handle: "recommended" },
  },
  {
    id: "3",
    title: "OnePlus 15 5G (12GB RAM, 256GB Storage) Infinite Black",
    handle: "oneplus-15-black",
    thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/phone-2.jpg",
    price: { amount: 945000, currencyCode: "MNT" },
    originalPrice: { amount: 1050000, currencyCode: "MNT" },
    collection: { id: "col_3", title: "Шинэ бүтээгдэхүүн", handle: "new-arrivals" },
  },
  {
    id: "4",
    title: "Apple MacBook Pro M4 Chip (16GB RAM, 512GB SSD, Space Black)",
    handle: "macbook-pro-m4",
    thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/laptop.jpg",
    price: { amount: 2890000, currencyCode: "MNT" },
    originalPrice: { amount: 3200000, currencyCode: "MNT" },
    collection: { id: "col_4", title: "Онцлох", handle: "featured" },
  },
  {
    id: "5",
    title: "LG 55 inch 4K OLED Smart TV with Dolby Vision",
    handle: "lg-55-oled-tv",
    thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/tv.jpg",
    price: { amount: 1450000, currencyCode: "MNT" },
    originalPrice: { amount: 1890000, currencyCode: "MNT" },
    collection: { id: "col_5", title: "Эрэлттэй", handle: "trending" },
  },
  {
    id: "6",
    title: "Sony WH-1000XM5 Noise Cancelling Wireless Headphones",
    handle: "sony-wh1000xm5",
    thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/headphones.jpg",
    price: { amount: 580000, currencyCode: "MNT" },
    originalPrice: { amount: 680000, currencyCode: "MNT" },
    collection: { id: "col_1", title: "Шилдэг борлуулалт", handle: "best-sellers" },
  },
];

const applianceProducts = [
  {
    id: "7",
    title: "Samsung 7 KG Fully Automatic Top Load Washing Machine",
    handle: "samsung-washing-machine-7kg",
    thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/washing-machine.jpg",
    price: { amount: 750000, currencyCode: "MNT" },
    originalPrice: { amount: 950000, currencyCode: "MNT" },
    collection: { id: "col_1", title: "Шилдэг борлуулалт", handle: "best-sellers" },
  },
  {
    id: "8",
    title: "LG 260L Frost Free Double Door Refrigerator (Shiny Steel)",
    handle: "lg-refrigerator-260l",
    thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/fridge.jpg",
    price: { amount: 850000, currencyCode: "MNT" },
    originalPrice: { amount: 1100000, currencyCode: "MNT" },
    collection: { id: "col_2", title: "Санал болгох", handle: "recommended" },
  },
  {
    id: "9",
    title: "Voltas Beko 1.5 Ton 5 Star Inverter Split AC",
    handle: "voltas-beko-ac-1-5-ton",
    thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/ac.jpg",
    price: { amount: 680000, currencyCode: "MNT" },
    originalPrice: { amount: 890000, currencyCode: "MNT" },
    collection: { id: "col_5", title: "Эрэлттэй", handle: "trending" },
  },
  {
    id: "10",
    title: "Haier 20L Convection Microwave Oven (Silver)",
    handle: "haier-microwave-20l",
    thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/microwave.jpg",
    price: { amount: 180000, currencyCode: "MNT" },
    originalPrice: { amount: 250000, currencyCode: "MNT" },
    collection: null,
  },
];

const laptopProducts = [
  {
    id: "11",
    title: "HP Laptop Intel Core i5 12th Gen (16GB RAM, 512GB SSD, Windows 11)",
    handle: "hp-laptop-i5-16gb",
    thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/laptop-hp.jpg",
    price: { amount: 950000, currencyCode: "MNT" },
    originalPrice: { amount: 1200000, currencyCode: "MNT" },
    collection: { id: "col_4", title: "Онцлох", handle: "featured" },
  },
  {
    id: "12",
    title: "Lenovo IdeaPad Slim 3 AMD Ryzen 7 (16GB RAM, 512GB SSD)",
    handle: "lenovo-ideapad-slim-3",
    thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/laptop-lenovo.jpg",
    price: { amount: 780000, currencyCode: "MNT" },
    originalPrice: { amount: 980000, currencyCode: "MNT" },
    collection: { id: "col_5", title: "Эрэлттэй", handle: "trending" },
  },
  {
    id: "13",
    title: "Dell Inspiron 15 Laptop Intel Core i3 (8GB RAM, 512GB SSD)",
    handle: "dell-inspiron-15",
    thumbnail: "https://res.cloudinary.com/demo/image/upload/v1/samples/ecommerce/laptop-dell.jpg",
    price: { amount: 650000, currencyCode: "MNT" },
    originalPrice: { amount: 820000, currencyCode: "MNT" },
    collection: { id: "col_3", title: "Шинэ бүтээгдэхүүн", handle: "new-arrivals" },
  },
];

export function HomeContent() {
  return (
    <>
      {/* Best of Apple Section */}
      <ProductGridSection
        title="Best of Apple"
        subtitle="₮10,000 хүртэл шууд хөнгөлөлт ICICI & SBI картаар"
        products={mockProducts.filter(p => p.title.includes("Apple"))}
        viewAllLink="/categories/apple"
      />

      {/* Greater Savings Deals */}
      <ProductGridSection
        title="Greater Savings Deals"
        subtitle="Гэрийн техник, цахилгаан бараанд том хөнгөлөлт"
        products={applianceProducts}
        tabs={["Угаалгын машин", "Агааржуулагч", "5G Утас", "Телевиз", "Том аудио"]}
        viewAllLink="/products"
      />

      {/* Bestsellers Deals */}
      <ProductGridSection
        title="Bestsellers Deals"
        subtitle="Хамгийн их борлуулалттай бүтээгдэхүүнүүд"
        products={mockProducts}
        tabs={["Утас", "Ноутбук", "Airfryer", "MacBook", "iPad", "Smartwatch"]}
        viewAllLink="/bestsellers"
      />

      {/* Exclusive Deals Section */}
      <ProductGridSection
        title="Exclusive Deals & Offers"
        subtitle="Зөвхөн та нарт зориулсан онцгой санал"
        products={laptopProducts}
        tabs={["Trending", "Best Sellers", "Price Drop", "New Releases"]}
        viewAllLink="/deals"
      />

      {/* Gadgets & More */}
      <ProductGridSection
        title="Gadgets & More"
        subtitle="Дэлхийн шилдэг брэндүүдийн гэр ахуй, техник хэрэгсэл"
        products={mockProducts.slice(0, 4)}
        tabs={["Gaming Controllers", "Apple Accessories", "Smartwatch", "TWS Earbuds"]}
        viewAllLink="/gadgets"
      />
    </>
  );
}
