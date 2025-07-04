import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './MenProducts.css';
import apiService from '../utils/apiService.js';

function MenProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    brand: [],
    type: [],
    color: [],
    style: [],
    priceMin: '',
    priceMax: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  const navigate = useNavigate();

  // Fetch products on component mount and when filters change
  useEffect(() => {
    fetchProducts();
  }, [filters, currentPage]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        category: 'Men',
        page: currentPage,
        limit: 6
      };

      // Add array filters
      if (filters.brand.length > 0) {
        params.brand = filters.brand.join(',');
      }
      if (filters.type.length > 0) {
        params.type = filters.type.join(',');
      }
      if (filters.color.length > 0) {
        params.color = filters.color.join(',');
      }
      if (filters.style.length > 0) {
        params.style = filters.style.join(',');
      }
      if (filters.priceMin) {
        params.minPrice = filters.priceMin;
      }
      if (filters.priceMax) {
        params.maxPrice = filters.priceMax;
      }

      const data = await apiService.getProducts(params);
      
      setProducts(data.products || []);
      setTotalPages(Math.ceil((data.total || 0) / 6));
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType, value, isChecked) => {
    setFilters(prev => {
      if (filterType === 'priceMin' || filterType === 'priceMax') {
        return {
          ...prev,
          [filterType]: value
        };
      }
      
      // Handle array filters (brand, type, color, style)
      const currentArray = prev[filterType] || [];
      let newArray;
      
      if (isChecked) {
        newArray = [...currentArray, value];
      } else {
        newArray = currentArray.filter(item => item !== value);
      }
      
      return {
        ...prev,
        [filterType]: newArray
      };
    });
    setCurrentPage(1); // Reset to first page when filters change
  };

  const formatPrice = (price) => {
    return price.toLocaleString();
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  return (
    <div className="men-products-page">
      <div className="men-products-layout">
        {/* Left Sidebar - Filters */}
        <aside className="men-products-sidebar">
          <div className="sidebar-content">
            <div className="category-breadcrumb">
              <span>Category / Men</span>
            </div>

            {/* Brand Filter */}
            <div className="filter-group">
              <h3 className="filter-heading">Brand</h3>
              <div className="search-box">
                <input type="text" placeholder="Search brands..." />
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <div className="filter-options">
                <label className="filter-option">
                  <input type="checkbox" value="Nike" onChange={(e) => handleFilterChange('brand', e.target.value, e.target.checked)} />
                  <span>Nike</span>
                </label>
                <label className="filter-option">
                  <input type="checkbox" value="Adidas" onChange={(e) => handleFilterChange('brand', e.target.value, e.target.checked)} />
                  <span>Adidas</span>
                </label>
                <label className="filter-option">
                  <input type="checkbox" value="Lacoste" onChange={(e) => handleFilterChange('brand', e.target.value, e.target.checked)} />
                  <span>Lacoste</span>
                </label>
                <label className="filter-option">
                  <input type="checkbox" value="Ralph Lauren" onChange={(e) => handleFilterChange('brand', e.target.value, e.target.checked)} />
                  <span>Ralph Lauren</span>
                </label>
              </div>
            </div>

            {/* Type Filter */}
            <div className="filter-group">
              <h3 className="filter-heading">Type</h3>
              <div className="search-box">
                <input type="text" placeholder="Search types..." />
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <div className="filter-options">
                <label className="filter-option">
                  <input type="checkbox" value="T-Shirt" onChange={(e) => handleFilterChange('type', e.target.value, e.target.checked)} />
                  <span>T-shirt</span>
                </label>
                <label className="filter-option">
                  <input type="checkbox" value="Shirt" onChange={(e) => handleFilterChange('type', e.target.value, e.target.checked)} />
                  <span>Formal Shirt</span>
                </label>
                <label className="filter-option">
                  <input type="checkbox" value="Polo" onChange={(e) => handleFilterChange('type', e.target.value, e.target.checked)} />
                  <span>Polo</span>
                </label>
                <label className="filter-option">
                  <input type="checkbox" value="Blazer" onChange={(e) => handleFilterChange('type', e.target.value, e.target.checked)} />
                  <span>Blazer</span>
                </label>
              </div>
            </div>

            {/* Color Filter */}
            <div className="filter-group">
              <h3 className="filter-heading">Color</h3>
              <div className="search-box">
                <input type="text" placeholder="Search colors..." />
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <div className="filter-options">
                <label className="filter-option">
                  <input type="checkbox" value="Black" onChange={(e) => handleFilterChange('color', e.target.value, e.target.checked)} />
                  <span>Black</span>
                </label>
                <label className="filter-option">
                  <input type="checkbox" value="White" onChange={(e) => handleFilterChange('color', e.target.value, e.target.checked)} />
                  <span>White</span>
                </label>
                <label className="filter-option">
                  <input type="checkbox" value="Gray" onChange={(e) => handleFilterChange('color', e.target.value, e.target.checked)} />
                  <span>Gray</span>
                </label>
                <label className="filter-option">
                  <input type="checkbox" value="Brown" onChange={(e) => handleFilterChange('color', e.target.value, e.target.checked)} />
                  <span>Brown</span>
                </label>
              </div>
            </div>

            {/* Style Filter */}
            <div className="filter-group">
              <h3 className="filter-heading">Style</h3>
              <div className="search-box">
                <input type="text" placeholder="Search styles..." />
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </div>
              <div className="filter-options">
                <label className="filter-option">
                  <input type="checkbox" value="Business" onChange={(e) => handleFilterChange('style', e.target.value, e.target.checked)} />
                  <span>Business</span>
                </label>
                <label className="filter-option">
                  <input type="checkbox" value="Casual" onChange={(e) => handleFilterChange('style', e.target.value, e.target.checked)} />
                  <span>Casual</span>
                </label>
                <label className="filter-option">
                  <input type="checkbox" value="Streetwear" onChange={(e) => handleFilterChange('style', e.target.value, e.target.checked)} />
                  <span>Streetwear</span>
                </label>
                <label className="filter-option">
                  <input type="checkbox" value="Sport" onChange={(e) => handleFilterChange('style', e.target.value, e.target.checked)} />
                  <span>Sport</span>
                </label>
              </div>
            </div>

            {/* Price Filter */}
            <div className="filter-group">
              <h3 className="filter-heading">Price</h3>
              <div className="price-range">
                <input 
                  type="text" 
                  placeholder="From"
                  value={filters.priceMin}
                  onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                />
                <span>-</span>
                <input 
                  type="text" 
                  placeholder="To"
                  value={filters.priceMax}
                  onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                />
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="men-products-main">
          {/* Header Section */}
          <div className="page-header">
            <h1 className="page-title">MEN'S WEAR</h1>
            <div className="instagram-promo">
              <div className="promo-text">
                <p>Direct to our Instagram</p>
                <p>to see more outfits</p>
              </div>
              <div className="promo-image">
                <img src="/assets/images/cta-banner.jpg" alt="Instagram promo" />
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="products-grid">
            {loading ? (
              <div className="loading">Loading products...</div>
            ) : products.length === 0 ? (
              <div className="no-products">No products found</div>
            ) : (
              products.map((product) => (
                <div 
                  key={product.id} 
                  className="product-card"
                  onClick={() => handleProductClick(product.id)}
                >
                  <div className="product-image">
                    <img 
                      src={getImageUrl(product.image)} 
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  <div className="product-info">
                    <h3 className="product-name">{product.name}</h3>
                    <p className="product-brand">{product.brand}</p>
                    <p className="product-price">{formatPrice(product.price)} VND</p>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button 
                className="next-btn"
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
              >
                NEXT &gt;
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default MenProducts;
