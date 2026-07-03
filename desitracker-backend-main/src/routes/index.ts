import { Router } from 'express';
import { VisitorCountRoutes } from '../modules/analytics/businessVisitorCount/visitorCount.api';
import { BusinessRoutes } from '../modules/business/business.api';
import { CategoryRoutes } from '../modules/category/category.api';
import { BannerRoutes } from '../modules/home/banner/banner.api';
import { SliderRoutes } from '../modules/home/slider/slider.api';
import { ReviewRoutes } from '../modules/review/review.api';
import { SubCategoryRoutes } from '../modules/subcategory/subcategory.api';
import { TestimonialRoutes } from '../modules/testimonial/testimonial.api';
import { UploadRoutes } from '../modules/uploadImage/upload.images.api';
import { AuthRoutes } from '../modules/user/auth/auth.api';
import { UserRoutes } from '../modules/user/user/user.api';
import { SettingsRoutes } from '../modules/settings/settings.api';
import { sendContactMessage } from '../modules/contactus/contactController';
import { MemberRoutes } from '../modules/members/member.api';
import { ProductsRoutes } from '../modules/product/product.api';
import { FridgeRoutes } from '../modules/fridge/fridge.api'; // Import fridge routes
import { CleaningRoutes } from '../modules/cleaning/cleaning.api'; // Import cleaning routes
import { RotaRoutes } from '../modules/rota/rota.api';
import { ProductOptionRoutes } from '../modules/product/productOption.api';
import { OrderRoutes } from '../modules/order/order.api';
import { InventoryRoutes } from '../modules/inventory/inventory.api';
import { EODRoutes } from '../modules/eod/eodReport.api';
import { DineInRoutes } from '../modules/dinein/dinein.api';
import { ActivityRoutes } from '../modules/activity/activity.api';
import { TableRoutes } from '../modules/table/table.route';
import BookingRoutes from '../modules/booking/booking.api';
import { NotificationRoutes } from '../modules/notification/notification.api';

const router = Router();

const moduleRoutes = [
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/products',
    route: ProductsRoutes,
  },
  {
    path: '/product-options',
    route: ProductOptionRoutes,
  },
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/category',
    route: CategoryRoutes,
  },
  {
    path: '/sub-category',
    route: SubCategoryRoutes,
  },
  {
    path: '/reviews',
    route: ReviewRoutes,
  },
  {
    path: '/testimonials',
    route: TestimonialRoutes,
  },
  {
    path: '/business',
    route: BusinessRoutes,
  },
  {
    path: '/banner',
    route: BannerRoutes,
  },
  {
    path: '/slider',
    route: SliderRoutes,
  },
  {
    path: '/upload-images',
    route: UploadRoutes,
  },
  {
    path: '/analytics',
    route: VisitorCountRoutes,
  },
  {
    path: '/settings',
    route: SettingsRoutes,
  },
  {
    path: '/contact',
    route: sendContactMessage,
  },
  { path: '/members', route: MemberRoutes },
  {
    path: '/fridges',  // Add the fridge module route
    route: FridgeRoutes,  // Link the fridge routes here
  },
  {
    path: '/cleaning',  // Cleaning checklist module
    route: CleaningRoutes,
  },
  {
    path: '/rota',  // Add the fridge module route
    route: RotaRoutes,  // Link the fridge routes here
  },
  {
    path: '/orders',
    route: OrderRoutes,
  },
  {
    path: '/inventory',
    route: InventoryRoutes,
  },
  {
    path: '/eod',
    route: EODRoutes,
  },
  {
    path: '/dinein',
    route: DineInRoutes,
  },
  {
    path: '/activity',
    route: ActivityRoutes,
  },
  {
    path: '/tables',
    route: TableRoutes,
  },
  {
    path: '/booking',
    route: BookingRoutes,
  },
  {
    path: '/notifications',
    route: NotificationRoutes,
  },
];

moduleRoutes.forEach((routeObj) => router.use(routeObj.path, routeObj.route));

export default router;
