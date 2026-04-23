"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const visitorCount_api_1 = require("../modules/analytics/businessVisitorCount/visitorCount.api");
const business_api_1 = require("../modules/business/business.api");
const category_api_1 = require("../modules/category/category.api");
const banner_api_1 = require("../modules/home/banner/banner.api");
const slider_api_1 = require("../modules/home/slider/slider.api");
const review_api_1 = require("../modules/review/review.api");
const subcategory_api_1 = require("../modules/subcategory/subcategory.api");
const testimonial_api_1 = require("../modules/testimonial/testimonial.api");
const upload_images_api_1 = require("../modules/uploadImage/upload.images.api");
const auth_api_1 = require("../modules/user/auth/auth.api");
const user_api_1 = require("../modules/user/user/user.api");
const settings_api_1 = require("../modules/settings/settings.api");
const contactController_1 = require("../modules/contactus/contactController");
const member_api_1 = require("../modules/members/member.api");
const product_api_1 = require("../modules/product/product.api");
const fridge_api_1 = require("../modules/fridge/fridge.api"); // Import fridge routes
const rota_api_1 = require("../modules/rota/rota.api");
const productOption_api_1 = require("../modules/product/productOption.api");
const order_api_1 = require("../modules/order/order.api");
const router = (0, express_1.Router)();
const moduleRoutes = [
    {
        path: '/users',
        route: user_api_1.UserRoutes,
    },
    {
        path: '/products',
        route: product_api_1.ProductsRoutes,
    },
    {
        path: '/product-options',
        route: productOption_api_1.ProductOptionRoutes,
    },
    {
        path: '/auth',
        route: auth_api_1.AuthRoutes,
    },
    {
        path: '/category',
        route: category_api_1.CategoryRoutes,
    },
    {
        path: '/sub-category',
        route: subcategory_api_1.SubCategoryRoutes,
    },
    {
        path: '/reviews',
        route: review_api_1.ReviewRoutes,
    },
    {
        path: '/testimonials',
        route: testimonial_api_1.TestimonialRoutes,
    },
    {
        path: '/business',
        route: business_api_1.BusinessRoutes,
    },
    {
        path: '/banner',
        route: banner_api_1.BannerRoutes,
    },
    {
        path: '/slider',
        route: slider_api_1.SliderRoutes,
    },
    {
        path: '/upload-images',
        route: upload_images_api_1.UploadRoutes,
    },
    {
        path: '/analytics',
        route: visitorCount_api_1.VisitorCountRoutes,
    },
    {
        path: '/settings',
        route: settings_api_1.SettingsRoutes,
    },
    {
        path: '/contact',
        route: contactController_1.sendContactMessage,
    },
    { path: '/members', route: member_api_1.MemberRoutes },
    {
        path: '/fridges', // Add the fridge module route
        route: fridge_api_1.FridgeRoutes, // Link the fridge routes here
    },
    {
        path: '/rota', // Add the fridge module route
        route: rota_api_1.RotaRoutes, // Link the fridge routes here
    },
    {
        path: '/orders',
        route: order_api_1.OrderRoutes,
    },
];
moduleRoutes.forEach((routeObj) => router.use(routeObj.path, routeObj.route));
exports.default = router;
