import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCart } from "../redux/action";
import { toggleWishlist } from "../store/wishlist/slice";
import ApiService from "../services/api";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { formatPrice } from "../utils/format";
import { useTranslation } from "react-i18next";

const Products = () => {
  const { t } = useTranslation();

  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // بحث + ترتيب
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("none");
  const [selectedCategory, setSelectedCategory] = useState("");

  // ترقيم الصفحات
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const dispatch = useDispatch();

  // حالة الـ Wishlist
  const wishlist = useSelector((s) => s.wishlist || []);
  const inWishlist = (id) => wishlist.some((w) => w.id === id);

  const addProduct = (product) => {
    const cartProduct = {
      id: product._id || product.id,
      title: product.title,
      price: product.price,
      image: product.image,
      category: product.category,
      rating: product.rating,
    };
    dispatch(addCart(cartProduct));
    toast.success(t("productCard.added_to_cart", "Added to cart"));
  };

  useEffect(() => {
    const tmr = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(tmr);
  }, [search]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const categoriesData = await ApiService.getCategories();
        if (!cancelled) setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const params = { page, limit: pageSize };
        if (debouncedSearch) params.q = debouncedSearch;
        if (selectedCategory) params.category = selectedCategory;
        if (sortBy !== "none") params.sort = sortBy;

        const response = await ApiService.getProducts(params);
        const items = Array.isArray(response) ? response : response.items || [];

        if (!cancelled) {
          const transformedProducts = items.map((p) => {
            const price = p.priceInFils / 1000;
            const oldPrice = p.oldPriceInFils ? p.oldPriceInFils / 1000 : null;
            const discountPercent =
              typeof p.discountPercent === "number"
                ? p.discountPercent
                : oldPrice && oldPrice > price
                ? Math.round((1 - price / oldPrice) * 100)
                : 0;

            return {
              id: p._id,
              title: p.title,
              price,
              oldPrice,
              discountPercent,
              image:
                p.image ||
                p.images?.find((img) => img.isPrimary)?.url ||
                p.images?.[0]?.url,
              category: p.category?.name,
              rating: p.rating,
              description: p.description || "",
            };
          });

          setData(transformedProducts);
          setTotalPages(response.totalPages ?? 1);
          setTotal(response.total ?? transformedProducts.length);
        }
      } catch (error) {
        console.error("Error loading products:", error);
        if (!cancelled) {
          setData([]);
          setTotal(0);
          setTotalPages(1);
          toast.error(t("errors.generic"));
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [page, pageSize, debouncedSearch, selectedCategory, sortBy]);

  const filterProduct = (categorySlugOrId) => {
    setSelectedCategory(categorySlugOrId);
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, sortBy, pageSize]);

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

  const from = total ? (page - 1) * pageSize + 1 : 0;
  const to = total ? Math.min(page * pageSize, total) : 0;

  return (
    <div className="container my-3 py-3">
      {/* العنوان */}
      <div className="row">
        <div className="col-12">
          <h2 className="display-5 text-center">{t("products.title")}</h2>
          <hr />
        </div>
      </div>

      {/* التصنيفات */}
      <div className="buttons text-center py-4">
        <button
          className={`btn btn-sm m-2 ${!selectedCategory ? "btn-dark" : "btn-outline-dark"}`}
          onClick={() => filterProduct("")}
          type="button"
          disabled={loading}
        >
          {t("products.all", "All")}
        </button>
        {categories.map((category) => (
          <button
            key={category._id}
            className={`btn btn-sm m-2 ${
              selectedCategory === category.slug ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => filterProduct(category.slug)}
            type="button"
            disabled={loading}
          >
            {category.name}
          </button>
        ))}
      </div>

      {/* البحث + الترتيب + حجم الصفحة + عدّاد */}
      <div className="d-flex flex-wrap justify-content-center gap-2 pb-3">
        <input
          className="form-control"
          style={{ maxWidth: 280 }}
          placeholder={t("products.search_placeholder")}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className="form-select"
          style={{ maxWidth: 220 }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          disabled={loading}
        >
          <option value="none">{t("products.sort_featured", "Sort: Featured")}</option>
          <option value="priceAsc">{t("products.sort_price_asc")}</option>
          <option value="priceDesc">{t("products.sort_price_desc")}</option>
          <option value="ratingDesc">{t("products.sort_rating_desc", "Rating: High to Low")}</option>
          <option value="titleAsc">{t("products.sort_title_asc", "Title: A → Z")}</option>
        </select>

        <select
          className="form-select"
          style={{ maxWidth: 160 }}
          value={pageSize}
          onChange={(e) => setPageSize(Number(e.target.value))}
          disabled={loading}
        >
          <option value={6}>{t("products.per_page", { count: 6, defaultValue: "{{count}} / page" })}</option>
          <option value={9}>{t("products.per_page", { count: 9, defaultValue: "{{count}} / page" })}</option>
          <option value={12}>{t("products.per_page", { count: 12, defaultValue: "{{count}} / page" })}</option>
        </select>

        <div className="align-self-center text-muted ms-2">
          {total > 0
            ? t("products.showing", {
                from,
                to,
                total,
                defaultValue: "Showing {{from}}–{{to}} of {{total}}",
              })
            : loading
            ? t("ui.loading", "Loading...")
            : t("products.no_results")}
        </div>
      </div>

      {/* الشبكة */}
      <div className="row justify-content-center">
        {loading ? (
          <LoadingView />
        ) : data.length === 0 ? (
          <div className="col-12 text-center py-5">
            <h4>{t("products.no_results")}</h4>
            <p className="text-muted">{t("products.try_adjust_filters", "Try adjusting your search or filters")}</p>
          </div>
        ) : (
          data.map((product) => {
            const wished = inWishlist(product.id);
            return (
              <div id={product.id} key={product.id} className="col-md-4 col-sm-6 col-12 mb-4">
                <div className="card text-center h-100 d-flex">
                  {/* صورة + شارة الخصم */}
                  <div
                    className="p-3 position-relative"
                    style={{
                      height: 300,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {product.discountPercent > 0 && (
                      <span className="badge bg-danger position-absolute top-0 start-0 m-2">
                        -{product.discountPercent}%
                      </span>
                    )}
                    {/* الصورة صارت clickable */}
                    <Link to={`/product/${product.id}`} aria-label={`View ${product.title}`} style={{ cursor: "pointer" }}>
                      <img
                        className="img-fluid"
                        src={product.image || "/placeholder-image.jpg"}
                        alt={product.title}
                        style={{ maxHeight: "100%" }}
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder-image.jpg";
                        }}
                      />
                    </Link>
                  </div>

                  <div className="card-body d-flex flex-column">
                    <h5 className="card-title">
                      {product.title.length > 40 ? product.title.substring(0, 40) + "..." : product.title}
                    </h5>
                    <p className="text-muted mb-2" title={`${t("products.rating_label", "Rating")}: ${product.rating?.rate ?? 0}`}>
                      ★ {product.rating?.rate ?? 0}
                    </p>

                    <div className="mt-auto">
                      <div className="mb-2">
                        {product.oldPrice ? (
                          <>
                            <small className="text-muted text-decoration-line-through me-2">
                              {formatPrice(product.oldPrice)}
                            </small>
                            <span className="lead">{formatPrice(product.price)}</span>
                          </>
                        ) : (
                          <span className="lead">{formatPrice(product.price)}</span>
                        )}
                      </div>

                      <div className="d-flex justify-content-center gap-2">
                        <Link to={`/product/${product.id}`} className="btn btn-outline-dark btn-sm">
                          {t("product.details", "Details")}
                        </Link>

                        <button className="btn btn-dark btn-sm" type="button" onClick={() => addProduct(product)}>
                          {t("productCard.add_to_cart")}
                        </button>

                        <button
                          type="button"
                          className={`btn ${wished ? "btn-danger" : "btn-outline-danger"} btn-sm`}
                          title={wished ? t("wishlist.remove_title", "Remove from Wishlist") : t("wishlist.add_title", "Add to Wishlist")}
                          aria-pressed={wished}
                          aria-label={wished ? t("wishlist.remove_title", "Remove from wishlist") : t("wishlist.add_title", "Add to wishlist")}
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(toggleWishlist(product));
                            toast.success(wished ? t("wishlist.removed", "Removed from wishlist") : t("wishlist.added", "Added to wishlist"));
                          }}
                        >
                          <i className={`fa ${wished ? "fa-heart" : "fa-heart-o"} me-1`} />
                          <span className="d-none d-sm-inline">
                            {wished ? t("wishlist.in_wishlist", "Wishlisted") : t("wishlist.wishlist", "Wishlist")}
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

      {totalPages > 1 && (
        <nav aria-label="Products pages" className="mt-2">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={loading}
              >
                {t("ui.prev", "« Prev")}
              </button>
            </li>

            {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
              let pageNum;
              if (totalPages <= 5) pageNum = i + 1;
              else if (page <= 3) pageNum = i + 1;
              else if (page >= totalPages - 2) pageNum = totalPages - 4 + i;
              else pageNum = page - 2 + i;

              return (
                <li key={pageNum} className={`page-item ${pageNum === page ? "active" : ""}`}>
                  <button type="button" className="page-link" onClick={() => setPage(pageNum)} disabled={loading}>
                    {pageNum}
                  </button>
                </li>
              );
            })}

            <li className={`page-item ${page === totalPages ? "disabled" : ""}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={loading}
              >
                {t("ui.next", "Next »")}
              </button>
            </li>
          </ul>
        </nav>
      )}
    </div>
  );
};

export default Products;
