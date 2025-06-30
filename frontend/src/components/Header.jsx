import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

function Header() {
  // Existing search functionality state
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  
  // Advanced mega menu state
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const [activeMasterCategory, setActiveMasterCategory] = useState('thuong-hieu'); // Default to brands
  
  const searchRef = useRef(null);
  const megaMenuRef = useRef(null);
  const navigate = useNavigate();

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target)) {
        setActiveMegaMenu(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Existing search functions (keeping your original functionality)
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.length > 1) {
      setIsLoading(true);
      setShowResults(true);
      fetchSearchResults(value);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const fetchSearchResults = (query) => {
    fetch(`http://localhost:5000/api/products/search?q=${encodeURIComponent(query)}&limit=5`)
      .then(res => res.json())
      .then(data => {
        setSearchResults(data.products || []);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Search error:', err);
        setIsLoading(false);
      });
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    setShowResults(false);
    setSearchTerm('');
  };

  const handleViewMoreClick = () => {
    navigate(`/search?q=${encodeURIComponent(searchTerm)}`);
    setShowResults(false);
  };

  const formatPrice = (price) => {
    return price.toLocaleString();
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:5000${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;
  };

  // Enhanced mega menu data structure with dynamic content
  const megaMenuData = {
    men: {
      masterCategories: [
        {
          id: 'thuong-hieu',
          name: 'Thương hiệu',
          isDefault: true
        },
        {
          id: 'bo-suu-tap-moi',
          name: 'Bộ sưu tập mới'
        },
        {
          id: 'trang-phuc',
          name: 'Trang phục'
        },
        {
          id: 'tui-vi',
          name: 'Túi ví'
        },
        {
          id: 'giay-dep',
          name: 'Giày dép'
        },
        {
          id: 'phu-kien',
          name: 'Phụ kiện'
        },
        {
          id: 'sale',
          name: 'SALE',
          isHighlighted: true
        }
      ],
      detailContent: {
        'thuong-hieu': [
          { name: 'KENZO', link: '/men/brands/kenzo' },
          { name: 'BOSS', link: '/men/brands/boss' },
          { name: 'HUGO', link: '/men/brands/hugo' },
          { name: 'Nike', link: '/men/brands/nike' },
          { name: 'Adidas', link: '/men/brands/adidas' },
          { name: 'Gucci', link: '/men/brands/gucci' },
          { name: 'Polo Ralph Lauren', link: '/men/brands/polo-ralph-lauren' },
          { name: 'Tommy Hilfiger', link: '/men/brands/tommy-hilfiger' }
        ],
        'bo-suu-tap-moi': [
          { name: 'KENZO: High Summer 2025', link: '/men/collections/kenzo-summer-2025' },
          { name: 'Hugo x RB Capsule', link: '/men/collections/hugo-rb' },
          { name: 'Porsche x BOSS', link: '/men/collections/porsche-boss' },
          { name: 'Nike Air Max 2025', link: '/men/collections/nike-air-max-2025' },
          { name: 'Adidas Originals 2025', link: '/men/collections/adidas-originals-2025' },
          { name: 'Gucci Spring Collection', link: '/men/collections/gucci-spring' }
        ],
        'trang-phuc': [
          { name: 'Áo polo', link: '/men/clothing/polo-shirts' },
          { name: 'Áo sơ mi', link: '/men/clothing/shirts' },
          { name: 'Áo thun', link: '/men/clothing/t-shirts' },
          { name: 'Áo khoác', link: '/men/clothing/jackets' },
          { name: 'Quần jean', link: '/men/clothing/jeans' },
          { name: 'Quần tây', link: '/men/clothing/trousers' },
          { name: 'Quần short', link: '/men/clothing/shorts' },
          { name: 'Đồ thể thao', link: '/men/clothing/sportswear' },
          { name: 'Áo vest', link: '/men/clothing/suits' },
          { name: 'Áo hoodie', link: '/men/clothing/hoodies' }
        ],
        'tui-vi': [
          { name: 'Túi xách tay', link: '/men/bags/handbags' },
          { name: 'Túi đeo chéo', link: '/men/bags/crossbody' },
          { name: 'Balo', link: '/men/bags/backpacks' },
          { name: 'Ví nam', link: '/men/bags/wallets' },
          { name: 'Túi công sở', link: '/men/bags/briefcases' },
          { name: 'Túi du lịch', link: '/men/bags/travel-bags' },
          { name: 'Túi thể thao', link: '/men/bags/gym-bags' }
        ],
        'giay-dep': [
          { name: 'Giày thể thao', link: '/men/shoes/sneakers' },
          { name: 'Giày tây', link: '/men/shoes/dress-shoes' },
          { name: 'Giày boots', link: '/men/shoes/boots' },
          { name: 'Giày lười', link: '/men/shoes/loafers' },
          { name: 'Dép', link: '/men/shoes/sandals' },
          { name: 'Giày chạy bộ', link: '/men/shoes/running' },
          { name: 'Giày canvas', link: '/men/shoes/canvas' }
        ],
        'phu-kien': [
          { name: 'Đồng hồ', link: '/men/accessories/watches' },
          { name: 'Kính mát', link: '/men/accessories/sunglasses' },
          { name: 'Thắt lưng', link: '/men/accessories/belts' },
          { name: 'Cà vạt', link: '/men/accessories/ties' },
          { name: 'Mũ nón', link: '/men/accessories/hats' },
          { name: 'Vớ', link: '/men/accessories/socks' },
          { name: 'Khăn quàng', link: '/men/accessories/scarves' }
        ],
        'sale': [
          { name: 'Áo polo giảm giá', link: '/men/sale/polo-shirts', discount: '30%' },
          { name: 'Quần jean sale', link: '/men/sale/jeans', discount: '40%' },
          { name: 'Giày thể thao sale', link: '/men/sale/sneakers', discount: '25%' },
          { name: 'Túi xách sale', link: '/men/sale/bags', discount: '35%' },
          { name: 'Phụ kiện sale', link: '/men/sale/accessories', discount: '20%' },
          { name: 'Đồng hồ sale', link: '/men/sale/watches', discount: '50%' }
        ]
      }
    },
    ladies: {
      masterCategories: [
        {
          id: 'thuong-hieu',
          name: 'Thương hiệu',
          isDefault: true
        },
        {
          id: 'bo-suu-tap-moi',
          name: 'Bộ sưu tập mới'
        },
        {
          id: 'trang-phuc',
          name: 'Trang phục'
        },
        {
          id: 'tui-vi',
          name: 'Túi ví'
        },
        {
          id: 'giay-dep',
          name: 'Giày dép'
        },
        {
          id: 'phu-kien',
          name: 'Phụ kiện'
        },
        {
          id: 'sale',
          name: 'SALE',
          isHighlighted: true
        }
      ],
      detailContent: {
        'thuong-hieu': [
          { name: 'KENZO', link: '/ladies/brands/kenzo' },
          { name: 'Sandro', link: '/ladies/brands/sandro' },
          { name: 'Maison Kitsuné', link: '/ladies/brands/maison-kitsune' },
          { name: 'acme de la vie', link: '/ladies/brands/acme-de-la-vie' },
          { name: 'Chanel', link: '/ladies/brands/chanel' },
          { name: 'Dior', link: '/ladies/brands/dior' },
          { name: 'Gucci', link: '/ladies/brands/gucci' },
          { name: 'Prada', link: '/ladies/brands/prada' }
        ],
        'bo-suu-tap-moi': [
          { name: 'Sandro Spring 2025', link: '/ladies/collections/sandro-spring-2025' },
          { name: 'KENZO Floral Collection', link: '/ladies/collections/kenzo-floral' },
          { name: 'Maison Kitsuné Casual', link: '/ladies/collections/maison-kitsune-casual' },
          { name: 'Chanel Cruise Collection', link: '/ladies/collections/chanel-cruise' }
        ],
        'trang-phuc': [
          { name: 'Váy', link: '/ladies/clothing/dresses' },
          { name: 'Áo blouse', link: '/ladies/clothing/blouses' },
          { name: 'Áo thun', link: '/ladies/clothing/t-shirts' },
          { name: 'Áo khoác', link: '/ladies/clothing/jackets' },
          { name: 'Quần jean', link: '/ladies/clothing/jeans' },
          { name: 'Chân váy', link: '/ladies/clothing/skirts' },
          { name: 'Đồ công sở', link: '/ladies/clothing/office-wear' },
          { name: 'Đầm dạ hội', link: '/ladies/clothing/evening-dresses' }
        ],
        'tui-vi': [
          { name: 'Túi xách tay', link: '/ladies/bags/handbags' },
          { name: 'Túi đeo chéo', link: '/ladies/bags/crossbody' },
          { name: 'Clutch', link: '/ladies/bags/clutches' },
          { name: 'Ví nữ', link: '/ladies/bags/wallets' },
          { name: 'Túi tote', link: '/ladies/bags/tote-bags' },
          { name: 'Túi mini', link: '/ladies/bags/mini-bags' }
        ],
        'giay-dep': [
          { name: 'Giày cao gót', link: '/ladies/shoes/heels' },
          { name: 'Giày bệt', link: '/ladies/shoes/flats' },
          { name: 'Giày thể thao', link: '/ladies/shoes/sneakers' },
          { name: 'Boots', link: '/ladies/shoes/boots' },
          { name: 'Sandal', link: '/ladies/shoes/sandals' },
          { name: 'Giày oxford', link: '/ladies/shoes/oxfords' }
        ],
        'phu-kien': [
          { name: 'Đồng hồ', link: '/ladies/accessories/watches' },
          { name: 'Trang sức', link: '/ladies/accessories/jewelry' },
          { name: 'Kính mát', link: '/ladies/accessories/sunglasses' },
          { name: 'Khăn quàng', link: '/ladies/accessories/scarves' },
          { name: 'Mũ nón', link: '/ladies/accessories/hats' },
          { name: 'Vớ tất', link: '/ladies/accessories/hosiery' }
        ],
        'sale': [
          { name: 'Váy sale', link: '/ladies/sale/dresses', discount: '45%' },
          { name: 'Túi xách sale', link: '/ladies/sale/bags', discount: '30%' },
          { name: 'Giày sale', link: '/ladies/sale/shoes', discount: '35%' },
          { name: 'Phụ kiện sale', link: '/ladies/sale/accessories', discount: '25%' },
          { name: 'Trang sức sale', link: '/ladies/sale/jewelry', discount: '40%' }
        ]
      }
    },
    accessories: {
      masterCategories: [
        {
          id: 'thuong-hieu',
          name: 'Thương hiệu',
          isDefault: true
        },
        {
          id: 'dong-ho',
          name: 'Đồng hồ'
        },
        {
          id: 'trang-suc',
          name: 'Trang sức'
        },
        {
          id: 'kinh-mat',
          name: 'Kính mát'
        },
        {
          id: 'phu-kien-khac',
          name: 'Phụ kiện khác'
        },
        {
          id: 'sale',
          name: 'SALE',
          isHighlighted: true
        }
      ],
      detailContent: {
        'thuong-hieu': [
          { name: 'KENZO', link: '/accessories/brands/kenzo' },
          { name: 'BOSS', link: '/accessories/brands/boss' },
          { name: 'Rolex', link: '/accessories/brands/rolex' },
          { name: 'Cartier', link: '/accessories/brands/cartier' },
          { name: 'Ray-Ban', link: '/accessories/brands/ray-ban' }
        ],
        'dong-ho': [
          { name: 'Đồng hồ nam', link: '/accessories/watches/men' },
          { name: 'Đồng hồ nữ', link: '/accessories/watches/women' },
          { name: 'Đồng hồ thông minh', link: '/accessories/watches/smart' },
          { name: 'Đồng hồ cơ', link: '/accessories/watches/mechanical' },
          { name: 'Đồng hồ thể thao', link: '/accessories/watches/sports' }
        ],
        'trang-suc': [
          { name: 'Nhẫn', link: '/accessories/jewelry/rings' },
          { name: 'Dây chuyền', link: '/accessories/jewelry/necklaces' },
          { name: 'Hoa tai', link: '/accessories/jewelry/earrings' },
          { name: 'Lắc tay', link: '/accessories/jewelry/bracelets' },
          { name: 'Cài áo', link: '/accessories/jewelry/brooches' }
        ],
        'kinh-mat': [
          { name: 'Kính nam', link: '/accessories/sunglasses/men' },
          { name: 'Kính nữ', link: '/accessories/sunglasses/women' },
          { name: 'Kính thể thao', link: '/accessories/sunglasses/sports' },
          { name: 'Kính vintage', link: '/accessories/sunglasses/vintage' }
        ],
        'phu-kien-khac': [
          { name: 'Thắt lưng', link: '/accessories/others/belts' },
          { name: 'Cà vạt', link: '/accessories/others/ties' },
          { name: 'Khăn quàng', link: '/accessories/others/scarves' },
          { name: 'Mũ nón', link: '/accessories/others/hats' }
        ],
        'sale': [
          { name: 'Đồng hồ sale', link: '/accessories/sale/watches', discount: '50%' },
          { name: 'Trang sức sale', link: '/accessories/sale/jewelry', discount: '40%' },
          { name: 'Kính mát sale', link: '/accessories/sale/sunglasses', discount: '30%' }
        ]
      }
    },
    services: {
      masterCategories: [
        {
          id: 'khach-hang',
          name: 'Dịch vụ khách hàng',
          isDefault: true
        },
        {
          id: 'mua-hang',
          name: 'Hướng dẫn mua hàng'
        },
        {
          id: 'chinh-sach',
          name: 'Chính sách'
        },
        {
          id: 'lien-he',
          name: 'Liên hệ'
        }
      ],
      detailContent: {
        'khach-hang': [
          { name: 'Hỗ trợ 24/7', link: '/services/support' },
          { name: 'Chat trực tuyến', link: '/services/live-chat' },
          { name: 'Hotline', link: '/services/hotline' },
          { name: 'Email hỗ trợ', link: '/services/email-support' }
        ],
        'mua-hang': [
          { name: 'Hướng dẫn chọn size', link: '/services/size-guide' },
          { name: 'Cách đặt hàng', link: '/services/how-to-order' },
          { name: 'Phương thức thanh toán', link: '/services/payment-methods' },
          { name: 'Theo dõi đơn hàng', link: '/services/order-tracking' }
        ],
        'chinh-sach': [
          { name: 'Chính sách đổi trả', link: '/services/return-policy' },
          { name: 'Chính sách giao hàng', link: '/services/delivery-policy' },
          { name: 'Chính sách bảo mật', link: '/services/privacy-policy' },
          { name: 'Điều khoản sử dụng', link: '/services/terms-of-use' }
        ],
        'lien-he': [
          { name: 'Thông tin liên hệ', link: '/services/contact-info' },
          { name: 'Địa chỉ cửa hàng', link: '/services/store-locations' },
          { name: 'Giờ mở cửa', link: '/services/opening-hours' },
          { name: 'Bản đồ', link: '/services/map' }
        ]
      }
    }
  };

  // Handle mega menu toggle
  const handleMegaMenuToggle = (menuKey) => {
    if (activeMegaMenu === menuKey) {
      setActiveMegaMenu(null);
    } else {
      setActiveMegaMenu(menuKey);
      // Reset to default master category when opening a new mega menu
      setActiveMasterCategory('thuong-hieu');
    }
  };

  // Handle master category hover (dynamic content switching)
  const handleMasterCategoryHover = (categoryId) => {
    setActiveMasterCategory(categoryId);
  };

  // Handle navigation click
  const handleNavClick = (e, menuKey) => {
    e.preventDefault();
    handleMegaMenuToggle(menuKey);
  };

  // Close mega menu when clicking detail items
  const handleDetailItemClick = () => {
    setActiveMegaMenu(null);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo farro-font">
          <Link to="/">TEXTURA</Link>
        </div>
        <nav className="main-nav" ref={megaMenuRef}>
          <ul className="nav-list">
            {/* Men Category with Advanced Mega Menu */}
            <li className="nav-item montserrat-font mega-menu-parent">
              <a 
                href="#" 
                onClick={(e) => handleNavClick(e, 'men')}
                className={activeMegaMenu === 'men' ? 'active' : ''}
              >
                Men
              </a>
              {activeMegaMenu === 'men' && (
                <div className="mega-menu-panel">
                  <div className="mega-menu-content">
                    {/* Master Categories Column (Left) */}
                    <div className="mega-menu-master">
                      <ul className="master-category-list">
                        {megaMenuData.men.masterCategories.map((category) => (
                          <li 
                            key={category.id} 
                            className={`master-category-item ${activeMasterCategory === category.id ? 'active' : ''} ${category.isHighlighted ? 'highlighted' : ''}`}
                            onMouseEnter={() => handleMasterCategoryHover(category.id)}
                          >
                            <span className="master-category-name">
                              {category.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    {/* Detail Content Area (Right) */}
                    <div className="mega-menu-detail">
                      <ul className="detail-item-list">
                        {megaMenuData.men.detailContent[activeMasterCategory]?.map((item, index) => (
                          <li key={index} className="detail-item">
                            <Link 
                              to={item.link} 
                              onClick={handleDetailItemClick}
                              className="detail-item-link"
                            >
                              {item.name}
                              {item.discount && <span className="discount-badge">-{item.discount}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </li>

            {/* Ladies Category with Advanced Mega Menu */}
            <li className="nav-item montserrat-font mega-menu-parent">
              <a 
                href="#" 
                onClick={(e) => handleNavClick(e, 'ladies')}
                className={activeMegaMenu === 'ladies' ? 'active' : ''}
              >
                Ladies
              </a>
              {activeMegaMenu === 'ladies' && (
                <div className="mega-menu-panel">
                  <div className="mega-menu-content">
                    <div className="mega-menu-master">
                      <ul className="master-category-list">
                        {megaMenuData.ladies.masterCategories.map((category) => (
                          <li 
                            key={category.id} 
                            className={`master-category-item ${activeMasterCategory === category.id ? 'active' : ''} ${category.isHighlighted ? 'highlighted' : ''}`}
                            onMouseEnter={() => handleMasterCategoryHover(category.id)}
                          >
                            <span className="master-category-name">
                              {category.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mega-menu-detail">
                      <ul className="detail-item-list">
                        {megaMenuData.ladies.detailContent[activeMasterCategory]?.map((item, index) => (
                          <li key={index} className="detail-item">
                            <Link 
                              to={item.link} 
                              onClick={handleDetailItemClick}
                              className="detail-item-link"
                            >
                              {item.name}
                              {item.discount && <span className="discount-badge">-{item.discount}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </li>

            {/* Accessories Category with Advanced Mega Menu */}
            <li className="nav-item montserrat-font mega-menu-parent">
              <a 
                href="#" 
                onClick={(e) => handleNavClick(e, 'accessories')}
                className={activeMegaMenu === 'accessories' ? 'active' : ''}
              >
                Accessories
              </a>
              {activeMegaMenu === 'accessories' && (
                <div className="mega-menu-panel">
                  <div className="mega-menu-content">
                    <div className="mega-menu-master">
                      <ul className="master-category-list">
                        {megaMenuData.accessories.masterCategories.map((category) => (
                          <li 
                            key={category.id} 
                            className={`master-category-item ${activeMasterCategory === category.id ? 'active' : ''} ${category.isHighlighted ? 'highlighted' : ''}`}
                            onMouseEnter={() => handleMasterCategoryHover(category.id)}
                          >
                            <span className="master-category-name">
                              {category.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mega-menu-detail">
                      <ul className="detail-item-list">
                        {megaMenuData.accessories.detailContent[activeMasterCategory]?.map((item, index) => (
                          <li key={index} className="detail-item">
                            <Link 
                              to={item.link} 
                              onClick={handleDetailItemClick}
                              className="detail-item-link"
                            >
                              {item.name}
                              {item.discount && <span className="discount-badge">-{item.discount}</span>}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </li>

            {/* Services Category with Advanced Mega Menu */}
            <li className="nav-item montserrat-font mega-menu-parent">
              <a 
                href="#" 
                onClick={(e) => handleNavClick(e, 'services')}
                className={activeMegaMenu === 'services' ? 'active' : ''}
              >
                Services
              </a>
              {activeMegaMenu === 'services' && (
                <div className="mega-menu-panel">
                  <div className="mega-menu-content">
                    <div className="mega-menu-master">
                      <ul className="master-category-list">
                        {megaMenuData.services.masterCategories.map((category) => (
                          <li 
                            key={category.id} 
                            className={`master-category-item ${activeMasterCategory === category.id ? 'active' : ''}`}
                            onMouseEnter={() => handleMasterCategoryHover(category.id)}
                          >
                            <span className="master-category-name">
                              {category.name}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mega-menu-detail">
                      <ul className="detail-item-list">
                        {megaMenuData.services.detailContent[activeMasterCategory]?.map((item, index) => (
                          <li key={index} className="detail-item">
                            <Link 
                              to={item.link} 
                              onClick={handleDetailItemClick}
                              className="detail-item-link"
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </li>
          </ul>
        </nav>
        
        {/* Keeping your existing search functionality exactly as is */}
        <div className="header-icons">
          <div className="search-container" ref={searchRef}>
            <input 
              type="text" 
              className="search-input" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={() => searchTerm.length > 1 && setShowResults(true)}
            />
            <a href="#" className="icon-link search-icon" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </a>

            {/* Your existing search results dropdown */}
            {showResults && (
              <div className="header-search-results">
                <h3 className="search-results-title">PRODUCTS</h3>
                {isLoading ? (
                  <div className="search-loading">Searching...</div>
                ) : searchResults.length === 0 ? (
                  <div className="no-search-results">No products found</div>
                ) : (
                  <>
                    <ul className="header-product-results">
                      {searchResults.map(product => (
                        <li 
                          key={product.id} 
                          className="header-product-result-item"
                          onClick={() => handleProductClick(product.id)}
                        >
                          <div className="header-product-result-image">
                            <img src={getImageUrl(product.image)} alt={product.name} />
                          </div>
                          <div className="header-product-result-details">
                            <div className="header-product-result-category">
                              {product.category} {product.subcategory}
                            </div>
                            <div className="header-product-result-name">{product.name}</div>
                            <div className="header-product-result-price">
                              ₩{formatPrice(product.price)}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                    
                    <div className="header-view-more-container">
                      <button 
                        className="header-view-more-btn"
                        onClick={handleViewMoreClick}
                      >
                        View More
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;