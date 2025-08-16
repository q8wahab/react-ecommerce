import React, { useState, useEffect, useMemo, useRef } from "react";
import { useDispatch } from "react-redux";
import { addCart } from "../redux/action";

import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { formatPrice } from "../utils/format";

const Products = () => {
  const [data, setData] = useState([]);
  const [filter, setFilter] = useState([]);
  const [loading, setLoading] = useState(false);

  // بحث + ترتيب
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("none"); // none | priceAsc | priceDesc | ratingDesc | titleAsc

  // ترقيم الصفحات
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9); // 6 / 9 / 12

  const mounted = useRef(true);
  const dispatch = useDispatch();

  const addProduct = (product) => {
    dispatch(addCart(product));
    toast.success("Added to cart");
  };

  useEffect(() => {
    const getProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch("https://fakestoreapi.com/products/");
        const json = await res.json();
        if (mounted.current) {
          setData(json);
          setFilter(json);
          setLoading(false);
        }
      } catch (e) {
        console.error(e);
        if (mounted.current) setLoading(false);
      }
    };
    getProducts();
    return () => {
      mounted.current = false;
    };
  }, []);

  const filterProduct = (cat) => {
    if (!cat) {
      setFilter(data);
    } else {
      const updatedList = data.filter((item) => item.category === cat);
      setFilter(updatedList);
    }
    // رجّع للصفحة الأولى بعد تغيير الفلتر
    setPage(1);
  };

  // نطبّق البحث + الترتيب
  const visible = useMemo(() => {
    let list = [...filter];
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    switch (sortBy) {
      case "priceAsc":
        list.sort((a, b) => a.price - b.price);
        break;
      case "priceDesc":
        list.sort((a, b) => b.price - a.price);
        break;
      case "ratingDesc":
        list.sort((a, b) => (b.rating?.rate || 0) - (a.rating?.rate || 0));
        break;
      case "titleAsc":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        break;
    }
    return list;
  }, [filter, search, sortBy]);

  // ارجع للصفحة الأولى عند تغيير البحث/الترتيب/حجم الصفحة
  useEffect(() => {
    setPage(1);
  }, [search, sortBy, pageSize]);

  const total = visible.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const pageItems = visible.slice(startIndex, endIndex);

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
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => filterProduct(null)}
            type="button"
          >
            All
          </button>
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => filterProduct("men's clothing")}
            type="button"
          >
            Men's Clothing
          </button>
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => filterProduct("women's clothing")}
            type="button"
          >
            Women's Clothing
          </button>
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => filterProduct("jewelery")}
            type="button"
          >
            Jewelery
          </button>
          <button
            className="btn btn-outline-dark btn-sm m-2"
            onClick={() => filterProduct("electronics")}
            type="button"
          >
            Electronics
          </button>
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
              ? `Showing ${startIndex + 1}–${endIndex} of ${total}`
              : "No results"}
          </div>
        </div>
      )}

      <div className="row justify-content-center">
        {loading ? (
          <LoadingView />
        ) : (
          pageItems.map((product) => (
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
                    src={product.image}
                    alt={product.title}
                    style={{ maxHeight: "100%" }}
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
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* أزرار الترقيم */}
      {!loading && totalPages > 1 && (
        <nav aria-label="Products pages" className="mt-2">
          <ul className="pagination justify-content-center">
            <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
              <button
                type="button"
                className="page-link"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                « Prev
              </button>
            </li>

            {Array.from({ length: totalPages }).map((_, i) => {
              const n = i + 1;
              return (
                <li
                  key={n}
                  className={`page-item ${n === currentPage ? "active" : ""}`}
                >
                  <button
                    type="button"
                    className="page-link"
                    onClick={() => setPage(n)}
                  >
                    {n}
                  </button>
                </li>
              );
            })}

            <li
              className={`page-item ${
                currentPage === totalPages ? "disabled" : ""
              }`}
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
