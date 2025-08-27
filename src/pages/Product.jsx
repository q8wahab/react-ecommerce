import React, { useEffect, useState } from "react";
import Skeleton from "react-loading-skeleton";
import { Link, useParams } from "react-router-dom";
import Marquee from "react-fast-marquee";
import { useDispatch, useSelector } from "react-redux";
import { addCart } from "../redux/action";
import { toggleWishlist } from "../store/wishlist/slice";
import { Footer, Navbar } from "../components";
import { formatPrice } from "../utils/format";
import ApiService from "../services/api";
import toast from "react-hot-toast";

// Markdown
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.wishlist || []);
  const isWishlisted = wishlist.some(
    (w) => String(w.id) === String(product?.id ?? id)
  );

  const addProductToCart = (p) => dispatch(addCart(p));
  const onToggleWishlist = (p) => dispatch(toggleWishlist(p));

  useEffect(() => {
    const getProduct = async () => {
      try {
        setLoading(true);

        const data = await ApiService.getProductById(id);
        if (!data) {
          setLoading(false);
          toast.error("Product not found");
          return;
        }

        const priceRaw =
          (data.priceInFils != null ? data.priceInFils / 1000 : undefined) ??
          data.price ??
          0;

        const imageUrl =
          data.image ||
          data.images?.find((img) => img?.isPrimary)?.url ||
          data.images?.[0]?.url ||
          "/placeholder-image.jpg";

        const transformedProduct = {
          id: data._id ?? data.id ?? id,
          title: data.title ?? "",
          price: Number.isFinite(priceRaw) ? priceRaw : 0,
          image: imageUrl,
          category: data.category?.name ?? data.category ?? "-",
          rating: data.rating?.rate ?? data.rating ?? null,
          description: data.description ?? "",
          stock: data.stock ?? data.quantity ?? 0,
        };

        setProduct(transformedProduct);
        setLoading(false);

        // منتجات مشابهة (اختياري)
        try {
          const categoryQuery =
            data.category?.slug || data.category?.name || data.category || "";
          if (!categoryQuery) return;

          setLoading2(true);
          const resp = await ApiService.getProducts({
            page: 1,
            limit: 20,
            category: categoryQuery,
          });

          const transformed = (resp?.items || [])
            .filter((p) => String(p._id) !== String(data._id))
            .map((p) => ({
              id: p._id ?? p.id,
              title: p.title,
              price:
                (p.priceInFils != null ? p.priceInFils / 1000 : p.price) ?? 0,
              image:
                p.image ||
                p.images?.find((img) => img?.isPrimary)?.url ||
                p.images?.[0]?.url ||
                "/placeholder-image.jpg",
              category: p.category?.name ?? p.category ?? "-",
              rating: p.rating?.rate ?? p.rating ?? null,
            }));

          setSimilarProducts(transformed);
          setLoading2(false);
        } catch (e) {
          setLoading2(false);
          console.warn("Similar products load warning:", e);
        }
      } catch (error) {
        setLoading(false);
        console.error("getProduct error:", {
          message: error?.message,
          status: error?.response?.status,
          url: error?.config?.url,
          data: error?.response?.data,
        });
        toast.error("Failed to load product");
      }
    };
    getProduct();
  }, [id]);

  const Loading = () => (
    <>
      <div className="col-md-6">
        <Skeleton height={400} />
      </div>
      <div className="col-md-6" style={{ lineHeight: 2 }}>
        <Skeleton height={50} width={300} />
        <Skeleton height={75} />
        <Skeleton height={25} width={150} />
        <Skeleton height={50} />
        <Skeleton height={150} />
        <Skeleton height={50} width={100} />
        <Skeleton height={150} />
      </div>
    </>
  );

  // لودينغ أفقي للكروت (للموبايل/الديسكتوب)
  const ShowSimilarLoading = () => (
    <div
      className="similar-track d-flex align-items-stretch"
      style={{ gap: "1rem", flexWrap: "nowrap" }}
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="card text-center"
          style={{ width: 260, flex: "0 0 auto" }}
        >
          <div className="p-3">
            <Skeleton height={300} />
          </div>
          <div className="card-body">
            <Skeleton height={20} width={180} />
            <Skeleton height={20} width={120} />
          </div>
        </div>
      ))}
    </div>
  );

  const ShowSimilarProduct = () => (
    <div
      className="similar-track d-flex align-items-stretch"
      style={{ gap: "1rem", flexWrap: "nowrap" }}
    >
      {similarProducts.map((item) => (
        <div
          key={item.id}
          className="card text-center"
          style={{ width: 260, flex: "0 0 auto" }}
        >
          <img
            className="card-img-top p-3"
            src={item.image}
            alt={item.title}
            height={300}
            width={300}
            style={{ objectFit: "contain" }}
          />
          <div className="card-body d-flex flex-column">
            <h5 className="card-title mb-1">
              {item.title?.length > 15
                ? item.title.substring(0, 15) + "..."
                : item.title}
            </h5>
            <p className="lead mb-2">{formatPrice(item.price)}</p>
            <div className="d-flex justify-content-center gap-2">
              <Link
                to={`/product/${item.id}`}
                className="btn btn-outline-dark btn-sm"
              >
                Buy now
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="container py-5">
        <div className="row py-4">
          {loading ? (
            <Loading />
          ) : (
            <>
              <div className="col-md-6 text-center">
                <img
                  src={product.image || "/placeholder-image.jpg"}
                  alt={product.title}
                  width="400"
                  height="400"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder-image.jpg";
                  }}
                  style={{ objectFit: "contain" }}
                />
              </div>
              <div className="col-md-6 py-5">
                <h4 className="text-uppercase text-muted">{product.category}</h4>
                <h1 className="display-5">{product.title}</h1>
                {product.rating ? (
                  <p className="lead">
                    {product.rating} <i className="fa fa-star"></i>
                  </p>
                ) : null}
                <h3 className="display-6 my-4">{formatPrice(product.price)}</h3>

                {/* وصف المنتج: Markdown + GFM (بدون className على ReactMarkdown) */}
                <div className="lead product-desc">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {product.description || ""}
                  </ReactMarkdown>
                </div>

                {product.stock > 0 ? (
                  <p className="text-success">
                    In Stock ({product.stock} available)
                  </p>
                ) : (
                  <p className="text-danger">Out of Stock</p>
                )}

                <div className="d-flex align-items-center flex-wrap gap-2">
                  <button
                    className="btn btn-outline-dark"
                    onClick={() => addProductToCart(product)}
                    type="button"
                    disabled={product.stock === 0}
                  >
                    Add to Cart
                  </button>

                  <Link to="/cart" className="btn btn-dark">
                    Go to Cart
                  </Link>

                  <button
                    type="button"
                    className={`btn ${
                      isWishlisted ? "btn-danger" : "btn-outline-danger"
                    }`}
                    onClick={() => onToggleWishlist(product)}
                    title={
                      isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"
                    }
                    aria-pressed={isWishlisted}
                  >
                    <i className="fa fa-heart" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* You may also like */}
        <div className="mt-4">
          <h2 className="">You may also like</h2>

          {/* Desktop/Tablet: Marquee */}
          <div className="d-none d-md-block">
            <Marquee pauseOnHover={true} pauseOnClick={true} speed={50}>
              {loading2 ? <ShowSimilarLoading /> : <ShowSimilarProduct />}
            </Marquee>
          </div>

          {/* Mobile: صف أفقي بسكرول */}
          <div className="d-md-none">
            <div className="px-3" style={{ overflowX: "auto" }}>
              {loading2 ? <ShowSimilarLoading /> : <ShowSimilarProduct />}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Product;
