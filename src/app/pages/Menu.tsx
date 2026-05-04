import { motion } from "motion/react";
import { Link } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Search, Star, Flame, Utensils } from "lucide-react";
import { useState } from "react";

export function Menu() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "all", name: "All Items" },
    { id: "chicken", name: "Chicken" },
    { id: "sandwiches", name: "Sandwiches" },
    { id: "combos", name: "Combos" },
    { id: "sides", name: "Sides" },
    { id: "drinks", name: "Drinks" },
  ];

  const menuItems = [
    {
      id: "classic-fried-chicken",
      name: "Classic Fried Chicken",
      category: "chicken",
      price: 14.99,
      description: "Crispy, golden-fried chicken prepared to consistent standards",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80",
      spiceLevel: 0,
      tags: ["Popular", "Classic"]
    },
    {
      id: "spicy-fried-chicken",
      name: "Spicy Fried Chicken",
      category: "chicken",
      price: 15.99,
      description: "Heat-controlled spice blend with signature coating",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
      spiceLevel: 3,
      tags: ["Spicy", "Popular"]
    },
    {
      id: "grilled-chicken",
      name: "Grilled Chicken",
      category: "chicken",
      price: 13.99,
      description: "Flame-grilled with herb seasoning and lemon",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=800&q=80",
      spiceLevel: 0,
      tags: ["Light", "Grilled"]
    },
    {
      id: "chicken-tenders",
      name: "Chicken Tenders",
      category: "chicken",
      price: 12.99,
      description: "Hand-breaded tenders with choice of dipping sauce",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1562967914-608f82629710?w=800&q=80",
      spiceLevel: 0,
      tags: ["Popular", "Classic"]
    },
    {
      id: "chicken-wings",
      name: "Chicken Wings",
      category: "chicken",
      price: 11.99,
      description: "Crispy wings with dry rub or sauce options",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1608039755401-742074f0548d?w=800&q=80",
      spiceLevel: 2,
      tags: ["Popular"]
    },
    {
      id: "classic-sandwich",
      name: "Classic Chicken Sandwich",
      category: "sandwiches",
      price: 10.99,
      description: "Fried chicken breast, pickles, mayo, brioche bun",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=800&q=80",
      spiceLevel: 0,
      tags: ["Popular", "Sandwich"]
    },
    {
      id: "spicy-sandwich",
      name: "Spicy Chicken Sandwich",
      category: "sandwiches",
      price: 11.99,
      description: "Spicy fried chicken, slaw, pickles, spicy mayo",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1619740455993-8ba5bc4e5cce?w=800&q=80",
      spiceLevel: 3,
      tags: ["Spicy", "Sandwich"]
    },
    {
      id: "deluxe-sandwich",
      name: "Deluxe Chicken Sandwich",
      category: "sandwiches",
      price: 12.99,
      description: "Fried chicken, bacon, cheese, lettuce, tomato, special sauce",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800&q=80",
      spiceLevel: 0,
      tags: ["Premium", "Sandwich"]
    },
    {
      id: "grilled-sandwich",
      name: "Grilled Chicken Sandwich",
      category: "sandwiches",
      price: 10.99,
      description: "Grilled chicken breast, lettuce, tomato, honey mustard",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1572448862527-d3c904757de6?w=800&q=80",
      spiceLevel: 0,
      tags: ["Light", "Grilled"]
    },
    {
      id: "sandwich-combo",
      name: "Sandwich Combo",
      category: "combos",
      price: 16.99,
      description: "Any sandwich with side and drink",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1619894464908-e1d1d5e3e67d?w=800&q=80",
      spiceLevel: 0,
      tags: ["Combo", "Popular"]
    },
    {
      id: "tenders-combo",
      name: "Tenders Combo",
      category: "combos",
      price: 16.99,
      description: "Tenders with side and drink",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1562967914-efc7246e8c44?w=800&q=80",
      spiceLevel: 0,
      tags: ["Combo", "Popular"]
    },
    {
      id: "wings-combo",
      name: "Wings Combo",
      category: "combos",
      price: 15.99,
      description: "Wings with side and drink",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1527477396000-e27163b481c2?w=800&q=80",
      spiceLevel: 1,
      tags: ["Combo"]
    },
    {
      id: "fries",
      name: "Fries",
      category: "sides",
      price: 3.99,
      description: "Crispy golden fries with seasoning",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&q=80",
      spiceLevel: 0,
      tags: ["Side"]
    },
    {
      id: "slaw",
      name: "Coleslaw",
      category: "sides",
      price: 2.99,
      description: "Creamy coleslaw with fresh cabbage",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1543826999-49396cbf1dae?w=800&q=80",
      spiceLevel: 0,
      tags: ["Side", "Fresh"]
    },
    {
      id: "mac-cheese",
      name: "Mac & Cheese",
      category: "sides",
      price: 4.99,
      description: "Creamy mac and cheese",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1543339494-b4cd4f7ba686?w=800&q=80",
      spiceLevel: 0,
      tags: ["Side", "Popular"]
    },
    {
      id: "house-lemonade",
      name: "House Lemonade",
      category: "drinks",
      price: 2.99,
      description: "Fresh-squeezed lemonade",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f9d?w=800&q=80",
      spiceLevel: 0,
      tags: ["Drink", "Fresh"]
    },
    {
      id: "sweet-tea",
      name: "Sweet Tea",
      category: "drinks",
      price: 2.49,
      description: "Southern-style sweet tea",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80",
      spiceLevel: 0,
      tags: ["Drink"]
    },
    {
      id: "fountain-drinks",
      name: "Fountain Drinks",
      category: "drinks",
      price: 2.49,
      description: "Coke, Sprite, Dr Pepper, and more",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=800&q=80",
      spiceLevel: 0,
      tags: ["Drink"]
    }
  ];

  const filteredItems = menuItems.filter(item => {
    const matchesCategory = selectedCategory === "all" || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative py-24 px-6 overflow-hidden" style={{ backgroundColor: 'var(--b1-black-marble)' }}>
        <div className="absolute inset-0 opacity-10">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1606125202241-63545e283fad?w=1920&q=80"
            alt="Premium dining"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <div className="w-16 h-16 border mx-auto mb-6 flex items-center justify-center" style={{ borderColor: 'var(--b1-gold-trim)' }}>
              <Utensils className="w-8 h-8" style={{ color: 'var(--b1-gold-trim)' }} />
            </div>
            <h1 className="mb-4 tracking-[0.2em]" style={{ fontSize: '3.5rem', fontWeight: 500 }}>
              THE MENU
            </h1>
            <p className="text-xl tracking-wide" style={{ color: 'var(--b1-neutral-gray)' }}>
              Straightforward selections. Clean flavors. No confusion. Every item is prepared with consistent standards across all locations.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-2xl mx-auto mb-12"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: 'var(--b1-neutral-gray)' }} />
              <input
                type="text"
                placeholder="Search by name or ingredient..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 border tracking-wide outline-none transition-colors"
                style={{
                  backgroundColor: 'var(--b1-obsidian-panel)',
                  borderColor: 'var(--b1-border-subtle)',
                  color: 'var(--b1-white-space)'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = 'var(--b1-gold-trim)'}
                onBlur={(e) => e.currentTarget.style.borderColor = 'var(--b1-border-subtle)'}
              />
            </div>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className="px-6 py-3 border tracking-wider transition-all"
                style={{
                  fontWeight: 500,
                  backgroundColor: selectedCategory === category.id ? 'var(--b1-gold-minimal)' : 'transparent',
                  borderColor: selectedCategory === category.id ? 'var(--b1-gold-minimal)' : 'var(--b1-border-subtle)',
                  color: selectedCategory === category.id ? 'var(--b1-black-marble)' : 'var(--b1-white-space)'
                }}
                onMouseEnter={(e) => {
                  if (selectedCategory !== category.id) {
                    e.currentTarget.style.borderColor = 'var(--b1-gold-trim)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedCategory !== category.id) {
                    e.currentTarget.style.borderColor = 'var(--b1-border-subtle)';
                  }
                }}
              >
                {category.name}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Menu Grid */}
      <section className="py-16 px-6" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex items-center justify-between">
            <p className="tracking-wide" style={{ color: 'var(--b1-neutral-gray)' }}>
              {filteredItems.length} items found
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link to={`/menu/${item.id}`} className="group block h-full">
                  <div className="border group-hover:border-b1-gold-trim transition-all h-full flex flex-col" style={{ backgroundColor: 'var(--b1-obsidian-panel)', borderColor: 'var(--b1-border-subtle)' }}>
                    {/* Image */}
                    <div className="relative overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full aspect-[4/3] object-cover group-hover:scale-110 transition-transform duration-500"
                      />

                      {/* Category badge */}
                      <div className="absolute top-4 right-4 px-3 py-1 text-xs tracking-widest" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)', fontWeight: 500 }}>
                        {categories.find(c => c.id === item.category)?.name || 'Premium'}
                      </div>

                      {/* Spice indicator */}
                      {item.spiceLevel > 0 && (
                        <div className="absolute bottom-4 left-4 flex gap-1">
                          {Array.from({ length: item.spiceLevel }).map((_, i) => (
                            <Flame key={i} className="w-4 h-4 fill-current" style={{ color: '#D4504D' }} />
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6 flex-1 flex flex-col">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="tracking-wider group-hover:text-b1-gold-trim transition-colors flex-1" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1 ml-2" style={{ color: 'var(--b1-gold-minimal)' }}>
                          <Star className="w-4 h-4 fill-current" />
                          <span className="text-sm">{item.rating}</span>
                        </div>
                      </div>

                      <p className="text-sm mb-6 leading-relaxed flex-1" style={{ color: 'var(--b1-neutral-gray)' }}>
                        {item.description}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t" style={{ borderTopColor: 'var(--b1-border-subtle)' }}>
                        <span className="text-2xl" style={{ fontWeight: 500, color: 'var(--b1-gold-minimal)' }}>
                          ${item.price}
                        </span>
                        <span className="text-sm tracking-wider group-hover:underline" style={{ color: 'var(--b1-gold-trim)' }}>
                          ORDER →
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl" style={{ color: 'var(--b1-neutral-gray)' }}>
                No items match your search.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
