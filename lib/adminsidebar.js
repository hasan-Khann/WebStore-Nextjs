import { AiOutlineDashboard } from "react-icons/ai";
import { BiCategory } from "react-icons/bi";
import { IoShirtOutline } from "react-icons/io5";
import { MdOutlineShoppingBag, MdOutlinePermMedia } from "react-icons/md";
import { LuUserRound } from "react-icons/lu";
import { IoMdStarOutline } from "react-icons/io";
import { BsTag } from "react-icons/bs";

import {
  ADMIN_DASHBOARD,
  ADMIN_CATEGORY,
  ADMIN_CATEGORY_ADD,
  ADMIN_PRODUCT,
  ADMIN_PRODUCT_ADD,
  ADMIN_PRODUCT_VARIANT,
  ADMIN_PRODUCT_VARIANT_ADD,
  ADMIN_ORDERS,
  ADMIN_USERS,
  ADMIN_REVIEWS,
  ADMIN_MEDIA,
  ADMIN_MEDIA_ADD,
  ADMIN_COUPON,
  ADMIN_COUPON_ADD
} from "@/routes/AdminPanelRoute";

export const adminSideBarMenu = [
  {
    title: "Dashboard",
    url: ADMIN_DASHBOARD,
    icon: AiOutlineDashboard,
  },
  {
    title: "Category",
    url: ADMIN_CATEGORY,
    icon: BiCategory,
    subMenu: [
      { title: "Add Category", url: ADMIN_CATEGORY_ADD },
      { title: "All Categories", url: ADMIN_CATEGORY },
    ],
  },
  {
    title: "Product",
    url: ADMIN_PRODUCT,
    icon: IoShirtOutline,
    subMenu: [
      { title: "Add Product", url: ADMIN_PRODUCT_ADD },
      { title: "Add Variant", url: ADMIN_PRODUCT_VARIANT_ADD },
      { title: "All Products", url: ADMIN_PRODUCT },
      { title: "Product Variants", url: ADMIN_PRODUCT_VARIANT },
    ],
  },
  {
    title: "Orders",
    url: ADMIN_ORDERS,
    icon: MdOutlineShoppingBag,
  },
  {
    title: "Customers",
    url: ADMIN_USERS,
    icon: LuUserRound,
  },
  {
    title: "Ratings & Reviews",
    url: ADMIN_REVIEWS,
    icon: IoMdStarOutline,
  },
  {
    title: "Media",
    url: ADMIN_MEDIA,
    icon: MdOutlinePermMedia,
    subMenu: [
      { title: "Add Media", url: ADMIN_MEDIA_ADD },
      { title: "All Media", url: ADMIN_MEDIA },
    ],
  },
  {
    title: "Coupons",
    url: ADMIN_COUPON,
    icon: BsTag,
    subMenu: [
      { title: "Add Coupon", url: ADMIN_COUPON_ADD },
      { title: "All Coupons", url: ADMIN_COUPON },
    ],
  },
];
