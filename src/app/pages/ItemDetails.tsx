import { motion } from "motion/react";
import { useParams, Link, useNavigate } from "react-router";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Star, Flame, Check, Plus, Minus, ShoppingCart, ArrowLeft } from "lucide-react";
import { useState } from "react";

export function ItemDetails() {
  const { itemId } = useParams();
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  // Mock item data (in real app, fetch by itemId)
  const item = {
    id: itemId,
    name: "Signature Flame Burger",
    category: "Spicy",
    price: 18.99,
    description: "Charred to perfection over open flame, layered with pepper jack cheese, fresh jalapeños, and house-made chipotle aioli. Every ingredient is quality-certified and prepared fresh to order.",
    rating: 4.9,
    reviews: 847,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1200&q=80",
    spiceLevel: 3,
    prepTime: "15-20 min",
    calories: 820,
    tags: ["Spicy", "Premium", "Popular"],
    ingredients: [
      "Charred Angus beef patty",
      "Pepper jack cheese",
      "Fresh jalapeños",
      "Chipotle aioli",
      "Red onion",
      "Brioche bun"
    ],
    options: [
      { id: "extra-patty", name: "Extra Patty", price: 5.99 },
      { id: "bacon", name: "Add Bacon", price: 2.99 },
      { id: "avocado", name: "Add Avocado", price: 1.99 },
      { id: "fries", name: "Side of Fries", price: 3.99 }
    ]
  };

  const toggleOption = (optionId: string) => {
    setSelectedOptions(prev =>
      prev.includes(optionId)
        ? prev.filter(id => id !== optionId)
        : [...prev, optionId]
    );
  };

  const calculateTotal = () => {
    const basePrice = item.price * quantity;
    const optionsPrice = selectedOptions.reduce((sum, optionId) => {
      const option = item.options.find(opt => opt.id === optionId);
      return sum + (option?.price || 0) * quantity;
    }, 0);
    return basePrice + optionsPrice;
  };

  const addToCart = () => {
    // In real app, add to cart state/context
    navigate('/cart');
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--b1-obsidian)' }}>
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 transition-colors"
          style={{ color: 'var(--b1-neutral-gray)' }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--b1-gold-trim)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--b1-neutral-gray)'}
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="tracking-wider">Back to Menu</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative border overflow-hidden sticky top-24" style={{ borderColor: 'var(--b1-border-subtle)' }}>
              <ImageWithFallback
                src={item.image}
                alt={item.name}
                className="w-full aspect-square object-cover"
              />

              {/* Category badge */}
              <div className="absolute top-6 right-6 px-4 py-2" style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)' }}>
                <div className="text-sm tracking-widest" style={{ fontWeight: 500 }}>
                  {item.category}
                </div>
              </div>

              {/* Spice level */}
              {item.spiceLevel > 0 && (
                <div className="absolute bottom-6 left-6 px-4 py-2 flex items-center gap-2" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
                  <span className="text-sm tracking-wider">HEAT:</span>
                  <div className="flex gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Flame
                        key={i}
                        className="w-5 h-5"
                        style={{ color: i < item.spiceLevel ? '#D4504D' : 'rgba(255, 255, 255, 0.3)' }}
                        fill={i < item.spiceLevel ? '#D4504D' : 'none'}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-8"
          >
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                {item.tags?.map((tag, index) => (
                  <span key={index} className="px-3 py-1 text-xs tracking-widest border" style={{ borderColor: 'var(--b1-gold-trim)', color: 'var(--b1-gold-trim)' }}>
                    {tag}
                  </span>
                ))}
              </div>

              <h1 className="mb-4 tracking-wider" style={{ fontSize: '3rem', fontWeight: 500 }}>
                {item.name}
              </h1>

              <div className="flex items-center gap-6 mb-6">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 fill-current" style={{ color: 'var(--b1-gold-minimal)' }} />
                  <span className="text-lg" style={{ fontWeight: 500 }}>
                    {item.rating}
                  </span>
                  <span style={{ color: 'var(--b1-neutral-gray)' }}>
                    ({item.reviews} reviews)
                  </span>
                </div>
                <div style={{ color: 'var(--b1-neutral-gray)' }}>
                  {item.prepTime}
                </div>
                <div style={{ color: 'var(--b1-neutral-gray)' }}>
                  {item.calories} cal
                </div>
              </div>

              <p className="text-lg leading-relaxed" style={{ color: 'var(--b1-neutral-gray)' }}>
                {item.description}
              </p>
            </div>

            {/* Ingredients */}
            <div className="border-t pt-6" style={{ borderTopColor: 'var(--b1-border-subtle)' }}>
              <h3 className="mb-4 tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                Ingredients
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {item.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4" style={{ color: 'var(--b1-gold-trim)' }} />
                    <span>{ingredient}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="border-t pt-6" style={{ borderTopColor: 'var(--b1-border-subtle)' }}>
              <h3 className="mb-4 tracking-wider" style={{ fontSize: '1.25rem', fontWeight: 500 }}>
                Customize Your Order
              </h3>
              <div className="space-y-3">
                {item.options.map((option) => (
                  <label
                    key={option.id}
                    className="flex items-center justify-between p-4 border cursor-pointer transition-colors"
                    style={{ borderColor: 'var(--b1-border-subtle)' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--b1-gold-trim)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--b1-border-subtle)'}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedOptions.includes(option.id)}
                        onChange={() => toggleOption(option.id)}
                        className="w-5 h-5"
                        style={{ accentColor: 'var(--b1-gold-minimal)' }}
                      />
                      <span className="tracking-wide">{option.name}</span>
                    </div>
                    <span style={{ fontWeight: 500, color: 'var(--b1-gold-minimal)' }}>
                      +${option.price.toFixed(2)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Quantity & Add to Cart */}
            <div className="border-t pt-6" style={{ borderTopColor: 'var(--b1-border-subtle)' }}>
              <div className="flex items-center gap-6 mb-6">
                <span className="tracking-wider" style={{ fontWeight: 500 }}>
                  Quantity:
                </span>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 border flex items-center justify-center transition-colors"
                    style={{ borderColor: 'var(--b1-border-subtle)' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--b1-gold-trim)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--b1-border-subtle)'}
                  >
                    <Minus className="w-5 h-5" />
                  </button>
                  <span className="text-2xl w-12 text-center" style={{ fontWeight: 500 }}>
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 border flex items-center justify-center transition-colors"
                    style={{ borderColor: 'var(--b1-border-subtle)' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--b1-gold-trim)'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--b1-border-subtle)'}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6 p-6" style={{ backgroundColor: 'var(--b1-obsidian-panel)' }}>
                <span className="text-xl tracking-wider" style={{ fontWeight: 500 }}>
                  Total:
                </span>
                <span className="text-3xl" style={{ fontWeight: 500, color: 'var(--b1-gold-minimal)' }}>
                  ${calculateTotal().toFixed(2)}
                </span>
              </div>

              <button
                onClick={addToCart}
                className="w-full py-4 tracking-wider transition-all transform hover:scale-105 flex items-center justify-center gap-3"
                style={{ backgroundColor: 'var(--b1-gold-minimal)', color: 'var(--b1-black-marble)', fontWeight: 500 }}
              >
                <ShoppingCart className="w-5 h-5" />
                ADD TO CART
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
