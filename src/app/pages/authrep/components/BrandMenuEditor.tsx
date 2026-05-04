import React, { useState, useEffect } from 'react';
import { AuthRepPortalService } from '../../../services/portals/AuthRepPortalService';
import { getCorporateMenu, updateMenuItem } from '../../../services/menu-crud';

interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  base_price: number;
  active: boolean;
  brand_id: string;
  dietary_tags?: string[];
}

export default function BrandMenuEditor() {
  const [selectedBrand, setSelectedBrand] = useState<string>('ghetto-eats');
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [authRepId] = useState('mock-authrep-id');

  const brands = [
    { id: 'ghetto-eats', name: 'Ghetto Eats' },
    { id: 'chic-on-chain', name: 'Chic-on-Chain' },
    { id: 'goldkey', name: 'GoldKey' },
  ];

  const categories = ['all', 'burgers', 'chicken', 'sides', 'drinks', 'desserts'];

  useEffect(() => {
    loadBrandMenu();
  }, [selectedBrand]);

  const loadBrandMenu = async () => {
    try {
      const items = await getCorporateMenu(selectedBrand);
      setMenuItems(items);
      setLoading(false);
    } catch (error) {
      console.error('Error loading menu:', error);
      setMenuItems([
        {
          id: '1',
          name: 'Classic Burger',
          description: 'Our signature burger',
          category: 'burgers',
          base_price: 12.99,
          active: true,
          brand_id: selectedBrand,
        },
        {
          id: '2',
          name: 'Crispy Chicken',
          description: 'Golden fried chicken',
          category: 'chicken',
          base_price: 10.99,
          active: true,
          brand_id: selectedBrand,
        },
      ]);
      setLoading(false);
    }
  };

  const handleUpdateItem = async () => {
    if (!editingItem) return;

    try {
      await updateMenuItem(editingItem.id, editingItem, authRepId);
      setMenuItems(menuItems.map((item) => (item.id === editingItem.id ? editingItem : item)));
      setEditingItem(null);
      alert('Menu item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      alert('Failed to update item');
    }
  };

  const toggleItemActive = async (itemId: string, active: boolean) => {
    try {
      const item = menuItems.find((i) => i.id === itemId);
      if (!item) return;

      await updateMenuItem(itemId, { ...item, active }, authRepId);
      setMenuItems(menuItems.map((i) => (i.id === itemId ? { ...i, active } : i)));
    } catch (error) {
      console.error('Error toggling item:', error);
    }
  };

  const filteredItems = menuItems.filter((item) =>
    selectedCategory === 'all' ? true : item.category === selectedCategory
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-xl text-gray-600">Loading menu...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Brand Menu Editor</h1>
          <p className="text-gray-600">Manage menu items across all locations for your brand</p>
        </div>

        <div className="mb-6 flex gap-4">
          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            {brands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name}
              </option>
            ))}
          </select>

          <div className="flex gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.active}
                    onChange={(e) => toggleItemActive(item.id, e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span className="text-xs text-gray-600">Active</span>
                </label>
              </div>

              <div className="mb-4">
                <div className="text-2xl font-bold text-gray-900">${item.base_price.toFixed(2)}</div>
                <div className="text-xs text-gray-500">Base Price</div>
              </div>

              <div className="mb-4">
                <div className="text-xs text-gray-500 mb-1">Category</div>
                <div className="text-sm font-medium text-gray-900">{item.category}</div>
              </div>

              <button
                onClick={() => setEditingItem(item)}
                className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit Item
              </button>
            </div>
          ))}
        </div>

        {editingItem && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Edit Menu Item</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                  <input
                    type="text"
                    value={editingItem.name}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingItem.description}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.filter((c) => c !== 'all').map((cat) => (
                        <option key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Base Price ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={editingItem.base_price}
                      onChange={(e) => setEditingItem({ ...editingItem, base_price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleUpdateItem}
                  className="flex-1 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
