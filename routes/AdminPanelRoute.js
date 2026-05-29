// Admin Dashboard
export const ADMIN_DASHBOARD = "/admin/dashboard";

// Media Routes
export const ADMIN_MEDIA = "/admin/media";
export const ADMIN_MEDIA_ADD = "/admin/media/add";
export const ADMIN_MEDIA_EDIT = (id) => `/admin/media/update/${id}`;
export const ADMIN_MEDIA_TRASH = "/admin/media/trash";

// Category Routes
export const ADMIN_CATEGORY = "/admin/category";
export const ADMIN_CATEGORY_ADD = "/admin/category/add";
export const ADMIN_CATEGORY_EDIT = (id) => `/admin/category/update/${id}`;
export const ADMIN_CATEGORY_TRASH = "/admin/category/trash";

// Product Routes
export const ADMIN_PRODUCT = "/admin/product";
export const ADMIN_PRODUCT_ADD = "/admin/product/add";
export const ADMIN_PRODUCT_UPDATE = (id) => `/admin/product/update/${id}`;
export const ADMIN_PRODUCT_TRASH = "/admin/product/trash";

// Product Variant Routes
export const ADMIN_PRODUCT_VARIANT = "/admin/product-variant";
export const ADMIN_PRODUCT_VARIANT_ADD = "/admin/product-variant/add";
export const ADMIN_PRODUCT_VARIANT_UPDATE = (id) => `/admin/product-variant/update/${id}`;
export const ADMIN_PRODUCT_VARIANT_TRASH = "/admin/product-variant/trash";

// User Routes (read-only, no update)
export const ADMIN_USERS = "/admin/users";
export const ADMIN_USER_DETAIL = (id) => `/admin/users/detail/${id}`;

// Reviews Routes (read-only)
export const ADMIN_REVIEWS = "/admin/reviews";
export const ADMIN_REVIEW_DETAIL = (id) => `/admin/reviews/detail/${id}`;

// Orders Routes (read-only)
export const ADMIN_ORDERS = "/admin/orders";
export const ADMIN_ORDERS_TRASH = "/admin/orders/trash";
export const ADMIN_ORDER_DETAIL = (id) => `/admin/orders/detail/${id}`;

export const ADMIN_COUPON = "/admin/coupon";
export const ADMIN_COUPON_ADD = "/admin/coupon/add";
export const ADMIN_COUPON_UPDATE = (id) => `/admin/coupon/update/${id}`;
export const ADMIN_COUPON_TRASH = "/admin/coupon/trash";

// Generic Trash view (optional)
export const ADMIN_TRASH = "/admin/trash";
