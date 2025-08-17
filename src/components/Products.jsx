import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCart } from "../redux/action";
import { toggleWishlist } from "../store/wishlist/slice";
import ApiService from "../services/api";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { formatPrice } from "../utils/format";

const Products = () => {
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // بحث + ترتيب
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("none"); // none | priceAsc | priceDesc | ratingDesc | titleAsc
  const [selectedCategory, setSelectedCategory] = useState("");

  // ترقيم الصفحات
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // 6 / 9 / 12
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const mounted = useRef(true);
  const dispatch = useDispatch();

  // حالة الـ Wishlist
  const wishlist = useSelector((s) => s.wishlist || []);
  const inWishlist = (id) => wishlist.some((w) => w.id === id);

  const addProduct = (product) => {
    // Convert backend product format to frontend format
    const cartProduct = {
      id: product._id || product.id,
      title: product.title,
      price: product.price, // Already converted from fils
      image: product.image,
      category: product.category,
      rating: product.rating
    };
    dispatch(addCart(cartProduct));
    toast.success("Added to cart");
  };

  // Load categories
  useEffect(() => {
    const getCategories = async () => {
      try {
        const categoriesData = await ApiService.getCategories();
        if (mounted.current) {
          setCategories(categoriesData);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    getCategories();
  }, []);

  // Load products
  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const params = {
          page,
          limit: pageSize,
        };
        
        if (search) params.q = search;
        if (selectedCategory) params.category = selectedCategory;
        if (sortBy !== 'none') params.sort = sortBy;

        const response = await ApiService.getProducts(params);
        
        if (mounted.current) {
          // Transform backend data to frontend format
          const transformedProducts = response.items.map(product => ({
            id: product._id,
            title: product.title,
            price: product.priceInFils / 1000, // Convert fils to KWD
            image: product.image || product.images?.find(img => img.isPrimary)?.url || product.images?.[0]?.url,
            category: product.category?.name,
            rating: product.rating,
            description: product.description || ''
          }));
          
          setData(transformedProducts);
          setTotalPages(response.totalPages);
          setTotal(response.total);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error loading products:', error);
        if (mounted.current) {
          setLoading(false);
          toast.error('Failed to load products');
        }
      }
    };

    getProducts();
    return () => {
      mounted.current = false;
    };
  }, [page, pageSize, search, selectedCategory, sortBy]);

  const filterProduct = (categorySlug) => {
    setSelectedCategory(categorySlug);
    setPage(1);
  };

  // Reset page when search/sort changes
  useEffect(() => {
    setPage(1);
  }, [search, sortBy, pageSize]);

  const LoadingView = () => (
    <>
      <div className="col-12 py-5 text-center">
        <Skeleton height={40} width={560} />
      </div>
      {[...Array(6)].map((_, i) => (
        <div key={i} className="col-md-4 col-sm-6 col-12 mb-4">
          <Skeleton height={592} />
        </div>
      ))}
    </>
  );

  return (
    <div className="container my-3 py-3">
      <div className="row">
        <div className="col-12">
          <h2 className="display-5 text-center">Latest Products</h2>
          <hr />
        </div>
      </div>

      {/* أزرار التصنيفات */}
      {!loading && (
        <div className="buttons text-center py-4">
          <button
            className={`btn btn-sm m-2 ${!selectedCategory ? 'btn-dark' : 'btn-outline-dark'}`}
            onClick={() => filterProduct("")}
            type="button"
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              className={`btn btn-sm m-2 ${selectedCategory === category.slug ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => filterProduct(category.slug)}
              type="button"
            >
              {category.name}
            </button>
          ))}
        </div>
      )}

      {/* أدوات البحث + الترتيب + حجم الصفحة + عدّاد */}
      {!loading && (
        <div className="d-flex flex-wrap justify-content-center gap-2 pb-3">
          <input
            className="form-control"
            style={{ maxWidth: 280 }}
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="form-select"
            style={{ maxWidth: 220 }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="none">Sort: Featured</option>
            <option value="priceAsc">Price: Low → High</option>
            <option value="priceDesc">Price: High → Low</option>
            <option value="ratingDesc">Rating: High → Low</option>
            <option value="titleAsc">Title: A → Z</option>
          </select>
          <select
            className="form-select"
            style={{ maxWidth: 140 }}
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={6}>6 / page</option>
            <option value={9}>9 / page</option>
            <option value={12}>12 / page</option>
          </select>
          <div className="align-self-center text-muted ms-2">
            {total > 0
              ? `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, total)} of ${total}`
              : "No results"}
          </div>
        </div>
      )}

      <div className="row justify-content-center">
        {loading ? (
          <LoadingView />
        ) : data.length === 0 ? (
          <div className="col-12 text-center py-5">
            <h4>No products found</h4>
            <p className="text-muted">Try adjusting your search or filters</p>
          </div>
        ) : (
          data.map((product) => {
            const wished = inWishlist(product.id);
            return (
              <div
                id={product.id}
                key={product.id}
                className="col-md-4 col-sm-6 col-12 mb-4"
              >
                <div className="card text-center h-100 d-flex">
                  <div
                    className="p-3"
                    style={{
                      height: 300,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <img
                      className="img-fluid"
                      src={product.image || '/placeholder-image.jpg'}
                      alt={product.title}
                      style={{ maxHeight: "100%" }}
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>

                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">
                      {product.title.length > 40
                        ? product.title.substring(0, 40) + "..."
                        : product.title}
                    </h5>
                    <p
                      className="text-muted mb-2"
                      title={`Rating: ${product.rating?.rate ?? 0}`}
                    >
                      ★ {product.rating?.rate ?? 0}
                    </p>

                    <div className="mt-auto">
                      <div className="lead mb-2">
                        {formatPrice(product.price)}
                      </div>

                      {/* الأزرار: التفاصيل / إضافة للسلة / المفضلة */}
                      <div className="d-flex justify-content-center gap-2">
                        <Link
                          to={`/product/${product.id}`}
                          className="btn btn-outline-dark btn-sm"
                        >
                          Details
                        </Link>

                        <button
                          className="btn btn-dark btn-sm"
                          type="button"
                          onClick={() => addProduct(product)}
                        >
                          Add to Cart
                        </button>

                        <button
                          type="button"
                          className={`btn ${wished ? "btn-danger" : "btn-outline-danger"} btn-sm`}
                          title={wished ? "Remove from Wishlist" : "Add to Wishlist"}
                          aria-pressed={wished}
                          aria-label={wished ? "Remove from wishlist" : "Add to wishlist"}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(toggleWishlist(product));
                            toast.success(wished ? "Removed from wishlist" : "Added to wishlist");
                          }}
                        >
                          <i className={`fa ${wished ? "fa-heart" : "fa-heart-o"} me-1`} />
                          <span className="d-none d-sm-inline">
                            {wished ? "Wishlisted" : "Wishlist"}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* أزرار الترقيم */}
      {!loading && totalPages > 1 && (
        <nav aria-label="Products pages" className="mt-2">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                « Prev
              </button>
            </li>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }

              return (
                <li
                  key={pageNum}
                  className={`page-item ${pageNum === page ? "active" : ""}`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                </li>
              );
            })}

            <li
              className={`page-item ${page === totalPages ? "disabled" : ""}`}
            >
              <button
                type="button"
                className="page-link"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next »
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Products;

