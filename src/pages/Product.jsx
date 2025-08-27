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

const Product = () => {
  const { id } = useParams();
  const [product, setProduct] = useState({});
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loading2, setLoading2] = useState(false);

  // لمعرض الصور
  const [activeIdx, setActiveIdx] = useState(0);

  const dispatch = useDispatch();
  const wishlist = useSelector((s) => s.wishlist || []);

  const isWishlisted = wishlist.some(
    (w) => String(w.id) === String(product?.id ?? id)
  );

  const addProductToCart = (p) => dispatch(addCart(p));
  const onToggleWishlist = (p) => dispatch(toggleWishlist(p));

  useEffect(() => {
    const getProduct = async () => {
      setLoading(true);
      setLoading2(true);

      try {
        const data = await ApiService.getProduct(id);

        // جهّز بيانات المنتج
        const transformedProduct = {
          id: data._id,
          title: data.title,
          price:
            data.priceInFils != null ? data.priceInFils / 1000 : data.price,
          oldPrice:
            data.oldPriceInFils != null
              ? data.oldPriceInFils / 1000
              : data.oldPrice,
          // كل الصور (مع isPrimary إن وجدت)
          images:
            Array.isArray(data.images) && data.images.length
              ? data.images.map((img) => ({
                  url: img.url,
                  isPrimary: !!img.isPrimary,
                }))
              : [],
          // صورة احتياطية واحدة فقط (للتوافق مع كود قديم)
          image:
            data.images?.find((img) => img.isPrimary)?.url ||
            data.images?.[0]?.url ||
            "/placeholder-image.jpg",
          category: data.category?.name || data.category,
          rating: data.rating,
          description: data.description || "",
          stock: data.stock || 0,
        };

        setProduct(transformedProduct);

        // فعّل الصورة الأساسية إن وُجدت
        if (transformedProduct.images?.length) {
          const primaryIndex = transformedProduct.images.findIndex(
            (x) => x.isPrimary
          );
          setActiveIdx(primaryIndex >= 0 ? primaryIndex : 0);
        } else {
          setActiveIdx(0);
        }

        setLoading(false);

        // منتجات مشابهة
        if (data.category?.slug) {
          const response = await ApiService.getProducts({
            category: data.category.slug,
            limit: 4,
          });

          const transformedSimilarProducts = (response.items || response).map(
            (p) => ({
              id: p._id,
              title: p.title,
              price: p.priceInFils != null ? p.priceInFils / 1000 : p.price,
              oldPrice:
                p.oldPriceInFils != null ? p.oldPriceInFils / 1000 : p.oldPrice,
              image:
                p.image ||
                p.images?.find((img) => img.isPrimary)?.url ||
                p.images?.[0]?.url ||
                "/placeholder-image.jpg",
              category: p.category?.name,
              rating: p.rating,
            })
          );

          setSimilarProducts(transformedSimilarProducts);
        }
        setLoading2(false);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast.error("Failed to load product details");
        setLoading(false);
        setLoading2(false);
      }
    };

    getProduct();
  }, [id]);

  const Loading = () => (
    <div className="container my-5 py-2">
      <div className="row">
        <div className="col-md-6 py-3">
          <Skeleton height={400} width={400} />
        </div>
        <div className="col-md-6 py-5">
          <Skeleton height={30} width={250} />
          <Skeleton height={90} />
          <Skeleton height={40} width={70} />
          <Skeleton height={50} width={110} />
          <Skeleton height={120} />
          <Skeleton height={40} width={110} inline={true} />
          <Skeleton className="mx-3" height={40} width={110} />
        </div>
      </div>
    </div>
  );

  const ShowProduct = () => {
    const gallery = product.images?.length
      ? product.images
      : [{ url: product.image, isPrimary: true }];

    const mainUrl =
      gallery[activeIdx]?.url || product.image || "/placeholder-image.jpg";

    const showOld =
      product.oldPrice != null && product.oldPrice > product.price;

    return (
      <div className="container my-5 py-2">
        <div className="row g-4">
          {/* الصور */}
          <div className="col-md-6 col-sm-12">
            {/* الصورة الرئيسية */}
            <div className="border rounded d-flex align-items-center justify-content-center p-3">
              <img
                className="img-fluid"
                src={mainUrl}
                alt={product.title}
                style={{ maxHeight: 420, objectFit: "contain" }}
                onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
              />
            </div>

            {/* الثمنبنيلات */}
            {gallery.length > 1 && (
              <div
                className="d-flex flex-wrap gap-2 mt-3"
                style={{ maxHeight: 120, overflowX: "auto" }}
              >
                {gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`btn p-1 border ${
                      idx === activeIdx ? "border-2 border-dark" : "border-1"
                    }`}
                    style={{
                      width: 70,
                      height: 70,
                      borderRadius: 6,
                      background: "white",
                    }}
                    onClick={() => setActiveIdx(idx)}
                    title={`Image ${idx + 1}`}
                  >
                    <img
                      src={img.url}
                      alt={`Thumbnail ${idx + 1}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                      onError={(e) =>
                        (e.currentTarget.src = "/placeholder-image.jpg")
                      }
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* التفاصيل */}
          <div className="col-md-6">
            <h4 className="text-uppercase text-muted">{product.category}</h4>
            <h1 className="display-5">{product.title}</h1>
            <p className="lead">
              {product.rating && product.rating.rate}{" "}
              <i className="fa fa-star"></i>
            </p>

            {/* السعر الحالي + القديم */}
            <div className="my-4">
              <span className="display-6">{formatPrice(product.price)}</span>
              {showOld && (
                <span
                  className="text-muted ms-3"
                  style={{ textDecoration: "line-through" }}
                >
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>

            <p className="lead">{product.description}</p>
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

              <Link to="/cart" className="btn btn-dark mx-1">
                Go to Cart
              </Link>

              <button
                data-test="wishlist-btn"
                className={`btn ${
                  isWishlisted ? "btn-danger" : "btn-outline-danger"
                }`}
                onClick={() => onToggleWishlist(product)}
                type="button"
                title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              >
                <i
                  className={`fa ${
                    isWishlisted ? "fa-heart" : "fa-heart-o"
                  } me-1`}
                />
                {isWishlisted ? "Wishlisted" : "Wishlist"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const Loading2 = () => (
    <div className="my-4 py-4">
      <div className="d-flex">
        {[1, 2, 3, 4].map((k) => (
          <div key={k} className="mx-4">
            <Skeleton height={400} width={250} />
          </div>
        ))}
      </div>
    </div>
  );

  const ShowSimilarProduct = () => (
    <div className="py-4 my-4">
      <div className="d-flex">
        {similarProducts.map((item) => {
          const inWishlist = wishlist.some(
            (w) => String(w.id) === String(item.id)
          );
          const showOld =
            item.oldPrice != null && item.oldPrice > item.price;

          return (
            <div key={item.id} className="card mx-4 text-center" style={{ width: 260 }}>
              <img
                className="card-img-top p-3"
                src={item.image}
                alt={item.title}
                height={300}
                width={300}
                style={{ objectFit: "contain" }}
                onError={(e) => (e.currentTarget.src = "/placeholder-image.jpg")}
              />
              <div className="card-body d-flex flex-column">
                <h5 className="card-title mb-1">
                  {item.title.length > 15
                    ? item.title.substring(0, 15) + "..."
                    : item.title}
                </h5>

                <div className="mb-2">
                  <span className="lead">{formatPrice(item.price)}</span>
                  {showOld && (
                    <span
                      className="text-muted ms-2"
                      style={{ textDecoration: "line-through" }}
                    >
                      {formatPrice(item.oldPrice)}
                    </span>
                  )}
                </div>

                <div className="mt-auto d-flex justify-content-center gap-2">
                  <Link to={`/product/${item.id}`} className="btn btn-outline-dark btn-sm">
                    Details
                  </Link>
                  <button className="btn btn-dark btn-sm" onClick={() => addProductToCart(item)}>
                    Add to Cart
                  </button>
                  <button
                    className={`btn btn-outline-danger btn-sm ${inWishlist ? "active" : ""}`}
                    onClick={() => onToggleWishlist(item)}
                    type="button"
                    title={inWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
                  >
                    <i className={`fa ${inWishlist ? "fa-heart" : "fa-heart-o"}`} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <Navbar />
      <div className="container">
        <div className="row">{loading ? <Loading /> : <ShowProduct />}</div>
        <div className="row my-5 py-5">
          <div className="d-none d-md-block">
            <h2 className="">You may also Like</h2>
            <Marquee pauseOnHover={true} pauseOnClick={true} speed={50}>
              {loading2 ? <Loading2 /> : <ShowSimilarProduct />}
            </Marquee>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Product;
