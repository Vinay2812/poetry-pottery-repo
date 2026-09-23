/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import type { TypedDocumentNode as DocumentNode } from '@apollo/client';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: string; output: string; }
};

export type AddOrderNoteInput = {
  body: Scalars['String']['input'];
  image_url?: InputMaybe<Scalars['String']['input']>;
  order_id: Scalars['String']['input'];
};

export type AddToCartInput = {
  product_id: Scalars['Int']['input'];
  quantity?: InputMaybe<Scalars['Int']['input']>;
  reference_image_urls?: InputMaybe<Array<Scalars['String']['input']>>;
  selections?: InputMaybe<Array<SelectionInputType>>;
};

export type Address = {
  __typename?: 'Address';
  city: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  is_default: Scalars['Boolean']['output'];
  landmark?: Maybe<Scalars['String']['output']>;
  line1: Scalars['String']['output'];
  line2?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  pincode: Scalars['String']['output'];
  state: Scalars['String']['output'];
};

export type AddressInput = {
  city: Scalars['String']['input'];
  is_default?: InputMaybe<Scalars['Boolean']['input']>;
  landmark?: InputMaybe<Scalars['String']['input']>;
  line1: Scalars['String']['input'];
  line2?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  phone: Scalars['String']['input'];
  pincode: Scalars['String']['input'];
  state: Scalars['String']['input'];
};

export type AdminAnnouncementInput = {
  href?: InputMaybe<Scalars['String']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type AdminBatchNotification = {
  __typename?: 'AdminBatchNotification';
  created_at: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  notified_at?: Maybe<Scalars['DateTime']['output']>;
  product_id: Scalars['Int']['output'];
  product_name: Scalars['String']['output'];
  product_slug: Scalars['String']['output'];
};

export type AdminBatchNotificationsFilterInput = {
  is_notified?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  product_id?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type AdminBatchNotificationsResult = {
  __typename?: 'AdminBatchNotificationsResult';
  items: Array<AdminBatchNotification>;
  page_info: PageInfo;
};

export type AdminCategoryInput = {
  icon?: InputMaybe<Scalars['String']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  sort_order?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminCollectionInput = {
  description?: InputMaybe<Scalars['String']['input']>;
  ends_at?: InputMaybe<Scalars['DateTime']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  name: Scalars['String']['input'];
  starts_at?: InputMaybe<Scalars['DateTime']['input']>;
};

export type AdminContactFilterInput = {
  is_read?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type AdminCoupon = {
  __typename?: 'AdminCoupon';
  code: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  expires_at?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Int']['output'];
  is_active: Scalars['Boolean']['output'];
  kind: CouponKind;
  max_uses?: Maybe<Scalars['Int']['output']>;
  min_order: Scalars['Int']['output'];
  starts_at?: Maybe<Scalars['DateTime']['output']>;
  uses_count: Scalars['Int']['output'];
  value: Scalars['Int']['output'];
};

export type AdminCouponInput = {
  code: Scalars['String']['input'];
  expires_at?: InputMaybe<Scalars['DateTime']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  kind: CouponKind;
  max_uses?: InputMaybe<Scalars['Int']['input']>;
  min_order?: InputMaybe<Scalars['Int']['input']>;
  starts_at?: InputMaybe<Scalars['DateTime']['input']>;
  value: Scalars['Int']['input'];
};

export type AdminCouponsFilterInput = {
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type AdminCouponsResult = {
  __typename?: 'AdminCouponsResult';
  items: Array<AdminCoupon>;
  page_info: PageInfo;
};

export type AdminDashboard = {
  __typename?: 'AdminDashboard';
  low_stock: Array<AdminLowStockPiece>;
  new_commission_requests: Scalars['Int']['output'];
  orders_by_status: Array<AdminOrderStatusCount>;
  orders_last_30_days: Scalars['Int']['output'];
  pending_bookings: Scalars['Int']['output'];
  pending_registrations: Scalars['Int']['output'];
  recent_bookings: Array<AdminRecentBooking>;
  recent_orders: Array<AdminRecentOrder>;
  revenue_last_30_days: Scalars['Int']['output'];
  unread_messages: Scalars['Int']['output'];
  upcoming_visits: Scalars['Int']['output'];
};

export type AdminEventInput = {
  address: Scalars['String']['input'];
  description: Scalars['String']['input'];
  ends_at: Scalars['DateTime']['input'];
  event_type?: InputMaybe<EventType>;
  gallery?: InputMaybe<Array<Scalars['String']['input']>>;
  highlights?: InputMaybe<Array<Scalars['String']['input']>>;
  image_url: Scalars['String']['input'];
  includes?: InputMaybe<Array<Scalars['String']['input']>>;
  instructor?: InputMaybe<Scalars['String']['input']>;
  level?: InputMaybe<EventLevel>;
  location: Scalars['String']['input'];
  performers?: InputMaybe<Array<Scalars['String']['input']>>;
  price: Scalars['Int']['input'];
  starts_at: Scalars['DateTime']['input'];
  title: Scalars['String']['input'];
  total_seats: Scalars['Int']['input'];
};

export type AdminEventsFilterInput = {
  event_type?: InputMaybe<EventType>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<EventStatus>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminEventsResult = {
  __typename?: 'AdminEventsResult';
  items: Array<Event>;
  page_info: PageInfo;
};

export type AdminGlaze = {
  __typename?: 'AdminGlaze';
  glaze: Glaze;
  product_count: Scalars['Int']['output'];
};

export type AdminGlazeInput = {
  color_code?: InputMaybe<Scalars['String']['input']>;
  description: Scalars['String']['input'];
  name: Scalars['String']['input'];
  swatch_url?: InputMaybe<Scalars['String']['input']>;
  variation_note?: InputMaybe<Scalars['String']['input']>;
};

export type AdminGlazesFilterInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type AdminGlazesResult = {
  __typename?: 'AdminGlazesResult';
  items: Array<AdminGlaze>;
  page_info: PageInfo;
};

export type AdminLowStockPiece = {
  __typename?: 'AdminLowStockPiece';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  stock: Scalars['Int']['output'];
};

export type AdminOptionGroupInput = {
  is_required?: InputMaybe<Scalars['Boolean']['input']>;
  kind?: InputMaybe<OptionGroupKind>;
  max_length?: InputMaybe<Scalars['Int']['input']>;
  name: Scalars['String']['input'];
  price_modifier?: InputMaybe<Scalars['Int']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminOptionInput = {
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name: Scalars['String']['input'];
  price_modifier?: InputMaybe<Scalars['Int']['input']>;
  sort_order?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminOrder = {
  __typename?: 'AdminOrder';
  admin_note?: Maybe<Scalars['String']['output']>;
  customer: AdminUserRef;
  next_statuses: Array<OrderStatus>;
  order: Order;
};

export type AdminOrderStatusCount = {
  __typename?: 'AdminOrderStatusCount';
  count: Scalars['Int']['output'];
  status: OrderStatus;
};

export type AdminOrdersFilterInput = {
  from?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<OrderStatus>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminOrdersResult = {
  __typename?: 'AdminOrdersResult';
  items: Array<AdminOrder>;
  page_info: PageInfo;
};

export type AdminProductInput = {
  capacity_ml?: InputMaybe<Scalars['Int']['input']>;
  care_notes?: InputMaybe<Array<Scalars['String']['input']>>;
  category_ids?: InputMaybe<Array<Scalars['Int']['input']>>;
  collection_id?: InputMaybe<Scalars['Int']['input']>;
  color_code?: InputMaybe<Scalars['String']['input']>;
  color_name?: InputMaybe<Scalars['String']['input']>;
  compare_at_price?: InputMaybe<Scalars['Int']['input']>;
  description: Scalars['String']['input'];
  diameter_cm?: InputMaybe<Scalars['Float']['input']>;
  dimensions?: InputMaybe<Scalars['String']['input']>;
  flaw_note?: InputMaybe<Scalars['String']['input']>;
  glaze_id?: InputMaybe<Scalars['Int']['input']>;
  height_cm?: InputMaybe<Scalars['Float']['input']>;
  image_urls?: InputMaybe<Array<Scalars['String']['input']>>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_commission?: InputMaybe<Scalars['Boolean']['input']>;
  is_customizable?: InputMaybe<Scalars['Boolean']['input']>;
  is_featured?: InputMaybe<Scalars['Boolean']['input']>;
  is_second?: InputMaybe<Scalars['Boolean']['input']>;
  maker_note?: InputMaybe<Scalars['String']['input']>;
  material: Scalars['String']['input'];
  name: Scalars['String']['input'];
  price: Scalars['Int']['input'];
  stock?: InputMaybe<Scalars['Int']['input']>;
  weight_g?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminProductUpdateInput = {
  capacity_ml?: InputMaybe<Scalars['Int']['input']>;
  care_notes?: InputMaybe<Array<Scalars['String']['input']>>;
  category_ids?: InputMaybe<Array<Scalars['Int']['input']>>;
  collection_id?: InputMaybe<Scalars['Int']['input']>;
  color_code?: InputMaybe<Scalars['String']['input']>;
  color_name?: InputMaybe<Scalars['String']['input']>;
  compare_at_price?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  diameter_cm?: InputMaybe<Scalars['Float']['input']>;
  dimensions?: InputMaybe<Scalars['String']['input']>;
  flaw_note?: InputMaybe<Scalars['String']['input']>;
  glaze_id?: InputMaybe<Scalars['Int']['input']>;
  height_cm?: InputMaybe<Scalars['Float']['input']>;
  image_urls?: InputMaybe<Array<Scalars['String']['input']>>;
  is_commission?: InputMaybe<Scalars['Boolean']['input']>;
  is_customizable?: InputMaybe<Scalars['Boolean']['input']>;
  is_second?: InputMaybe<Scalars['Boolean']['input']>;
  maker_note?: InputMaybe<Scalars['String']['input']>;
  material?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  price?: InputMaybe<Scalars['Int']['input']>;
  weight_g?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminProductsFilterInput = {
  category_id?: InputMaybe<Scalars['Int']['input']>;
  collection_id?: InputMaybe<Scalars['Int']['input']>;
  glaze_id?: InputMaybe<Scalars['Int']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  is_featured?: InputMaybe<Scalars['Boolean']['input']>;
  is_second?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  low_stock?: InputMaybe<Scalars['Boolean']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type AdminProductsResult = {
  __typename?: 'AdminProductsResult';
  items: Array<Product>;
  page_info: PageInfo;
};

export type AdminRecentBooking = {
  __typename?: 'AdminRecentBooking';
  created_at: Scalars['DateTime']['output'];
  customer: AdminUserRef;
  hours: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  participants: Scalars['Int']['output'];
  starts_at: Scalars['DateTime']['output'];
  status: RegistrationStatus;
  total: Scalars['Int']['output'];
};

export type AdminRecentOrder = {
  __typename?: 'AdminRecentOrder';
  created_at: Scalars['DateTime']['output'];
  customer: AdminUserRef;
  id: Scalars['String']['output'];
  item_count: Scalars['Int']['output'];
  status: OrderStatus;
  total: Scalars['Int']['output'];
};

export type AdminRegistration = {
  __typename?: 'AdminRegistration';
  customer: AdminUserRef;
  next_statuses: Array<RegistrationStatus>;
  registration: Registration;
};

export type AdminRegistrationsFilterInput = {
  event_id?: InputMaybe<Scalars['Int']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<RegistrationStatus>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminRegistrationsResult = {
  __typename?: 'AdminRegistrationsResult';
  items: Array<AdminRegistration>;
  page_info: PageInfo;
};

export type AdminReview = {
  __typename?: 'AdminReview';
  customer: AdminUserRef;
  is_hidden: Scalars['Boolean']['output'];
  review: Review;
  subject_kind: ReviewSubjectKind;
};

export type AdminReviewsFilterInput = {
  is_hidden?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  rating?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  subject_kind?: InputMaybe<ReviewSubjectKind>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminReviewsResult = {
  __typename?: 'AdminReviewsResult';
  items: Array<AdminReview>;
  page_info: PageInfo;
};

export type AdminSiteSettingsInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  contact_email?: InputMaybe<Scalars['String']['input']>;
  contact_phone?: InputMaybe<Scalars['String']['input']>;
  dispatch_days_max?: InputMaybe<Scalars['Int']['input']>;
  dispatch_days_min?: InputMaybe<Scalars['Int']['input']>;
  facebook_url?: InputMaybe<Scalars['String']['input']>;
  free_shipping_above?: InputMaybe<Scalars['Int']['input']>;
  hero_cta_href?: InputMaybe<Scalars['String']['input']>;
  hero_cta_text?: InputMaybe<Scalars['String']['input']>;
  hero_heading?: InputMaybe<Scalars['String']['input']>;
  hero_image_url?: InputMaybe<Scalars['String']['input']>;
  hero_subheading?: InputMaybe<Scalars['String']['input']>;
  instagram_url?: InputMaybe<Scalars['String']['input']>;
  opening_hours?: InputMaybe<Scalars['String']['input']>;
  shipping_flat_fee?: InputMaybe<Scalars['Int']['input']>;
  whatsapp_number?: InputMaybe<Scalars['String']['input']>;
  youtube_url?: InputMaybe<Scalars['String']['input']>;
};

export type AdminStudioVisit = {
  __typename?: 'AdminStudioVisit';
  created_at: Scalars['DateTime']['output'];
  customer?: Maybe<AdminUserRef>;
  visit: StudioVisit;
};

export type AdminStudioVisitsFilterInput = {
  from?: InputMaybe<Scalars['DateTime']['input']>;
  include_cancelled?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
};

export type AdminStudioVisitsResult = {
  __typename?: 'AdminStudioVisitsResult';
  items: Array<AdminStudioVisit>;
  page_info: PageInfo;
};

export type AdminSubscriber = {
  __typename?: 'AdminSubscriber';
  created_at: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  is_active: Scalars['Boolean']['output'];
  unsubscribed_at?: Maybe<Scalars['DateTime']['output']>;
  user_id?: Maybe<Scalars['Int']['output']>;
};

export type AdminSubscribersFilterInput = {
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type AdminSubscribersResult = {
  __typename?: 'AdminSubscribersResult';
  items: Array<AdminSubscriber>;
  page_info: PageInfo;
};

export type AdminUser = {
  __typename?: 'AdminUser';
  bookings_count: Scalars['Int']['output'];
  created_at: Scalars['DateTime']['output'];
  orders_count: Scalars['Int']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  registrations_count: Scalars['Int']['output'];
  reviews_count: Scalars['Int']['output'];
  role: UserRole;
  user: AdminUserRef;
};

export type AdminUserRef = {
  __typename?: 'AdminUserRef';
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
};

export type AdminUsersFilterInput = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  role?: InputMaybe<UserRole>;
  search?: InputMaybe<Scalars['String']['input']>;
};

export type AdminUsersResult = {
  __typename?: 'AdminUsersResult';
  items: Array<AdminUser>;
  page_info: PageInfo;
};

export type AdminWhatsAppFilterInput = {
  direction?: InputMaybe<WhatsAppDirection>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminWhatsAppMessagesResult = {
  __typename?: 'AdminWhatsAppMessagesResult';
  items: Array<WhatsAppMessage>;
  page_info: PageInfo;
};

export type AdminWorkshopBlackout = {
  __typename?: 'AdminWorkshopBlackout';
  config_id: Scalars['Int']['output'];
  ends_at: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  starts_at: Scalars['DateTime']['output'];
};

export type AdminWorkshopBlackoutInput = {
  ends_at: Scalars['DateTime']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  starts_at: Scalars['DateTime']['input'];
};

export type AdminWorkshopBooking = {
  __typename?: 'AdminWorkshopBooking';
  booking: WorkshopBooking;
  customer: AdminUserRef;
  next_statuses: Array<RegistrationStatus>;
};

export type AdminWorkshopBookingsFilterInput = {
  config_id?: InputMaybe<Scalars['Int']['input']>;
  from?: InputMaybe<Scalars['DateTime']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<RegistrationStatus>;
  to?: InputMaybe<Scalars['DateTime']['input']>;
  user_id?: InputMaybe<Scalars['Int']['input']>;
};

export type AdminWorkshopBookingsResult = {
  __typename?: 'AdminWorkshopBookingsResult';
  items: Array<AdminWorkshopBooking>;
  page_info: PageInfo;
};

export type AdminWorkshopConfigInput = {
  booking_window_days?: InputMaybe<Scalars['Int']['input']>;
  capacity_per_slot?: InputMaybe<Scalars['Int']['input']>;
  closed_weekdays?: InputMaybe<Array<Scalars['Int']['input']>>;
  closing_minutes?: InputMaybe<Scalars['Int']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  image_url?: InputMaybe<Scalars['String']['input']>;
  is_active?: InputMaybe<Scalars['Boolean']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
  opening_minutes?: InputMaybe<Scalars['Int']['input']>;
  slot_minutes?: InputMaybe<Scalars['Int']['input']>;
  slot_span_days?: InputMaybe<Scalars['Int']['input']>;
  timezone?: InputMaybe<Scalars['String']['input']>;
};

export type AdminWorkshopTierInput = {
  hours: Scalars['Int']['input'];
  pieces_per_person: Scalars['Int']['input'];
  price_per_person: Scalars['Int']['input'];
};

export type BatchNotificationResult = {
  __typename?: 'BatchNotificationResult';
  email: Scalars['String']['output'];
  was_already_waiting: Scalars['Boolean']['output'];
};

export type BookWorkshopInput = {
  config_slug: Scalars['String']['input'];
  hours: Scalars['Int']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  participants: Scalars['Int']['input'];
  slot_starts: Array<Scalars['DateTime']['input']>;
};

export type Cart = {
  __typename?: 'Cart';
  free_shipping_above?: Maybe<Scalars['Int']['output']>;
  item_count: Scalars['Int']['output'];
  items: Array<CartItem>;
  shipping_fee: Scalars['Int']['output'];
  subtotal: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type CartItem = {
  __typename?: 'CartItem';
  id: Scalars['Int']['output'];
  is_available: Scalars['Boolean']['output'];
  line_total: Scalars['Int']['output'];
  product: Product;
  quantity: Scalars['Int']['output'];
  reference_image_urls: Array<Scalars['String']['output']>;
  selections: Array<CartSelection>;
  unavailable_reason?: Maybe<Scalars['String']['output']>;
  unit_price: Scalars['Int']['output'];
};

export type CartSelection = {
  __typename?: 'CartSelection';
  group_id: Scalars['Int']['output'];
  group_name: Scalars['String']['output'];
  option_id?: Maybe<Scalars['Int']['output']>;
  option_name?: Maybe<Scalars['String']['output']>;
  price_modifier: Scalars['Int']['output'];
  text?: Maybe<Scalars['String']['output']>;
};

export type Category = {
  __typename?: 'Category';
  icon?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  product_count: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  sort_order: Scalars['Int']['output'];
};

export type CategoryRef = {
  __typename?: 'CategoryRef';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type CheckoutQuote = {
  __typename?: 'CheckoutQuote';
  coupon_code?: Maybe<Scalars['String']['output']>;
  coupon_message?: Maybe<Scalars['String']['output']>;
  discount: Scalars['Int']['output'];
  item_count: Scalars['Int']['output'];
  problems: Array<Scalars['String']['output']>;
  shipping_fee: Scalars['Int']['output'];
  subtotal: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type CheckoutQuoteInput = {
  coupon_code?: InputMaybe<Scalars['String']['input']>;
};

export type Collection = {
  __typename?: 'Collection';
  description?: Maybe<Scalars['String']['output']>;
  ends_at?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Int']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  product_count: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  starts_at?: Maybe<Scalars['DateTime']['output']>;
};

export type CollectionRef = {
  __typename?: 'CollectionRef';
  ends_at?: Maybe<Scalars['DateTime']['output']>;
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  starts_at?: Maybe<Scalars['DateTime']['output']>;
};

export type CommissionGlaze = {
  __typename?: 'CommissionGlaze';
  color_code?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type CommissionOptions = {
  __typename?: 'CommissionOptions';
  glazes: Array<CommissionGlaze>;
  piece_types: Array<CommissionPiece>;
};

export type CommissionPiece = {
  __typename?: 'CommissionPiece';
  name: Scalars['String']['output'];
  sizes: Array<Scalars['String']['output']>;
};

export type CommissionRequest = {
  __typename?: 'CommissionRequest';
  carved_words?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  glaze: Scalars['String']['output'];
  id: Scalars['String']['output'];
  is_read: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  notes?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  piece_type: Scalars['String']['output'];
  reference_image_urls: Array<Scalars['String']['output']>;
  size: Scalars['String']['output'];
  status: CommissionStatus;
};

export type CommissionRequestInput = {
  carved_words?: InputMaybe<Scalars['String']['input']>;
  email: Scalars['String']['input'];
  glaze: Scalars['String']['input'];
  name: Scalars['String']['input'];
  notes?: InputMaybe<Scalars['String']['input']>;
  phone?: InputMaybe<Scalars['String']['input']>;
  piece_type: Scalars['String']['input'];
  reference_image_urls?: InputMaybe<Array<Scalars['String']['input']>>;
  size: Scalars['String']['input'];
};

export type CommissionRequestsFilterInput = {
  is_read?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<CommissionStatus>;
};

export type CommissionRequestsResult = {
  __typename?: 'CommissionRequestsResult';
  items: Array<CommissionRequest>;
  page_info: PageInfo;
};

export enum CommissionStatus {
  Accepted = 'ACCEPTED',
  Declined = 'DECLINED',
  New = 'NEW',
  Sketched = 'SKETCHED'
}

export type ConfirmedImage = {
  __typename?: 'ConfirmedImage';
  bytes: Scalars['Int']['output'];
  height: Scalars['Int']['output'];
  key: Scalars['String']['output'];
  public_url: Scalars['String']['output'];
  width: Scalars['Int']['output'];
};

export type ContactMessage = {
  __typename?: 'ContactMessage';
  created_at: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  is_read: Scalars['Boolean']['output'];
  message: Scalars['String']['output'];
  name: Scalars['String']['output'];
  phone?: Maybe<Scalars['String']['output']>;
  subject?: Maybe<Scalars['String']['output']>;
};

export type ContactMessageInput = {
  email: Scalars['String']['input'];
  message: Scalars['String']['input'];
  name: Scalars['String']['input'];
  phone?: InputMaybe<Scalars['String']['input']>;
  subject?: InputMaybe<Scalars['String']['input']>;
};

export type ContactMessagesResult = {
  __typename?: 'ContactMessagesResult';
  items: Array<ContactMessage>;
  page_info: PageInfo;
};

export type ContentPage = {
  __typename?: 'ContentPage';
  hero_image_url?: Maybe<Scalars['String']['output']>;
  is_published: Scalars['Boolean']['output'];
  sections: Array<ContentSection>;
  slug: Scalars['String']['output'];
  subtitle?: Maybe<Scalars['String']['output']>;
  title: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type ContentPageInput = {
  hero_image_url?: InputMaybe<Scalars['String']['input']>;
  is_published?: InputMaybe<Scalars['Boolean']['input']>;
  sections: Array<ContentSectionInput>;
  subtitle?: InputMaybe<Scalars['String']['input']>;
  title: Scalars['String']['input'];
};

export type ContentPageSummary = {
  __typename?: 'ContentPageSummary';
  is_published: Scalars['Boolean']['output'];
  slug: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ContentSection = {
  __typename?: 'ContentSection';
  body: Scalars['String']['output'];
  heading: Scalars['String']['output'];
  items: Array<ContentSectionItem>;
};

export type ContentSectionInput = {
  body: Scalars['String']['input'];
  heading: Scalars['String']['input'];
  items?: InputMaybe<Array<ContentSectionItemInput>>;
};

export type ContentSectionItem = {
  __typename?: 'ContentSectionItem';
  body: Scalars['String']['output'];
  title: Scalars['String']['output'];
};

export type ContentSectionItemInput = {
  body: Scalars['String']['input'];
  title: Scalars['String']['input'];
};

export enum CouponKind {
  Fixed = 'FIXED',
  Percent = 'PERCENT'
}

export type Event = {
  __typename?: 'Event';
  address: Scalars['String']['output'];
  available_seats: Scalars['Int']['output'];
  description: Scalars['String']['output'];
  ends_at: Scalars['DateTime']['output'];
  event_type: EventType;
  gallery: Array<Scalars['String']['output']>;
  highlights: Array<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  image_url: Scalars['String']['output'];
  includes: Array<Scalars['String']['output']>;
  instructor?: Maybe<Scalars['String']['output']>;
  is_past: Scalars['Boolean']['output'];
  level?: Maybe<EventLevel>;
  location: Scalars['String']['output'];
  my_registration?: Maybe<Registration>;
  performers: Array<Scalars['String']['output']>;
  price: Scalars['Int']['output'];
  rating_avg: Scalars['Float']['output'];
  rating_count: Scalars['Int']['output'];
  review_eligibility: ReviewEligibility;
  slug: Scalars['String']['output'];
  starts_at: Scalars['DateTime']['output'];
  status: EventStatus;
  title: Scalars['String']['output'];
  total_seats: Scalars['Int']['output'];
};

export enum EventLevel {
  Advanced = 'ADVANCED',
  AllLevels = 'ALL_LEVELS',
  Beginner = 'BEGINNER',
  Intermediate = 'INTERMEDIATE'
}

export enum EventStatus {
  Cancelled = 'CANCELLED',
  Completed = 'COMPLETED',
  Draft = 'DRAFT',
  Published = 'PUBLISHED'
}

export enum EventType {
  OpenMic = 'OPEN_MIC',
  PotteryWorkshop = 'POTTERY_WORKSHOP'
}

export enum EventWhen {
  Past = 'PAST',
  Upcoming = 'UPCOMING'
}

export type EventsFilterInput = {
  event_type?: InputMaybe<EventType>;
  level?: InputMaybe<EventLevel>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  when?: InputMaybe<EventWhen>;
};

export type EventsResult = {
  __typename?: 'EventsResult';
  items: Array<Event>;
  page_info: PageInfo;
};

export type FacetCount = {
  __typename?: 'FacetCount';
  count: Scalars['Int']['output'];
  label: Scalars['String']['output'];
  value: Scalars['String']['output'];
};

export type Glaze = {
  __typename?: 'Glaze';
  color_code?: Maybe<Scalars['String']['output']>;
  description: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  pieces: Array<Product>;
  slug: Scalars['String']['output'];
  swatch_url?: Maybe<Scalars['String']['output']>;
  variation_note?: Maybe<Scalars['String']['output']>;
};

export type ImageSpec = {
  __typename?: 'ImageSpec';
  content_types: Array<Scalars['String']['output']>;
  max_bytes: Scalars['Int']['output'];
  min_height: Scalars['Int']['output'];
  min_width: Scalars['Int']['output'];
  purpose: UploadPurpose;
  ratio?: Maybe<Scalars['Float']['output']>;
  ratio_label: Scalars['String']['output'];
  renders_at: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  addOrderNote: Order;
  addToCart: Cart;
  adjustProductStock: Product;
  bookStudioVisit: StudioVisit;
  bookWorkshop: WorkshopBooking;
  cancelEvent: Event;
  cancelOrder: Order;
  cancelOrderAsAdmin: AdminOrder;
  cancelRegistration: Registration;
  cancelStudioVisit: StudioVisit;
  cancelWorkshopBooking: WorkshopBooking;
  clearCart: Cart;
  completeEvent: Event;
  confirmUpload: ConfirmedImage;
  createAddress: Address;
  createAdminUpload: UploadTarget;
  createCategory: Category;
  createCollection: Collection;
  createCommissionRequest: CommissionRequest;
  createCoupon: AdminCoupon;
  createCustomizationUpload: UploadTicket;
  createEvent: Event;
  createEventReview: Review;
  createGlaze: AdminGlaze;
  createProduct: Product;
  createProductOption: ProductOptionGroup;
  createProductOptionGroup: ProductOptionGroup;
  createProductReview: Review;
  createReviewImageUpload: UploadTarget;
  createWorkshopBlackout: AdminWorkshopBlackout;
  deleteAddress: Scalars['Boolean']['output'];
  deleteCategory: Scalars['Boolean']['output'];
  deleteCollection: Scalars['Boolean']['output'];
  deleteContactMessage: Scalars['Boolean']['output'];
  deleteContentPage: Scalars['Boolean']['output'];
  deleteCoupon: Scalars['Boolean']['output'];
  deleteGlaze: Scalars['Boolean']['output'];
  deleteProductOption: Scalars['Boolean']['output'];
  deleteProductOptionGroup: Scalars['Boolean']['output'];
  deleteReview: Scalars['Boolean']['output'];
  deleteReviewAsAdmin: Scalars['Boolean']['output'];
  deleteWorkshopBlackout: Scalars['Boolean']['output'];
  deleteWorkshopTier: Scalars['Boolean']['output'];
  markCommissionRequestRead: CommissionRequest;
  markOrderPaid: AdminOrder;
  notifyWhenBackInStock: BatchNotificationResult;
  placeOrder: Order;
  publishEvent: Event;
  recordWhatsAppMessage: Scalars['Boolean']['output'];
  registerForEvent: Registration;
  removeCartItem: Cart;
  reorderProductImages: Product;
  rescheduleWorkshopBooking: WorkshopBooking;
  saveContentPage: ContentPage;
  saveWorkshopTier: WorkshopConfig;
  sendContactMessage: Scalars['Boolean']['output'];
  sendWhatsAppReply: Scalars['Boolean']['output'];
  setCommissionRequestStatus: CommissionRequest;
  setContactMessageRead: ContactMessage;
  setDefaultAddress: Address;
  setOrderAdminNote: AdminOrder;
  setOrderStatus: AdminOrder;
  setProductActive: Product;
  setProductFeatured: Product;
  setRegistrationStatus: AdminRegistration;
  setReviewHidden: AdminReview;
  setUserRole: AdminUser;
  setWorkshopBookingStatus: AdminWorkshopBooking;
  stopBatchNotification: Scalars['Boolean']['output'];
  subscribeToNewsletter: NewsletterResult;
  toggleWishlist: WishlistToggleResult;
  unpublishEvent: Event;
  unsubscribeFromNewsletter: Scalars['Boolean']['output'];
  unsubscribeSubscriber: Scalars['Boolean']['output'];
  updateAddress: Address;
  updateAnnouncement: SiteSettings;
  updateCartItem: Cart;
  updateCategory: Category;
  updateCollection: Collection;
  updateCoupon: AdminCoupon;
  updateEvent: Event;
  updateGlaze: AdminGlaze;
  updateProduct: Product;
  updateProductOption: ProductOptionGroup;
  updateProductOptionGroup: ProductOptionGroup;
  updateReview: Review;
  updateSiteSettings: SiteSettings;
  updateWorkshopBlackout: AdminWorkshopBlackout;
  updateWorkshopConfig: WorkshopConfig;
};


export type MutationAddOrderNoteArgs = {
  input: AddOrderNoteInput;
};


export type MutationAddToCartArgs = {
  input: AddToCartInput;
};


export type MutationAdjustProductStockArgs = {
  delta: Scalars['Int']['input'];
  id: Scalars['Int']['input'];
  reason: Scalars['String']['input'];
};


export type MutationBookStudioVisitArgs = {
  input: StudioVisitInput;
};


export type MutationBookWorkshopArgs = {
  input: BookWorkshopInput;
};


export type MutationCancelEventArgs = {
  id: Scalars['Int']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCancelOrderArgs = {
  id: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCancelOrderAsAdminArgs = {
  id: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCancelRegistrationArgs = {
  id: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCancelStudioVisitArgs = {
  id: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCancelWorkshopBookingArgs = {
  id: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCompleteEventArgs = {
  id: Scalars['Int']['input'];
};


export type MutationConfirmUploadArgs = {
  key: Scalars['String']['input'];
  purpose: UploadPurpose;
};


export type MutationCreateAddressArgs = {
  input: AddressInput;
};


export type MutationCreateAdminUploadArgs = {
  content_type: Scalars['String']['input'];
  purpose: UploadPurpose;
  size: Scalars['Int']['input'];
};


export type MutationCreateCategoryArgs = {
  input: AdminCategoryInput;
};


export type MutationCreateCollectionArgs = {
  input: AdminCollectionInput;
};


export type MutationCreateCommissionRequestArgs = {
  input: CommissionRequestInput;
};


export type MutationCreateCouponArgs = {
  input: AdminCouponInput;
};


export type MutationCreateCustomizationUploadArgs = {
  content_type: Scalars['String']['input'];
  size: Scalars['Int']['input'];
};


export type MutationCreateEventArgs = {
  input: AdminEventInput;
};


export type MutationCreateEventReviewArgs = {
  event_id: Scalars['Int']['input'];
  input: ReviewInput;
};


export type MutationCreateGlazeArgs = {
  input: AdminGlazeInput;
};


export type MutationCreateProductArgs = {
  input: AdminProductInput;
};


export type MutationCreateProductOptionArgs = {
  group_id: Scalars['Int']['input'];
  input: AdminOptionInput;
};


export type MutationCreateProductOptionGroupArgs = {
  input: AdminOptionGroupInput;
  product_id: Scalars['Int']['input'];
};


export type MutationCreateProductReviewArgs = {
  input: ReviewInput;
  product_id: Scalars['Int']['input'];
};


export type MutationCreateReviewImageUploadArgs = {
  input: ReviewUploadInput;
};


export type MutationCreateWorkshopBlackoutArgs = {
  config_id: Scalars['Int']['input'];
  input: AdminWorkshopBlackoutInput;
};


export type MutationDeleteAddressArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteCategoryArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteCollectionArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteContactMessageArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteContentPageArgs = {
  slug: Scalars['String']['input'];
};


export type MutationDeleteCouponArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteGlazeArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteProductOptionArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteProductOptionGroupArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteReviewArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteReviewAsAdminArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteWorkshopBlackoutArgs = {
  id: Scalars['Int']['input'];
};


export type MutationDeleteWorkshopTierArgs = {
  id: Scalars['Int']['input'];
};


export type MutationMarkCommissionRequestReadArgs = {
  id: Scalars['String']['input'];
};


export type MutationMarkOrderPaidArgs = {
  id: Scalars['String']['input'];
};


export type MutationNotifyWhenBackInStockArgs = {
  email: Scalars['String']['input'];
  product_id: Scalars['Int']['input'];
};


export type MutationPlaceOrderArgs = {
  input: PlaceOrderInput;
};


export type MutationPublishEventArgs = {
  id: Scalars['Int']['input'];
};


export type MutationRecordWhatsAppMessageArgs = {
  input: RecordWhatsAppMessageInput;
};


export type MutationRegisterForEventArgs = {
  input: RegisterForEventInput;
};


export type MutationRemoveCartItemArgs = {
  id: Scalars['Int']['input'];
};


export type MutationReorderProductImagesArgs = {
  id: Scalars['Int']['input'];
  image_urls: Array<Scalars['String']['input']>;
};


export type MutationRescheduleWorkshopBookingArgs = {
  input: RescheduleWorkshopInput;
};


export type MutationSaveContentPageArgs = {
  input: ContentPageInput;
  slug: Scalars['String']['input'];
};


export type MutationSaveWorkshopTierArgs = {
  config_id: Scalars['Int']['input'];
  input: AdminWorkshopTierInput;
};


export type MutationSendContactMessageArgs = {
  input: ContactMessageInput;
};


export type MutationSendWhatsAppReplyArgs = {
  input: SendWhatsAppReplyInput;
};


export type MutationSetCommissionRequestStatusArgs = {
  id: Scalars['String']['input'];
  status: CommissionStatus;
};


export type MutationSetContactMessageReadArgs = {
  id: Scalars['Int']['input'];
  is_read: Scalars['Boolean']['input'];
};


export type MutationSetDefaultAddressArgs = {
  id: Scalars['Int']['input'];
};


export type MutationSetOrderAdminNoteArgs = {
  id: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetOrderStatusArgs = {
  cancel_reason?: InputMaybe<Scalars['String']['input']>;
  id: Scalars['String']['input'];
  status: OrderStatus;
  tracking_note?: InputMaybe<Scalars['String']['input']>;
};


export type MutationSetProductActiveArgs = {
  id: Scalars['Int']['input'];
  is_active: Scalars['Boolean']['input'];
};


export type MutationSetProductFeaturedArgs = {
  id: Scalars['Int']['input'];
  is_featured: Scalars['Boolean']['input'];
};


export type MutationSetRegistrationStatusArgs = {
  id: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  status: RegistrationStatus;
};


export type MutationSetReviewHiddenArgs = {
  id: Scalars['Int']['input'];
  is_hidden: Scalars['Boolean']['input'];
};


export type MutationSetUserRoleArgs = {
  id: Scalars['Int']['input'];
  role: UserRole;
};


export type MutationSetWorkshopBookingStatusArgs = {
  id: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
  status: RegistrationStatus;
};


export type MutationStopBatchNotificationArgs = {
  token: Scalars['String']['input'];
};


export type MutationSubscribeToNewsletterArgs = {
  email: Scalars['String']['input'];
};


export type MutationToggleWishlistArgs = {
  product_id: Scalars['Int']['input'];
};


export type MutationUnpublishEventArgs = {
  id: Scalars['Int']['input'];
};


export type MutationUnsubscribeFromNewsletterArgs = {
  token: Scalars['String']['input'];
};


export type MutationUnsubscribeSubscriberArgs = {
  email: Scalars['String']['input'];
};


export type MutationUpdateAddressArgs = {
  id: Scalars['Int']['input'];
  input: AddressInput;
};


export type MutationUpdateAnnouncementArgs = {
  input: AdminAnnouncementInput;
};


export type MutationUpdateCartItemArgs = {
  id: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
};


export type MutationUpdateCategoryArgs = {
  id: Scalars['Int']['input'];
  input: AdminCategoryInput;
};


export type MutationUpdateCollectionArgs = {
  id: Scalars['Int']['input'];
  input: AdminCollectionInput;
};


export type MutationUpdateCouponArgs = {
  id: Scalars['Int']['input'];
  input: AdminCouponInput;
};


export type MutationUpdateEventArgs = {
  id: Scalars['Int']['input'];
  input: AdminEventInput;
};


export type MutationUpdateGlazeArgs = {
  id: Scalars['Int']['input'];
  input: AdminGlazeInput;
};


export type MutationUpdateProductArgs = {
  id: Scalars['Int']['input'];
  input: AdminProductUpdateInput;
};


export type MutationUpdateProductOptionArgs = {
  id: Scalars['Int']['input'];
  input: AdminOptionInput;
};


export type MutationUpdateProductOptionGroupArgs = {
  id: Scalars['Int']['input'];
  input: AdminOptionGroupInput;
};


export type MutationUpdateReviewArgs = {
  id: Scalars['Int']['input'];
  input: ReviewInput;
};


export type MutationUpdateSiteSettingsArgs = {
  input: AdminSiteSettingsInput;
};


export type MutationUpdateWorkshopBlackoutArgs = {
  id: Scalars['Int']['input'];
  input: AdminWorkshopBlackoutInput;
};


export type MutationUpdateWorkshopConfigArgs = {
  id: Scalars['Int']['input'];
  input: AdminWorkshopConfigInput;
};

export type NewsletterResult = {
  __typename?: 'NewsletterResult';
  email: Scalars['String']['output'];
  is_active: Scalars['Boolean']['output'];
  was_already_subscribed: Scalars['Boolean']['output'];
};

export type NewsletterStatus = {
  __typename?: 'NewsletterStatus';
  email?: Maybe<Scalars['String']['output']>;
  is_subscribed: Scalars['Boolean']['output'];
};

export enum OptionGroupKind {
  Choice = 'CHOICE',
  Text = 'TEXT'
}

export type Order = {
  __typename?: 'Order';
  can_cancel: Scalars['Boolean']['output'];
  cancel_reason?: Maybe<Scalars['String']['output']>;
  cancelled_at?: Maybe<Scalars['DateTime']['output']>;
  care_notes: Array<Scalars['String']['output']>;
  confirmed_at?: Maybe<Scalars['DateTime']['output']>;
  coupon_code?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  customer_note?: Maybe<Scalars['String']['output']>;
  delivered_at?: Maybe<Scalars['DateTime']['output']>;
  discount: Scalars['Int']['output'];
  gift_note?: Maybe<Scalars['String']['output']>;
  hide_prices: Scalars['Boolean']['output'];
  id: Scalars['String']['output'];
  item_count: Scalars['Int']['output'];
  items: Array<OrderItem>;
  paid_at?: Maybe<Scalars['DateTime']['output']>;
  refunded_at?: Maybe<Scalars['DateTime']['output']>;
  shipped_at?: Maybe<Scalars['DateTime']['output']>;
  shipping_address: ShippingAddress;
  shipping_fee: Scalars['Int']['output'];
  status: OrderStatus;
  studio_notes: Array<OrderNote>;
  subtotal: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
  tracking_note?: Maybe<Scalars['String']['output']>;
};

export type OrderItem = {
  __typename?: 'OrderItem';
  id: Scalars['Int']['output'];
  line_total: Scalars['Int']['output'];
  product?: Maybe<Product>;
  product_image?: Maybe<Scalars['String']['output']>;
  product_name: Scalars['String']['output'];
  quantity: Scalars['Int']['output'];
  reference_image_urls: Array<Scalars['String']['output']>;
  selections: Array<CartSelection>;
  unit_price: Scalars['Int']['output'];
};

export type OrderNote = {
  __typename?: 'OrderNote';
  body: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
};

export enum OrderStatus {
  Cancelled = 'CANCELLED',
  Confirmed = 'CONFIRMED',
  Delivered = 'DELIVERED',
  Paid = 'PAID',
  Pending = 'PENDING',
  Refunded = 'REFUNDED',
  Shipped = 'SHIPPED'
}

export type OrdersResult = {
  __typename?: 'OrdersResult';
  items: Array<Order>;
  page_info: PageInfo;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  has_more: Scalars['Boolean']['output'];
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type PlaceOrderInput = {
  address_id: Scalars['Int']['input'];
  coupon_code?: InputMaybe<Scalars['String']['input']>;
  customer_note?: InputMaybe<Scalars['String']['input']>;
  gift_note?: InputMaybe<Scalars['String']['input']>;
  hide_prices?: InputMaybe<Scalars['Boolean']['input']>;
};

export type Product = {
  __typename?: 'Product';
  capacity_ml?: Maybe<Scalars['Int']['output']>;
  care_notes: Array<Scalars['String']['output']>;
  categories: Array<CategoryRef>;
  collection?: Maybe<CollectionRef>;
  color_code?: Maybe<Scalars['String']['output']>;
  color_name?: Maybe<Scalars['String']['output']>;
  compare_at_price?: Maybe<Scalars['Int']['output']>;
  created_at: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  diameter_cm?: Maybe<Scalars['Float']['output']>;
  dimensions?: Maybe<Scalars['String']['output']>;
  flaw_note?: Maybe<Scalars['String']['output']>;
  glaze?: Maybe<Glaze>;
  height_cm?: Maybe<Scalars['Float']['output']>;
  id: Scalars['Int']['output'];
  image_urls: Array<Scalars['String']['output']>;
  in_wishlist: Scalars['Boolean']['output'];
  is_active: Scalars['Boolean']['output'];
  is_archived: Scalars['Boolean']['output'];
  is_commission: Scalars['Boolean']['output'];
  is_customizable: Scalars['Boolean']['output'];
  is_featured: Scalars['Boolean']['output'];
  is_second: Scalars['Boolean']['output'];
  maker_note?: Maybe<Scalars['String']['output']>;
  material: Scalars['String']['output'];
  name: Scalars['String']['output'];
  option_groups: Array<ProductOptionGroup>;
  price: Scalars['Int']['output'];
  rating_avg: Scalars['Float']['output'];
  rating_count: Scalars['Int']['output'];
  review_eligibility: ReviewEligibility;
  sales_count: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  stock: Scalars['Int']['output'];
  weight_g?: Maybe<Scalars['Int']['output']>;
};

export type ProductFacets = {
  __typename?: 'ProductFacets';
  active_count: Scalars['Int']['output'];
  archive_count: Scalars['Int']['output'];
  categories: Array<FacetCount>;
  collections: Array<FacetCount>;
  glazes: Array<FacetCount>;
  materials: Array<FacetCount>;
  price_max: Scalars['Int']['output'];
  price_min: Scalars['Int']['output'];
  seconds_count: Scalars['Int']['output'];
};

export type ProductOption = {
  __typename?: 'ProductOption';
  id: Scalars['Int']['output'];
  is_active: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  price_modifier: Scalars['Int']['output'];
  sort_order: Scalars['Int']['output'];
};

export type ProductOptionGroup = {
  __typename?: 'ProductOptionGroup';
  id: Scalars['Int']['output'];
  is_required: Scalars['Boolean']['output'];
  kind: OptionGroupKind;
  max_length?: Maybe<Scalars['Int']['output']>;
  name: Scalars['String']['output'];
  options: Array<ProductOption>;
  price_modifier: Scalars['Int']['output'];
  sort_order: Scalars['Int']['output'];
};

export enum ProductSort {
  BestSelling = 'BEST_SELLING',
  Featured = 'FEATURED',
  Newest = 'NEWEST',
  PriceHighToLow = 'PRICE_HIGH_TO_LOW',
  PriceLowToHigh = 'PRICE_LOW_TO_HIGH',
  TopRated = 'TOP_RATED'
}

export type ProductsFilterInput = {
  archive?: InputMaybe<Scalars['Boolean']['input']>;
  category_slugs?: InputMaybe<Array<Scalars['String']['input']>>;
  collection_slug?: InputMaybe<Scalars['String']['input']>;
  customizable_only?: InputMaybe<Scalars['Boolean']['input']>;
  glaze_slugs?: InputMaybe<Array<Scalars['String']['input']>>;
  in_stock_only?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  materials?: InputMaybe<Array<Scalars['String']['input']>>;
  max_price?: InputMaybe<Scalars['Int']['input']>;
  min_price?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
  seconds_only?: InputMaybe<Scalars['Boolean']['input']>;
  sort?: InputMaybe<ProductSort>;
};

export type ProductsResult = {
  __typename?: 'ProductsResult';
  facets: ProductFacets;
  items: Array<Product>;
  page_info: PageInfo;
};

export type Query = {
  __typename?: 'Query';
  addresses: Array<Address>;
  adminBatchNotifications: AdminBatchNotificationsResult;
  adminCategories: Array<Category>;
  adminCollections: Array<Collection>;
  adminContactMessages: ContactMessagesResult;
  adminContentPage: ContentPage;
  adminContentPages: Array<ContentPageSummary>;
  adminCoupons: AdminCouponsResult;
  adminDashboard: AdminDashboard;
  adminEvent: Event;
  adminEventRegistrations: AdminRegistrationsResult;
  adminEvents: AdminEventsResult;
  adminGlazes: AdminGlazesResult;
  adminNewsletterSubscribers: AdminSubscribersResult;
  adminOrder: AdminOrder;
  adminOrders: AdminOrdersResult;
  adminProduct: Product;
  adminProductOptionGroups: Array<ProductOptionGroup>;
  adminProducts: AdminProductsResult;
  adminReviews: AdminReviewsResult;
  adminStudioVisits: AdminStudioVisitsResult;
  adminUser: AdminUser;
  adminUsers: AdminUsersResult;
  adminWhatsAppMessages: AdminWhatsAppMessagesResult;
  adminWorkshopBlackouts: Array<AdminWorkshopBlackout>;
  adminWorkshopBookings: AdminWorkshopBookingsResult;
  adminWorkshopConfigs: Array<WorkshopConfig>;
  cart: Cart;
  cartCount: Scalars['Int']['output'];
  categories: Array<Category>;
  checkoutQuote: CheckoutQuote;
  collection: Collection;
  collections: Array<Collection>;
  commissionOptions: CommissionOptions;
  commissionPieces: Array<Product>;
  commissionRequests: CommissionRequestsResult;
  contentPage: ContentPage;
  event: Event;
  eventReviews: ReviewsResult;
  events: EventsResult;
  exportBatchNotifications: Scalars['String']['output'];
  exportNewsletterSubscribers: Scalars['String']['output'];
  featuredProducts: Array<Product>;
  glaze: Glaze;
  glazes: Array<Glaze>;
  imageSpecs: Array<ImageSpec>;
  myRegistrations: RegistrationsResult;
  myWorkshopBookings: WorkshopBookingsResult;
  newsletterStatus: NewsletterStatus;
  order: Order;
  orders: OrdersResult;
  product: Product;
  productReviews: ReviewsResult;
  products: ProductsResult;
  recentReviews: Array<Review>;
  registration: Registration;
  relatedProducts: Array<Product>;
  siteSettings: SiteSettings;
  sitemap: Sitemap;
  studioVisitAvailability: Array<VisitDay>;
  suggest: Suggestions;
  upcomingEvents: Array<Event>;
  wishlist: Array<Product>;
  wishlistIds: Array<Scalars['Int']['output']>;
  workshop: WorkshopConfig;
  workshopAvailability: Array<WorkshopDay>;
  workshopBooking: WorkshopBooking;
  workshops: Array<WorkshopConfig>;
};


export type QueryAdminBatchNotificationsArgs = {
  filter?: InputMaybe<AdminBatchNotificationsFilterInput>;
};


export type QueryAdminContactMessagesArgs = {
  filter?: InputMaybe<AdminContactFilterInput>;
};


export type QueryAdminContentPageArgs = {
  slug: Scalars['String']['input'];
};


export type QueryAdminCouponsArgs = {
  filter?: InputMaybe<AdminCouponsFilterInput>;
};


export type QueryAdminEventArgs = {
  id: Scalars['Int']['input'];
};


export type QueryAdminEventRegistrationsArgs = {
  filter?: InputMaybe<AdminRegistrationsFilterInput>;
};


export type QueryAdminEventsArgs = {
  filter?: InputMaybe<AdminEventsFilterInput>;
};


export type QueryAdminGlazesArgs = {
  filter?: InputMaybe<AdminGlazesFilterInput>;
};


export type QueryAdminNewsletterSubscribersArgs = {
  filter?: InputMaybe<AdminSubscribersFilterInput>;
};


export type QueryAdminOrderArgs = {
  id: Scalars['String']['input'];
};


export type QueryAdminOrdersArgs = {
  filter?: InputMaybe<AdminOrdersFilterInput>;
};


export type QueryAdminProductArgs = {
  id: Scalars['Int']['input'];
};


export type QueryAdminProductOptionGroupsArgs = {
  product_id: Scalars['Int']['input'];
};


export type QueryAdminProductsArgs = {
  filter?: InputMaybe<AdminProductsFilterInput>;
};


export type QueryAdminReviewsArgs = {
  filter?: InputMaybe<AdminReviewsFilterInput>;
};


export type QueryAdminStudioVisitsArgs = {
  filter?: InputMaybe<AdminStudioVisitsFilterInput>;
};


export type QueryAdminUserArgs = {
  id: Scalars['Int']['input'];
};


export type QueryAdminUsersArgs = {
  filter?: InputMaybe<AdminUsersFilterInput>;
};


export type QueryAdminWhatsAppMessagesArgs = {
  filter?: InputMaybe<AdminWhatsAppFilterInput>;
};


export type QueryAdminWorkshopBlackoutsArgs = {
  config_id: Scalars['Int']['input'];
};


export type QueryAdminWorkshopBookingsArgs = {
  filter?: InputMaybe<AdminWorkshopBookingsFilterInput>;
};


export type QueryCheckoutQuoteArgs = {
  input?: InputMaybe<CheckoutQuoteInput>;
};


export type QueryCollectionArgs = {
  archive?: InputMaybe<Scalars['Boolean']['input']>;
  slug: Scalars['String']['input'];
};


export type QueryCollectionsArgs = {
  archive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryCommissionPiecesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryCommissionRequestsArgs = {
  filter?: InputMaybe<CommissionRequestsFilterInput>;
};


export type QueryContentPageArgs = {
  slug: Scalars['String']['input'];
};


export type QueryEventArgs = {
  slug: Scalars['String']['input'];
};


export type QueryEventReviewsArgs = {
  event_id: Scalars['Int']['input'];
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryEventsArgs = {
  filter?: InputMaybe<EventsFilterInput>;
};


export type QueryExportBatchNotificationsArgs = {
  filter?: InputMaybe<AdminBatchNotificationsFilterInput>;
};


export type QueryExportNewsletterSubscribersArgs = {
  filter?: InputMaybe<AdminSubscribersFilterInput>;
};


export type QueryFeaturedProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryGlazeArgs = {
  slug: Scalars['String']['input'];
};


export type QueryMyRegistrationsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryMyWorkshopBookingsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryOrderArgs = {
  id: Scalars['String']['input'];
};


export type QueryOrdersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProductArgs = {
  slug: Scalars['String']['input'];
};


export type QueryProductReviewsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  product_id: Scalars['Int']['input'];
};


export type QueryProductsArgs = {
  filter?: InputMaybe<ProductsFilterInput>;
};


export type QueryRecentReviewsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryRegistrationArgs = {
  id: Scalars['String']['input'];
};


export type QueryRelatedProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  slug: Scalars['String']['input'];
};


export type QueryStudioVisitAvailabilityArgs = {
  days?: InputMaybe<Scalars['Int']['input']>;
  from?: InputMaybe<Scalars['String']['input']>;
};


export type QuerySuggestArgs = {
  q: Scalars['String']['input'];
};


export type QueryUpcomingEventsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryWorkshopArgs = {
  slug: Scalars['String']['input'];
};


export type QueryWorkshopAvailabilityArgs = {
  input: WorkshopAvailabilityInput;
};


export type QueryWorkshopBookingArgs = {
  id: Scalars['String']['input'];
};

export type RatingSummary = {
  __typename?: 'RatingSummary';
  average: Scalars['Float']['output'];
  count: Scalars['Int']['output'];
  distribution: Array<Scalars['Int']['output']>;
};

export type RecordWhatsAppMessageInput = {
  body: Scalars['String']['input'];
  kind: Scalars['String']['input'];
  page_url?: InputMaybe<Scalars['String']['input']>;
  reference?: InputMaybe<Scalars['String']['input']>;
};

export type RegisterForEventInput = {
  event_id: Scalars['Int']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  seats?: InputMaybe<Scalars['Int']['input']>;
};

export type Registration = {
  __typename?: 'Registration';
  approved_at?: Maybe<Scalars['DateTime']['output']>;
  can_cancel: Scalars['Boolean']['output'];
  cancel_reason?: Maybe<Scalars['String']['output']>;
  cancelled_at?: Maybe<Scalars['DateTime']['output']>;
  confirmed_at?: Maybe<Scalars['DateTime']['output']>;
  created_at: Scalars['DateTime']['output'];
  discount: Scalars['Int']['output'];
  event: Event;
  id: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  rejected_at?: Maybe<Scalars['DateTime']['output']>;
  seats: Scalars['Int']['output'];
  status: RegistrationStatus;
  total: Scalars['Int']['output'];
  unit_price: Scalars['Int']['output'];
};

export enum RegistrationStatus {
  Approved = 'APPROVED',
  Cancelled = 'CANCELLED',
  Confirmed = 'CONFIRMED',
  Pending = 'PENDING',
  Rejected = 'REJECTED'
}

export type RegistrationsResult = {
  __typename?: 'RegistrationsResult';
  items: Array<Registration>;
  page_info: PageInfo;
};

export type RescheduleWorkshopInput = {
  booking_id: Scalars['String']['input'];
  slot_starts: Array<Scalars['DateTime']['input']>;
};

export type Review = {
  __typename?: 'Review';
  author: ReviewAuthor;
  body?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  id: Scalars['Int']['output'];
  image_urls: Array<Scalars['String']['output']>;
  is_mine: Scalars['Boolean']['output'];
  rating: Scalars['Int']['output'];
  subject_href?: Maybe<Scalars['String']['output']>;
  subject_name?: Maybe<Scalars['String']['output']>;
};

export type ReviewAuthor = {
  __typename?: 'ReviewAuthor';
  image?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
};

export type ReviewEligibility = {
  __typename?: 'ReviewEligibility';
  can_review: Scalars['Boolean']['output'];
  my_review?: Maybe<Review>;
  reason?: Maybe<Scalars['String']['output']>;
};

export type ReviewInput = {
  body?: InputMaybe<Scalars['String']['input']>;
  image_urls?: InputMaybe<Array<Scalars['String']['input']>>;
  rating: Scalars['Int']['input'];
};

export enum ReviewSubjectKind {
  Event = 'EVENT',
  Product = 'PRODUCT'
}

export type ReviewUploadInput = {
  content_type: Scalars['String']['input'];
  event_id?: InputMaybe<Scalars['Int']['input']>;
  filename: Scalars['String']['input'];
  product_id?: InputMaybe<Scalars['Int']['input']>;
  size: Scalars['Int']['input'];
};

export type ReviewsResult = {
  __typename?: 'ReviewsResult';
  items: Array<Review>;
  page_info: PageInfo;
  summary: RatingSummary;
};

export type SelectionInputType = {
  group_id: Scalars['Int']['input'];
  option_id?: InputMaybe<Scalars['Int']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
};

export type SendWhatsAppReplyInput = {
  body: Scalars['String']['input'];
  kind: Scalars['String']['input'];
  reference?: InputMaybe<Scalars['String']['input']>;
  to_email: Scalars['String']['input'];
  to_phone?: InputMaybe<Scalars['String']['input']>;
};

export type ShippingAddress = {
  __typename?: 'ShippingAddress';
  city: Scalars['String']['output'];
  landmark?: Maybe<Scalars['String']['output']>;
  line1: Scalars['String']['output'];
  line2?: Maybe<Scalars['String']['output']>;
  name: Scalars['String']['output'];
  phone: Scalars['String']['output'];
  pincode: Scalars['String']['output'];
  state: Scalars['String']['output'];
};

export type SiteSettings = {
  __typename?: 'SiteSettings';
  address: Scalars['String']['output'];
  announcement_href?: Maybe<Scalars['String']['output']>;
  announcement_text?: Maybe<Scalars['String']['output']>;
  contact_email: Scalars['String']['output'];
  contact_phone: Scalars['String']['output'];
  dispatch_days_max: Scalars['Int']['output'];
  dispatch_days_min: Scalars['Int']['output'];
  facebook_url: Scalars['String']['output'];
  free_shipping_above?: Maybe<Scalars['Int']['output']>;
  hero_cta_href: Scalars['String']['output'];
  hero_cta_text: Scalars['String']['output'];
  hero_heading: Scalars['String']['output'];
  hero_image_url: Scalars['String']['output'];
  hero_subheading: Scalars['String']['output'];
  instagram_url: Scalars['String']['output'];
  opening_hours: Scalars['String']['output'];
  shipping_flat_fee: Scalars['Int']['output'];
  updated_at: Scalars['DateTime']['output'];
  whatsapp_number: Scalars['String']['output'];
  youtube_url: Scalars['String']['output'];
};

export type Sitemap = {
  __typename?: 'Sitemap';
  events: Array<SitemapEntry>;
  products: Array<SitemapEntry>;
  workshops: Array<SitemapEntry>;
};

export type SitemapEntry = {
  __typename?: 'SitemapEntry';
  slug: Scalars['String']['output'];
  updated_at: Scalars['DateTime']['output'];
};

export type StudioVisit = {
  __typename?: 'StudioVisit';
  cancelled_at?: Maybe<Scalars['DateTime']['output']>;
  ends_at: Scalars['DateTime']['output'];
  id: Scalars['String']['output'];
  name: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  phone: Scalars['String']['output'];
  starts_at: Scalars['DateTime']['output'];
};

export type StudioVisitInput = {
  name: Scalars['String']['input'];
  note?: InputMaybe<Scalars['String']['input']>;
  phone: Scalars['String']['input'];
  starts_at: Scalars['DateTime']['input'];
};

export type SuggestedEvent = {
  __typename?: 'SuggestedEvent';
  id: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  starts_at: Scalars['DateTime']['output'];
  title: Scalars['String']['output'];
};

export type SuggestedPiece = {
  __typename?: 'SuggestedPiece';
  id: Scalars['Int']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  is_archived: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  price: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
};

export type SuggestedWorkshop = {
  __typename?: 'SuggestedWorkshop';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type Suggestions = {
  __typename?: 'Suggestions';
  events: Array<SuggestedEvent>;
  pieces: Array<SuggestedPiece>;
  workshops: Array<SuggestedWorkshop>;
};

export enum UploadPurpose {
  Category = 'CATEGORY',
  Collection = 'COLLECTION',
  Content = 'CONTENT',
  Event = 'EVENT',
  Glaze = 'GLAZE',
  Hero = 'HERO',
  OrderNote = 'ORDER_NOTE',
  Product = 'PRODUCT',
  Review = 'REVIEW'
}

export type UploadTarget = {
  __typename?: 'UploadTarget';
  key: Scalars['String']['output'];
  public_url: Scalars['String']['output'];
  upload_url: Scalars['String']['output'];
};

export type UploadTicket = {
  __typename?: 'UploadTicket';
  key: Scalars['String']['output'];
  public_url: Scalars['String']['output'];
  upload_url: Scalars['String']['output'];
};

export enum UserRole {
  Admin = 'ADMIN',
  User = 'USER'
}

export type VisitDay = {
  __typename?: 'VisitDay';
  date: Scalars['String']['output'];
  is_closed: Scalars['Boolean']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  weekday: Scalars['Int']['output'];
  windows: Array<VisitWindow>;
};

export type VisitWindow = {
  __typename?: 'VisitWindow';
  ends_at: Scalars['DateTime']['output'];
  is_available: Scalars['Boolean']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  starts_at: Scalars['DateTime']['output'];
};

export enum WhatsAppDirection {
  ToCustomer = 'TO_CUSTOMER',
  ToStudio = 'TO_STUDIO'
}

export type WhatsAppMessage = {
  __typename?: 'WhatsAppMessage';
  body: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  direction: WhatsAppDirection;
  email?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  kind: Scalars['String']['output'];
  name?: Maybe<Scalars['String']['output']>;
  page_url?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  reference?: Maybe<Scalars['String']['output']>;
  user?: Maybe<AdminUserRef>;
};

export type WishlistToggleResult = {
  __typename?: 'WishlistToggleResult';
  is_wishlisted: Scalars['Boolean']['output'];
  product_id: Scalars['Int']['output'];
  wishlist_count: Scalars['Int']['output'];
};

export type WorkshopAvailabilityInput = {
  config_slug: Scalars['String']['input'];
  days?: InputMaybe<Scalars['Int']['input']>;
  from: Scalars['String']['input'];
};

export type WorkshopBooking = {
  __typename?: 'WorkshopBooking';
  approved_at?: Maybe<Scalars['DateTime']['output']>;
  can_cancel: Scalars['Boolean']['output'];
  can_reschedule: Scalars['Boolean']['output'];
  cancel_reason?: Maybe<Scalars['String']['output']>;
  cancelled_at?: Maybe<Scalars['DateTime']['output']>;
  config: WorkshopConfig;
  confirmed_at?: Maybe<Scalars['DateTime']['output']>;
  created_at: Scalars['DateTime']['output'];
  discount: Scalars['Int']['output'];
  ends_at: Scalars['DateTime']['output'];
  hours: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  note?: Maybe<Scalars['String']['output']>;
  participants: Scalars['Int']['output'];
  pieces_per_person: Scalars['Int']['output'];
  price_per_person: Scalars['Int']['output'];
  rejected_at?: Maybe<Scalars['DateTime']['output']>;
  slots: Array<WorkshopBookingSlot>;
  starts_at: Scalars['DateTime']['output'];
  status: RegistrationStatus;
  subtotal: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
};

export type WorkshopBookingSlot = {
  __typename?: 'WorkshopBookingSlot';
  ends_at: Scalars['DateTime']['output'];
  starts_at: Scalars['DateTime']['output'];
};

export type WorkshopBookingsResult = {
  __typename?: 'WorkshopBookingsResult';
  items: Array<WorkshopBooking>;
  page_info: PageInfo;
};

export type WorkshopConfig = {
  __typename?: 'WorkshopConfig';
  booking_window_days: Scalars['Int']['output'];
  capacity_per_slot: Scalars['Int']['output'];
  closed_weekdays: Array<Scalars['Int']['output']>;
  closing_minutes: Scalars['Int']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  image_url?: Maybe<Scalars['String']['output']>;
  is_active: Scalars['Boolean']['output'];
  name: Scalars['String']['output'];
  opening_minutes: Scalars['Int']['output'];
  slot_minutes: Scalars['Int']['output'];
  slot_span_days: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  tiers: Array<WorkshopTier>;
  timezone: Scalars['String']['output'];
};

export type WorkshopDay = {
  __typename?: 'WorkshopDay';
  date: Scalars['String']['output'];
  is_closed: Scalars['Boolean']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  slots: Array<WorkshopSlot>;
  weekday: Scalars['Int']['output'];
};

export type WorkshopSlot = {
  __typename?: 'WorkshopSlot';
  ends_at: Scalars['DateTime']['output'];
  is_available: Scalars['Boolean']['output'];
  reason?: Maybe<Scalars['String']['output']>;
  remaining: Scalars['Int']['output'];
  starts_at: Scalars['DateTime']['output'];
};

export type WorkshopTier = {
  __typename?: 'WorkshopTier';
  hours: Scalars['Int']['output'];
  id: Scalars['Int']['output'];
  pieces_per_person: Scalars['Int']['output'];
  price_per_person: Scalars['Int']['output'];
};

export type AddressFieldsFragment = { id: number, name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string, is_default: boolean };

export type AddressesQueryVariables = Exact<{ [key: string]: never; }>;


export type AddressesQuery = { addresses: Array<{ id: number, name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string, is_default: boolean }> };

export type CreateAddressMutationVariables = Exact<{
  input: AddressInput;
}>;


export type CreateAddressMutation = { createAddress: { id: number, name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string, is_default: boolean } };

export type UpdateAddressMutationVariables = Exact<{
  id: number;
  input: AddressInput;
}>;


export type UpdateAddressMutation = { updateAddress: { id: number, name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string, is_default: boolean } };

export type DeleteAddressMutationVariables = Exact<{
  id: number;
}>;


export type DeleteAddressMutation = { deleteAddress: boolean };

export type SetDefaultAddressMutationVariables = Exact<{
  id: number;
}>;


export type SetDefaultAddressMutation = { setDefaultAddress: { id: number, name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string, is_default: boolean } };

export type AdminCategoryFieldsFragment = { id: number, slug: string, name: string, icon: string | null, image_url: string | null, sort_order: number, product_count: number };

export type AdminCollectionFieldsFragment = { id: number, slug: string, name: string, description: string | null, image_url: string | null, starts_at: string | null, ends_at: string | null, product_count: number };

export type AdminCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminCategoriesQuery = { adminCategories: Array<{ id: number, slug: string, name: string, icon: string | null, image_url: string | null, sort_order: number, product_count: number }> };

export type AdminCollectionsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminCollectionsQuery = { adminCollections: Array<{ id: number, slug: string, name: string, description: string | null, image_url: string | null, starts_at: string | null, ends_at: string | null, product_count: number }> };

export type CreateCategoryMutationVariables = Exact<{
  input: AdminCategoryInput;
}>;


export type CreateCategoryMutation = { createCategory: { id: number, slug: string, name: string, icon: string | null, image_url: string | null, sort_order: number, product_count: number } };

export type UpdateCategoryMutationVariables = Exact<{
  id: number;
  input: AdminCategoryInput;
}>;


export type UpdateCategoryMutation = { updateCategory: { id: number, slug: string, name: string, icon: string | null, image_url: string | null, sort_order: number, product_count: number } };

export type DeleteCategoryMutationVariables = Exact<{
  id: number;
}>;


export type DeleteCategoryMutation = { deleteCategory: boolean };

export type CreateCollectionMutationVariables = Exact<{
  input: AdminCollectionInput;
}>;


export type CreateCollectionMutation = { createCollection: { id: number, slug: string, name: string, description: string | null, image_url: string | null, starts_at: string | null, ends_at: string | null, product_count: number } };

export type UpdateCollectionMutationVariables = Exact<{
  id: number;
  input: AdminCollectionInput;
}>;


export type UpdateCollectionMutation = { updateCollection: { id: number, slug: string, name: string, description: string | null, image_url: string | null, starts_at: string | null, ends_at: string | null, product_count: number } };

export type DeleteCollectionMutationVariables = Exact<{
  id: number;
}>;


export type DeleteCollectionMutation = { deleteCollection: boolean };

export type AdminCommissionFieldsFragment = { id: string, piece_type: string, size: string, glaze: string, carved_words: string | null, notes: string | null, name: string, email: string, phone: string | null, reference_image_urls: Array<string>, is_read: boolean, status: CommissionStatus, created_at: string };

export type CommissionRequestsQueryVariables = Exact<{
  filter?: CommissionRequestsFilterInput | null | undefined;
}>;


export type CommissionRequestsQuery = { commissionRequests: { items: Array<{ id: string, piece_type: string, size: string, glaze: string, carved_words: string | null, notes: string | null, name: string, email: string, phone: string | null, reference_image_urls: Array<string>, is_read: boolean, status: CommissionStatus, created_at: string }>, page_info: { page: number, limit: number, total: number, has_more: boolean } } };

export type MarkCommissionRequestReadMutationVariables = Exact<{
  id: string;
}>;


export type MarkCommissionRequestReadMutation = { markCommissionRequestRead: { id: string, piece_type: string, size: string, glaze: string, carved_words: string | null, notes: string | null, name: string, email: string, phone: string | null, reference_image_urls: Array<string>, is_read: boolean, status: CommissionStatus, created_at: string } };

export type SetCommissionRequestStatusMutationVariables = Exact<{
  id: string;
  status: CommissionStatus;
}>;


export type SetCommissionRequestStatusMutation = { setCommissionRequestStatus: { id: string, piece_type: string, size: string, glaze: string, carved_words: string | null, notes: string | null, name: string, email: string, phone: string | null, reference_image_urls: Array<string>, is_read: boolean, status: CommissionStatus, created_at: string } };

export type AdminContentPageFieldsFragment = { slug: string, title: string, subtitle: string | null, hero_image_url: string | null, is_published: boolean, updated_at: string, sections: Array<{ heading: string, body: string, items: Array<{ title: string, body: string }> }> };

export type AdminSiteSettingsFieldsFragment = { contact_email: string, contact_phone: string, whatsapp_number: string, address: string, opening_hours: string, instagram_url: string, facebook_url: string, youtube_url: string, shipping_flat_fee: number, free_shipping_above: number | null, dispatch_days_min: number, dispatch_days_max: number, hero_heading: string, hero_subheading: string, hero_cta_text: string, hero_cta_href: string, hero_image_url: string, announcement_text: string | null, announcement_href: string | null, updated_at: string };

export type AdminContentPagesQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminContentPagesQuery = { adminContentPages: Array<{ slug: string, title: string, is_published: boolean }> };

export type AdminContentPageQueryVariables = Exact<{
  slug: string;
}>;


export type AdminContentPageQuery = { adminContentPage: { slug: string, title: string, subtitle: string | null, hero_image_url: string | null, is_published: boolean, updated_at: string, sections: Array<{ heading: string, body: string, items: Array<{ title: string, body: string }> }> } };

export type AdminSiteSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminSiteSettingsQuery = { siteSettings: { contact_email: string, contact_phone: string, whatsapp_number: string, address: string, opening_hours: string, instagram_url: string, facebook_url: string, youtube_url: string, shipping_flat_fee: number, free_shipping_above: number | null, dispatch_days_min: number, dispatch_days_max: number, hero_heading: string, hero_subheading: string, hero_cta_text: string, hero_cta_href: string, hero_image_url: string, announcement_text: string | null, announcement_href: string | null, updated_at: string } };

export type SaveContentPageMutationVariables = Exact<{
  slug: string;
  input: ContentPageInput;
}>;


export type SaveContentPageMutation = { saveContentPage: { slug: string, title: string, subtitle: string | null, hero_image_url: string | null, is_published: boolean, updated_at: string, sections: Array<{ heading: string, body: string, items: Array<{ title: string, body: string }> }> } };

export type DeleteContentPageMutationVariables = Exact<{
  slug: string;
}>;


export type DeleteContentPageMutation = { deleteContentPage: boolean };

export type UpdateSiteSettingsMutationVariables = Exact<{
  input: AdminSiteSettingsInput;
}>;


export type UpdateSiteSettingsMutation = { updateSiteSettings: { contact_email: string, contact_phone: string, whatsapp_number: string, address: string, opening_hours: string, instagram_url: string, facebook_url: string, youtube_url: string, shipping_flat_fee: number, free_shipping_above: number | null, dispatch_days_min: number, dispatch_days_max: number, hero_heading: string, hero_subheading: string, hero_cta_text: string, hero_cta_href: string, hero_image_url: string, announcement_text: string | null, announcement_href: string | null, updated_at: string } };

export type UpdateAnnouncementMutationVariables = Exact<{
  input: AdminAnnouncementInput;
}>;


export type UpdateAnnouncementMutation = { updateAnnouncement: { contact_email: string, contact_phone: string, whatsapp_number: string, address: string, opening_hours: string, instagram_url: string, facebook_url: string, youtube_url: string, shipping_flat_fee: number, free_shipping_above: number | null, dispatch_days_min: number, dispatch_days_max: number, hero_heading: string, hero_subheading: string, hero_cta_text: string, hero_cta_href: string, hero_image_url: string, announcement_text: string | null, announcement_href: string | null, updated_at: string } };

export type AdminCouponFieldsFragment = { id: number, code: string, kind: CouponKind, value: number, min_order: number, max_uses: number | null, uses_count: number, starts_at: string | null, expires_at: string | null, is_active: boolean, created_at: string };

export type AdminCouponsQueryVariables = Exact<{
  filter?: AdminCouponsFilterInput | null | undefined;
}>;


export type AdminCouponsQuery = { adminCoupons: { items: Array<{ id: number, code: string, kind: CouponKind, value: number, min_order: number, max_uses: number | null, uses_count: number, starts_at: string | null, expires_at: string | null, is_active: boolean, created_at: string }>, page_info: { page: number, limit: number, total: number, has_more: boolean } } };

export type CreateCouponMutationVariables = Exact<{
  input: AdminCouponInput;
}>;


export type CreateCouponMutation = { createCoupon: { id: number, code: string, kind: CouponKind, value: number, min_order: number, max_uses: number | null, uses_count: number, starts_at: string | null, expires_at: string | null, is_active: boolean, created_at: string } };

export type UpdateCouponMutationVariables = Exact<{
  id: number;
  input: AdminCouponInput;
}>;


export type UpdateCouponMutation = { updateCoupon: { id: number, code: string, kind: CouponKind, value: number, min_order: number, max_uses: number | null, uses_count: number, starts_at: string | null, expires_at: string | null, is_active: boolean, created_at: string } };

export type DeleteCouponMutationVariables = Exact<{
  id: number;
}>;


export type DeleteCouponMutation = { deleteCoupon: boolean };

export type AdminDashboardQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminDashboardQuery = { adminDashboard: { orders_last_30_days: number, revenue_last_30_days: number, pending_registrations: number, pending_bookings: number, unread_messages: number, new_commission_requests: number, upcoming_visits: number, orders_by_status: Array<{ status: OrderStatus, count: number }>, recent_orders: Array<{ id: string, status: OrderStatus, total: number, item_count: number, created_at: string, customer: { id: number, name: string | null, email: string, image: string | null } }>, recent_bookings: Array<{ id: string, status: RegistrationStatus, total: number, hours: number, participants: number, starts_at: string, created_at: string, customer: { id: number, name: string | null, email: string, image: string | null } }>, low_stock: Array<{ id: number, name: string, slug: string, stock: number }> } };

export type AdminEventRowFragment = { id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, image_url: string, is_past: boolean };

export type AdminEventDetailFragment = { address: string, description: string, instructor: string | null, gallery: Array<string>, highlights: Array<string>, includes: Array<string>, performers: Array<string>, id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, image_url: string, is_past: boolean };

export type AdminRegistrationRowFragment = { next_statuses: Array<RegistrationStatus>, customer: { id: number, name: string | null, email: string, image: string | null }, registration: { id: string, seats: number, unit_price: number, total: number, status: RegistrationStatus, note: string | null, created_at: string, event: { id: number, title: string, starts_at: string } } };

export type AdminEventsQueryVariables = Exact<{
  filter?: AdminEventsFilterInput | null | undefined;
}>;


export type AdminEventsQuery = { adminEvents: { items: Array<{ id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, image_url: string, is_past: boolean }>, page_info: { page: number, limit: number, total: number, has_more: boolean } } };

export type AdminEventQueryVariables = Exact<{
  id: number;
}>;


export type AdminEventQuery = { adminEvent: { address: string, description: string, instructor: string | null, gallery: Array<string>, highlights: Array<string>, includes: Array<string>, performers: Array<string>, id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, image_url: string, is_past: boolean } };

export type AdminEventRegistrationsQueryVariables = Exact<{
  filter?: AdminRegistrationsFilterInput | null | undefined;
}>;


export type AdminEventRegistrationsQuery = { adminEventRegistrations: { items: Array<{ next_statuses: Array<RegistrationStatus>, customer: { id: number, name: string | null, email: string, image: string | null }, registration: { id: string, seats: number, unit_price: number, total: number, status: RegistrationStatus, note: string | null, created_at: string, event: { id: number, title: string, starts_at: string } } }>, page_info: { page: number, limit: number, total: number, has_more: boolean } } };

export type CreateEventMutationVariables = Exact<{
  input: AdminEventInput;
}>;


export type CreateEventMutation = { createEvent: { address: string, description: string, instructor: string | null, gallery: Array<string>, highlights: Array<string>, includes: Array<string>, performers: Array<string>, id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, image_url: string, is_past: boolean } };

export type UpdateEventMutationVariables = Exact<{
  id: number;
  input: AdminEventInput;
}>;


export type UpdateEventMutation = { updateEvent: { address: string, description: string, instructor: string | null, gallery: Array<string>, highlights: Array<string>, includes: Array<string>, performers: Array<string>, id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, image_url: string, is_past: boolean } };

export type PublishEventMutationVariables = Exact<{
  id: number;
}>;


export type PublishEventMutation = { publishEvent: { id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, image_url: string, is_past: boolean } };

export type UnpublishEventMutationVariables = Exact<{
  id: number;
}>;


export type UnpublishEventMutation = { unpublishEvent: { id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, image_url: string, is_past: boolean } };

export type CompleteEventMutationVariables = Exact<{
  id: number;
}>;


export type CompleteEventMutation = { completeEvent: { id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, image_url: string, is_past: boolean } };

export type CancelEventMutationVariables = Exact<{
  id: number;
  reason?: string | null | undefined;
}>;


export type CancelEventMutation = { cancelEvent: { id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, image_url: string, is_past: boolean } };

export type SetRegistrationStatusMutationVariables = Exact<{
  id: string;
  status: RegistrationStatus;
  reason?: string | null | undefined;
}>;


export type SetRegistrationStatusMutation = { setRegistrationStatus: { next_statuses: Array<RegistrationStatus>, customer: { id: number, name: string | null, email: string, image: string | null }, registration: { id: string, seats: number, unit_price: number, total: number, status: RegistrationStatus, note: string | null, created_at: string, event: { id: number, title: string, starts_at: string } } } };

export type AdminGlazeFieldsFragment = { product_count: number, glaze: { id: number, slug: string, name: string, description: string, variation_note: string | null, swatch_url: string | null, color_code: string | null } };

export type AdminGlazesQueryVariables = Exact<{
  filter?: AdminGlazesFilterInput | null | undefined;
}>;


export type AdminGlazesQuery = { adminGlazes: { items: Array<{ product_count: number, glaze: { id: number, slug: string, name: string, description: string, variation_note: string | null, swatch_url: string | null, color_code: string | null } }>, page_info: { page: number, limit: number, total: number, has_more: boolean } } };

export type CreateGlazeMutationVariables = Exact<{
  input: AdminGlazeInput;
}>;


export type CreateGlazeMutation = { createGlaze: { product_count: number, glaze: { id: number, slug: string, name: string, description: string, variation_note: string | null, swatch_url: string | null, color_code: string | null } } };

export type UpdateGlazeMutationVariables = Exact<{
  id: number;
  input: AdminGlazeInput;
}>;


export type UpdateGlazeMutation = { updateGlaze: { product_count: number, glaze: { id: number, slug: string, name: string, description: string, variation_note: string | null, swatch_url: string | null, color_code: string | null } } };

export type DeleteGlazeMutationVariables = Exact<{
  id: number;
}>;


export type DeleteGlazeMutation = { deleteGlaze: boolean };

export type AdminContactMessageFieldsFragment = { id: number, name: string, email: string, phone: string | null, subject: string | null, message: string, is_read: boolean, created_at: string };

export type AdminSubscriberFieldsFragment = { id: number, email: string, user_id: number | null, is_active: boolean, created_at: string, unsubscribed_at: string | null };

export type AdminContactMessagesQueryVariables = Exact<{
  filter?: AdminContactFilterInput | null | undefined;
}>;


export type AdminContactMessagesQuery = { adminContactMessages: { items: Array<{ id: number, name: string, email: string, phone: string | null, subject: string | null, message: string, is_read: boolean, created_at: string }>, page_info: { page: number, limit: number, total: number, has_more: boolean } } };

export type AdminNewsletterSubscribersQueryVariables = Exact<{
  filter?: AdminSubscribersFilterInput | null | undefined;
}>;


export type AdminNewsletterSubscribersQuery = { adminNewsletterSubscribers: { items: Array<{ id: number, email: string, user_id: number | null, is_active: boolean, created_at: string, unsubscribed_at: string | null }>, page_info: { page: number, limit: number, total: number, has_more: boolean } } };

export type ExportNewsletterSubscribersQueryVariables = Exact<{
  filter?: AdminSubscribersFilterInput | null | undefined;
}>;


export type ExportNewsletterSubscribersQuery = { exportNewsletterSubscribers: string };

export type SetContactMessageReadMutationVariables = Exact<{
  id: number;
  is_read: boolean;
}>;


export type SetContactMessageReadMutation = { setContactMessageRead: { id: number, name: string, email: string, phone: string | null, subject: string | null, message: string, is_read: boolean, created_at: string } };

export type DeleteContactMessageMutationVariables = Exact<{
  id: number;
}>;


export type DeleteContactMessageMutation = { deleteContactMessage: boolean };

export type UnsubscribeSubscriberMutationVariables = Exact<{
  email: string;
}>;


export type UnsubscribeSubscriberMutation = { unsubscribeSubscriber: boolean };

export type AdminBatchNotificationFieldsFragment = { id: number, email: string, product_id: number, product_name: string, product_slug: string, created_at: string, notified_at: string | null };

export type AdminBatchNotificationsQueryVariables = Exact<{
  filter?: AdminBatchNotificationsFilterInput | null | undefined;
}>;


export type AdminBatchNotificationsQuery = { adminBatchNotifications: { items: Array<{ id: number, email: string, product_id: number, product_name: string, product_slug: string, created_at: string, notified_at: string | null }>, page_info: { page: number, limit: number, total: number, has_more: boolean } } };

export type ExportBatchNotificationsQueryVariables = Exact<{
  filter?: AdminBatchNotificationsFilterInput | null | undefined;
}>;


export type ExportBatchNotificationsQuery = { exportBatchNotifications: string };

export type AdminOrderRowFragment = { admin_note: string | null, next_statuses: Array<OrderStatus>, customer: { id: number, name: string | null, email: string, image: string | null }, order: { id: string, status: OrderStatus, total: number, item_count: number, created_at: string, paid_at: string | null, coupon_code: string | null } };

export type AdminOrderDetailFragment = { admin_note: string | null, next_statuses: Array<OrderStatus>, customer: { id: number, name: string | null, email: string, image: string | null }, order: { id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, gift_note: string | null, hide_prices: boolean, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, care_notes: Array<string>, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }>, studio_notes: Array<{ id: number, body: string, image_url: string | null, created_at: string }> } };

export type AdminOrdersQueryVariables = Exact<{
  filter?: AdminOrdersFilterInput | null | undefined;
}>;


export type AdminOrdersQuery = { adminOrders: { items: Array<{ admin_note: string | null, next_statuses: Array<OrderStatus>, customer: { id: number, name: string | null, email: string, image: string | null }, order: { id: string, status: OrderStatus, total: number, item_count: number, created_at: string, paid_at: string | null, coupon_code: string | null } }>, page_info: { page: number, limit: number, total: number, has_more: boolean } } };

export type AdminOrderQueryVariables = Exact<{
  id: string;
}>;


export type AdminOrderQuery = { adminOrder: { admin_note: string | null, next_statuses: Array<OrderStatus>, customer: { id: number, name: string | null, email: string, image: string | null }, order: { id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, gift_note: string | null, hide_prices: boolean, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, care_notes: Array<string>, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }>, studio_notes: Array<{ id: number, body: string, image_url: string | null, created_at: string }> } } };

export type SetOrderStatusMutationVariables = Exact<{
  id: string;
  status: OrderStatus;
  tracking_note?: string | null | undefined;
  cancel_reason?: string | null | undefined;
}>;


export type SetOrderStatusMutation = { setOrderStatus: { admin_note: string | null, next_statuses: Array<OrderStatus>, customer: { id: number, name: string | null, email: string, image: string | null }, order: { id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, gift_note: string | null, hide_prices: boolean, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, care_notes: Array<string>, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }>, studio_notes: Array<{ id: number, body: string, image_url: string | null, created_at: string }> } } };

export type MarkOrderPaidMutationVariables = Exact<{
  id: string;
}>;


export type MarkOrderPaidMutation = { markOrderPaid: { admin_note: string | null, next_statuses: Array<OrderStatus>, customer: { id: number, name: string | null, email: string, image: string | null }, order: { id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, gift_note: string | null, hide_prices: boolean, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, care_notes: Array<string>, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }>, studio_notes: Array<{ id: number, body: string, image_url: string | null, created_at: string }> } } };

export type CancelOrderAsAdminMutationVariables = Exact<{
  id: string;
  reason?: string | null | undefined;
}>;


export type CancelOrderAsAdminMutation = { cancelOrderAsAdmin: { admin_note: string | null, next_statuses: Array<OrderStatus>, customer: { id: number, name: string | null, email: string, image: string | null }, order: { id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, gift_note: string | null, hide_prices: boolean, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, care_notes: Array<string>, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }>, studio_notes: Array<{ id: number, body: string, image_url: string | null, created_at: string }> } } };

export type SetOrderAdminNoteMutationVariables = Exact<{
  id: string;
  note?: string | null | undefined;
}>;


export type SetOrderAdminNoteMutation = { setOrderAdminNote: { admin_note: string | null, next_statuses: Array<OrderStatus>, customer: { id: number, name: string | null, email: string, image: string | null }, order: { id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, gift_note: string | null, hide_prices: boolean, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, care_notes: Array<string>, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }>, studio_notes: Array<{ id: number, body: string, image_url: string | null, created_at: string }> } } };

export type AddOrderNoteMutationVariables = Exact<{
  input: AddOrderNoteInput;
}>;


export type AddOrderNoteMutation = { addOrderNote: { id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, gift_note: string | null, hide_prices: boolean, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, care_notes: Array<string>, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }>, studio_notes: Array<{ id: number, body: string, image_url: string | null, created_at: string }> } };

export type AdminProductRowFragment = { id: number, slug: string, name: string, price: number, compare_at_price: number | null, stock: number, is_active: boolean, is_featured: boolean, is_archived: boolean, is_customizable: boolean, is_second: boolean, is_commission: boolean, image_urls: Array<string>, material: string, categories: Array<{ id: number, name: string, slug: string }>, collection: { id: number, name: string, slug: string } | null };

export type AdminOptionGroupFieldsFragment = { id: number, name: string, kind: OptionGroupKind, is_required: boolean, max_length: number | null, price_modifier: number, sort_order: number, options: Array<{ id: number, name: string, price_modifier: number, sort_order: number, is_active: boolean }> };

export type AdminProductDetailFragment = { description: string, dimensions: string | null, color_name: string | null, color_code: string | null, care_notes: Array<string>, created_at: string, sales_count: number, flaw_note: string | null, maker_note: string | null, capacity_ml: number | null, height_cm: number | null, diameter_cm: number | null, weight_g: number | null, id: number, slug: string, name: string, price: number, compare_at_price: number | null, stock: number, is_active: boolean, is_featured: boolean, is_archived: boolean, is_customizable: boolean, is_second: boolean, is_commission: boolean, image_urls: Array<string>, material: string, glaze: { id: number, name: string, color_code: string | null } | null, option_groups: Array<{ id: number, name: string, kind: OptionGroupKind, is_required: boolean, max_length: number | null, price_modifier: number, sort_order: number, options: Array<{ id: number, name: string, price_modifier: number, sort_order: number, is_active: boolean }> }>, categories: Array<{ id: number, name: string, slug: string }>, collection: { id: number, name: string, slug: string } | null };

export type AdminProductsQueryVariables = Exact<{
  filter?: AdminProductsFilterInput | null | undefined;
}>;


export type AdminProductsQuery = { adminProducts: { items: Array<{ id: number, slug: string, name: string, price: number, compare_at_price: number | null, stock: number, is_active: boolean, is_featured: boolean, is_archived: boolean, is_customizable: boolean, is_second: boolean, is_commission: boolean, image_urls: Array<string>, material: string, categories: Array<{ id: number, name: string, slug: string }>, collection: { id: number, name: string, slug: string } | null }>, page_info: { page: number, limit: number, total: number, has_more: boolean } } };

export type AdminProductQueryVariables = Exact<{
  id: number;
}>;


export type AdminProductQuery = { adminProduct: { description: string, dimensions: string | null, color_name: string | null, color_code: string | null, care_notes: Array<string>, created_at: string, sales_count: number, flaw_note: string | null, maker_note: string | null, capacity_ml: number | null, height_cm: number | null, diameter_cm: number | null, weight_g: number | null, id: number, slug: string, name: string, price: number, compare_at_price: number | null, stock: number, is_active: boolean, is_featured: boolean, is_archived: boolean, is_customizable: boolean, is_second: boolean, is_commission: boolean, image_urls: Array<string>, material: string, glaze: { id: number, name: string, color_code: string | null } | null, option_groups: Array<{ id: number, name: string, kind: OptionGroupKind, is_required: boolean, max_length: number | null, price_modifier: number, sort_order: number, options: Array<{ id: number, name: string, price_modifier: number, sort_order: number, is_active: boolean }> }>, categories: Array<{ id: number, name: string, slug: string }>, collection: { id: number, name: string, slug: string } | null } };

export type AdminProductOptionGroupsQueryVariables = Exact<{
  product_id: number;
}>;


export type AdminProductOptionGroupsQuery = { adminProductOptionGroups: Array<{ id: number, name: string, kind: OptionGroupKind, is_required: boolean, max_length: number | null, price_modifier: number, sort_order: number, options: Array<{ id: number, name: string, price_modifier: number, sort_order: number, is_active: boolean }> }> };

export type CreateProductMutationVariables = Exact<{
  input: AdminProductInput;
}>;


export type CreateProductMutation = { createProduct: { description: string, dimensions: string | null, color_name: string | null, color_code: string | null, care_notes: Array<string>, created_at: string, sales_count: number, flaw_note: string | null, maker_note: string | null, capacity_ml: number | null, height_cm: number | null, diameter_cm: number | null, weight_g: number | null, id: number, slug: string, name: string, price: number, compare_at_price: number | null, stock: number, is_active: boolean, is_featured: boolean, is_archived: boolean, is_customizable: boolean, is_second: boolean, is_commission: boolean, image_urls: Array<string>, material: string, glaze: { id: number, name: string, color_code: string | null } | null, option_groups: Array<{ id: number, name: string, kind: OptionGroupKind, is_required: boolean, max_length: number | null, price_modifier: number, sort_order: number, options: Array<{ id: number, name: string, price_modifier: number, sort_order: number, is_active: boolean }> }>, categories: Array<{ id: number, name: string, slug: string }>, collection: { id: number, name: string, slug: string } | null } };

export type UpdateProductMutationVariables = Exact<{
  id: number;
  input: AdminProductUpdateInput;
}>;


export type UpdateProductMutation = { updateProduct: { description: string, dimensions: string | null, color_name: string | null, color_code: string | null, care_notes: Array<string>, created_at: string, sales_count: number, flaw_note: string | null, maker_note: string | null, capacity_ml: number | null, height_cm: number | null, diameter_cm: number | null, weight_g: number | null, id: number, slug: string, name: string, price: number, compare_at_price: number | null, stock: number, is_active: boolean, is_featured: boolean, is_archived: boolean, is_customizable: boolean, is_second: boolean, is_commission: boolean, image_urls: Array<string>, material: string, glaze: { id: number, name: string, color_code: string | null } | null, option_groups: Array<{ id: number, name: string, kind: OptionGroupKind, is_required: boolean, max_length: number | null, price_modifier: number, sort_order: number, options: Array<{ id: number, name: string, price_modifier: number, sort_order: number, is_active: boolean }> }>, categories: Array<{ id: number, name: string, slug: string }>, collection: { id: number, name: string, slug: string } | null } };

export type SetProductActiveMutationVariables = Exact<{
  id: number;
  is_active: boolean;
}>;


export type SetProductActiveMutation = { setProductActive: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, stock: number, is_active: boolean, is_featured: boolean, is_archived: boolean, is_customizable: boolean, is_second: boolean, is_commission: boolean, image_urls: Array<string>, material: string, categories: Array<{ id: number, name: string, slug: string }>, collection: { id: number, name: string, slug: string } | null } };

export type SetProductFeaturedMutationVariables = Exact<{
  id: number;
  is_featured: boolean;
}>;


export type SetProductFeaturedMutation = { setProductFeatured: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, stock: number, is_active: boolean, is_featured: boolean, is_archived: boolean, is_customizable: boolean, is_second: boolean, is_commission: boolean, image_urls: Array<string>, material: string, categories: Array<{ id: number, name: string, slug: string }>, collection: { id: number, name: string, slug: string } | null } };

export type AdjustProductStockMutationVariables = Exact<{
  id: number;
  delta: number;
  reason: string;
}>;


export type AdjustProductStockMutation = { adjustProductStock: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, stock: number, is_active: boolean, is_featured: boolean, is_archived: boolean, is_customizable: boolean, is_second: boolean, is_commission: boolean, image_urls: Array<string>, material: string, categories: Array<{ id: number, name: string, slug: string }>, collection: { id: number, name: string, slug: string } | null } };

export type CreateProductOptionGroupMutationVariables = Exact<{
  product_id: number;
  input: AdminOptionGroupInput;
}>;


export type CreateProductOptionGroupMutation = { createProductOptionGroup: { id: number, name: string, kind: OptionGroupKind, is_required: boolean, max_length: number | null, price_modifier: number, sort_order: number, options: Array<{ id: number, name: string, price_modifier: number, sort_order: number, is_active: boolean }> } };

export type UpdateProductOptionGroupMutationVariables = Exact<{
  id: number;
  input: AdminOptionGroupInput;
}>;


export type UpdateProductOptionGroupMutation = { updateProductOptionGroup: { id: number, name: string, kind: OptionGroupKind, is_required: boolean, max_length: number | null, price_modifier: number, sort_order: number, options: Array<{ id: number, name: string, price_modifier: number, sort_order: number, is_active: boolean }> } };

export type DeleteProductOptionGroupMutationVariables = Exact<{
  id: number;
}>;


export type DeleteProductOptionGroupMutation = { deleteProductOptionGroup: boolean };

export type CreateProductOptionMutationVariables = Exact<{
  group_id: number;
  input: AdminOptionInput;
}>;


export type CreateProductOptionMutation = { createProductOption: { id: number, name: string, kind: OptionGroupKind, is_required: boolean, max_length: number | null, price_modifier: number, sort_order: number, options: Array<{ id: number, name: string, price_modifier: number, sort_order: number, is_active: boolean }> } };

export type UpdateProductOptionMutationVariables = Exact<{
  id: number;
  input: AdminOptionInput;
}>;


export type UpdateProductOptionMutation = { updateProductOption: { id: number, name: string, kind: OptionGroupKind, is_required: boolean, max_length: number | null, price_modifier: number, sort_order: number, options: Array<{ id: number, name: string, price_modifier: number, sort_order: number, is_active: boolean }> } };

export type DeleteProductOptionMutationVariables = Exact<{
  id: number;
}>;


export type DeleteProductOptionMutation = { deleteProductOption: boolean };

export type AdminReviewRowFragment = { is_hidden: boolean, subject_kind: ReviewSubjectKind, customer: { id: number, name: string | null, email: string, image: string | null }, review: { id: number, rating: number, body: string | null, image_urls: Array<string>, created_at: string, subject_name: string | null, subject_href: string | null, author: { name: string, image: string | null } } };

export type AdminReviewsQueryVariables = Exact<{
  filter?: AdminReviewsFilterInput | null | undefined;
}>;


export type AdminReviewsQuery = { adminReviews: { items: Array<{ is_hidden: boolean, subject_kind: ReviewSubjectKind, customer: { id: number, name: string | null, email: string, image: string | null }, review: { id: number, rating: number, body: string | null, image_urls: Array<string>, created_at: string, subject_name: string | null, subject_href: string | null, author: { name: string, image: string | null } } }>, page_info: { page: number, limit: number, total: number, has_more: boolean } } };

export type SetReviewHiddenMutationVariables = Exact<{
  id: number;
  is_hidden: boolean;
}>;


export type SetReviewHiddenMutation = { setReviewHidden: { is_hidden: boolean, subject_kind: ReviewSubjectKind, customer: { id: number, name: string | null, email: string, image: string | null }, review: { id: number, rating: number, body: string | null, image_urls: Array<string>, created_at: string, subject_name: string | null, subject_href: string | null, author: { name: string, image: string | null } } } };

export type DeleteReviewAsAdminMutationVariables = Exact<{
  id: number;
}>;


export type DeleteReviewAsAdminMutation = { deleteReviewAsAdmin: boolean };

export type AdminPageInfoFieldsFragment = { page: number, limit: number, total: number, has_more: boolean };

export type AdminUserRefFieldsFragment = { id: number, name: string | null, email: string, image: string | null };

export type ImageSpecsQueryVariables = Exact<{ [key: string]: never; }>;


export type ImageSpecsQuery = { imageSpecs: Array<{ purpose: UploadPurpose, ratio: number | null, ratio_label: string, min_width: number, min_height: number, max_bytes: number, content_types: Array<string>, renders_at: string }> };

export type CreateAdminUploadMutationVariables = Exact<{
  purpose: UploadPurpose;
  content_type: string;
  size: number;
}>;


export type CreateAdminUploadMutation = { createAdminUpload: { key: string, upload_url: string, public_url: string } };

export type ConfirmUploadMutationVariables = Exact<{
  key: string;
  purpose: UploadPurpose;
}>;


export type ConfirmUploadMutation = { confirmUpload: { key: string, public_url: string, width: number, height: number, bytes: number } };

export type AdminUserFieldsFragment = { role: UserRole, phone: string | null, created_at: string, orders_count: number, registrations_count: number, bookings_count: number, reviews_count: number, user: { id: number, name: string | null, email: string, image: string | null } };

export type AdminUsersQueryVariables = Exact<{
  filter?: AdminUsersFilterInput | null | undefined;
}>;


export type AdminUsersQuery = { adminUsers: { items: Array<{ role: UserRole, phone: string | null, created_at: string, orders_count: number, registrations_count: number, bookings_count: number, reviews_count: number, user: { id: number, name: string | null, email: string, image: string | null } }>, page_info: { page: number, limit: number, total: number, has_more: boolean } } };

export type AdminUserQueryVariables = Exact<{
  id: number;
}>;


export type AdminUserQuery = { adminUser: { role: UserRole, phone: string | null, created_at: string, orders_count: number, registrations_count: number, bookings_count: number, reviews_count: number, user: { id: number, name: string | null, email: string, image: string | null } } };

export type SetUserRoleMutationVariables = Exact<{
  id: number;
  role: UserRole;
}>;


export type SetUserRoleMutation = { setUserRole: { role: UserRole, phone: string | null, created_at: string, orders_count: number, registrations_count: number, bookings_count: number, reviews_count: number, user: { id: number, name: string | null, email: string, image: string | null } } };

export type AdminStudioVisitFieldsFragment = { created_at: string, visit: { id: string, starts_at: string, ends_at: string, name: string, phone: string, note: string | null, cancelled_at: string | null }, customer: { id: number, name: string | null, email: string, image: string | null } | null };

export type AdminStudioVisitsQueryVariables = Exact<{
  filter?: AdminStudioVisitsFilterInput | null | undefined;
}>;


export type AdminStudioVisitsQuery = { adminStudioVisits: { items: Array<{ created_at: string, visit: { id: string, starts_at: string, ends_at: string, name: string, phone: string, note: string | null, cancelled_at: string | null }, customer: { id: number, name: string | null, email: string, image: string | null } | null }>, page_info: { page: number, limit: number, total: number, has_more: boolean } } };

export type CancelStudioVisitMutationVariables = Exact<{
  id: string;
  reason?: string | null | undefined;
}>;


export type CancelStudioVisitMutation = { cancelStudioVisit: { id: string, starts_at: string, ends_at: string, name: string, phone: string, note: string | null, cancelled_at: string | null } };

export type AdminWhatsAppMessageFieldsFragment = { id: number, direction: WhatsAppDirection, kind: string, body: string, page_url: string | null, name: string | null, email: string | null, phone: string | null, reference: string | null, created_at: string, user: { id: number, name: string | null, email: string, image: string | null } | null };

export type AdminWhatsAppMessagesQueryVariables = Exact<{
  filter?: AdminWhatsAppFilterInput | null | undefined;
}>;


export type AdminWhatsAppMessagesQuery = { adminWhatsAppMessages: { items: Array<{ id: number, direction: WhatsAppDirection, kind: string, body: string, page_url: string | null, name: string | null, email: string | null, phone: string | null, reference: string | null, created_at: string, user: { id: number, name: string | null, email: string, image: string | null } | null }>, page_info: { page: number, limit: number, total: number, has_more: boolean } } };

export type SendWhatsAppReplyMutationVariables = Exact<{
  input: SendWhatsAppReplyInput;
}>;


export type SendWhatsAppReplyMutation = { sendWhatsAppReply: boolean };

export type AdminWorkshopConfigFieldsFragment = { id: number, slug: string, name: string, description: string | null, image_url: string | null, is_active: boolean, timezone: string, opening_minutes: number, closing_minutes: number, slot_minutes: number, capacity_per_slot: number, booking_window_days: number, slot_span_days: number, closed_weekdays: Array<number>, tiers: Array<{ id: number, hours: number, price_per_person: number, pieces_per_person: number }> };

export type AdminWorkshopBlackoutFieldsFragment = { id: number, config_id: number, starts_at: string, ends_at: string, reason: string | null };

export type AdminWorkshopBookingRowFragment = { next_statuses: Array<RegistrationStatus>, customer: { id: number, name: string | null, email: string, image: string | null }, booking: { id: string, starts_at: string, ends_at: string, hours: number, participants: number, total: number, status: RegistrationStatus, note: string | null, created_at: string, config: { id: number, name: string, slug: string } } };

export type AdminWorkshopConfigsQueryVariables = Exact<{ [key: string]: never; }>;


export type AdminWorkshopConfigsQuery = { adminWorkshopConfigs: Array<{ id: number, slug: string, name: string, description: string | null, image_url: string | null, is_active: boolean, timezone: string, opening_minutes: number, closing_minutes: number, slot_minutes: number, capacity_per_slot: number, booking_window_days: number, slot_span_days: number, closed_weekdays: Array<number>, tiers: Array<{ id: number, hours: number, price_per_person: number, pieces_per_person: number }> }> };

export type AdminWorkshopBlackoutsQueryVariables = Exact<{
  config_id: number;
}>;


export type AdminWorkshopBlackoutsQuery = { adminWorkshopBlackouts: Array<{ id: number, config_id: number, starts_at: string, ends_at: string, reason: string | null }> };

export type AdminWorkshopBookingsQueryVariables = Exact<{
  filter?: AdminWorkshopBookingsFilterInput | null | undefined;
}>;


export type AdminWorkshopBookingsQuery = { adminWorkshopBookings: { items: Array<{ next_statuses: Array<RegistrationStatus>, customer: { id: number, name: string | null, email: string, image: string | null }, booking: { id: string, starts_at: string, ends_at: string, hours: number, participants: number, total: number, status: RegistrationStatus, note: string | null, created_at: string, config: { id: number, name: string, slug: string } } }>, page_info: { page: number, limit: number, total: number, has_more: boolean } } };

export type UpdateWorkshopConfigMutationVariables = Exact<{
  id: number;
  input: AdminWorkshopConfigInput;
}>;


export type UpdateWorkshopConfigMutation = { updateWorkshopConfig: { id: number, slug: string, name: string, description: string | null, image_url: string | null, is_active: boolean, timezone: string, opening_minutes: number, closing_minutes: number, slot_minutes: number, capacity_per_slot: number, booking_window_days: number, slot_span_days: number, closed_weekdays: Array<number>, tiers: Array<{ id: number, hours: number, price_per_person: number, pieces_per_person: number }> } };

export type SaveWorkshopTierMutationVariables = Exact<{
  config_id: number;
  input: AdminWorkshopTierInput;
}>;


export type SaveWorkshopTierMutation = { saveWorkshopTier: { id: number, slug: string, name: string, description: string | null, image_url: string | null, is_active: boolean, timezone: string, opening_minutes: number, closing_minutes: number, slot_minutes: number, capacity_per_slot: number, booking_window_days: number, slot_span_days: number, closed_weekdays: Array<number>, tiers: Array<{ id: number, hours: number, price_per_person: number, pieces_per_person: number }> } };

export type DeleteWorkshopTierMutationVariables = Exact<{
  id: number;
}>;


export type DeleteWorkshopTierMutation = { deleteWorkshopTier: boolean };

export type CreateWorkshopBlackoutMutationVariables = Exact<{
  config_id: number;
  input: AdminWorkshopBlackoutInput;
}>;


export type CreateWorkshopBlackoutMutation = { createWorkshopBlackout: { id: number, config_id: number, starts_at: string, ends_at: string, reason: string | null } };

export type UpdateWorkshopBlackoutMutationVariables = Exact<{
  id: number;
  input: AdminWorkshopBlackoutInput;
}>;


export type UpdateWorkshopBlackoutMutation = { updateWorkshopBlackout: { id: number, config_id: number, starts_at: string, ends_at: string, reason: string | null } };

export type DeleteWorkshopBlackoutMutationVariables = Exact<{
  id: number;
}>;


export type DeleteWorkshopBlackoutMutation = { deleteWorkshopBlackout: boolean };

export type SetWorkshopBookingStatusMutationVariables = Exact<{
  id: string;
  status: RegistrationStatus;
  reason?: string | null | undefined;
}>;


export type SetWorkshopBookingStatusMutation = { setWorkshopBookingStatus: { next_statuses: Array<RegistrationStatus>, customer: { id: number, name: string | null, email: string, image: string | null }, booking: { id: string, starts_at: string, ends_at: string, hours: number, participants: number, total: number, status: RegistrationStatus, note: string | null, created_at: string, config: { id: number, name: string, slug: string } } } };

export type ArchivePieceFragment = { id: number, slug: string, name: string, image_urls: Array<string>, material: string, color_name: string | null, created_at: string, collection: { id: number, slug: string, name: string } | null };

export type ArchiveWallQueryVariables = Exact<{
  filter?: ProductsFilterInput | null | undefined;
}>;


export type ArchiveWallQuery = { products: { items: Array<{ id: number, slug: string, name: string, image_urls: Array<string>, material: string, color_name: string | null, created_at: string, collection: { id: number, slug: string, name: string } | null }>, page_info: { total: number, page: number, limit: number, has_more: boolean } } };

export type CartFieldsFragment = { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, is_second: boolean, rating_avg: number, rating_count: number, glaze: { id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null } | null, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null } }> };

export type CartQueryVariables = Exact<{ [key: string]: never; }>;


export type CartQuery = { cart: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, is_second: boolean, rating_avg: number, rating_count: number, glaze: { id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null } | null, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null } }> } };

export type CartCountQueryVariables = Exact<{ [key: string]: never; }>;


export type CartCountQuery = { cartCount: number };

export type AddToCartMutationVariables = Exact<{
  input: AddToCartInput;
}>;


export type AddToCartMutation = { addToCart: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, is_second: boolean, rating_avg: number, rating_count: number, glaze: { id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null } | null, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null } }> } };

export type UpdateCartItemMutationVariables = Exact<{
  id: number;
  quantity: number;
}>;


export type UpdateCartItemMutation = { updateCartItem: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, is_second: boolean, rating_avg: number, rating_count: number, glaze: { id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null } | null, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null } }> } };

export type RemoveCartItemMutationVariables = Exact<{
  id: number;
}>;


export type RemoveCartItemMutation = { removeCartItem: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, is_second: boolean, rating_avg: number, rating_count: number, glaze: { id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null } | null, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null } }> } };

export type ClearCartMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearCartMutation = { clearCart: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, is_second: boolean, rating_avg: number, rating_count: number, glaze: { id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null } | null, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null } }> } };

export type CommissionOptionsQueryVariables = Exact<{ [key: string]: never; }>;


export type CommissionOptionsQuery = { commissionOptions: { piece_types: Array<{ name: string, sizes: Array<string> }>, glazes: Array<{ slug: string, name: string, color_code: string | null }> } };

export type CommissionPiecesQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export type CommissionPiecesQuery = { commissionPieces: Array<{ id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, is_second: boolean, rating_avg: number, rating_count: number, glaze: { id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null } | null, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null }> };

export type CreateCommissionRequestMutationVariables = Exact<{
  input: CommissionRequestInput;
}>;


export type CreateCommissionRequestMutation = { createCommissionRequest: { id: string, piece_type: string, size: string, glaze: string, created_at: string } };

export type ContentPageQueryVariables = Exact<{
  slug: string;
}>;


export type ContentPageQuery = { contentPage: { slug: string, title: string, subtitle: string | null, hero_image_url: string | null, is_published: boolean, updated_at: string, sections: Array<{ heading: string, body: string, items: Array<{ title: string, body: string }> }> } };

export type SendContactMessageMutationVariables = Exact<{
  input: ContactMessageInput;
}>;


export type SendContactMessageMutation = { sendContactMessage: boolean };

export type SubscribeToNewsletterMutationVariables = Exact<{
  email: string;
}>;


export type SubscribeToNewsletterMutation = { subscribeToNewsletter: { email: string, is_active: boolean, was_already_subscribed: boolean } };

export type UnsubscribeFromNewsletterMutationVariables = Exact<{
  token: string;
}>;


export type UnsubscribeFromNewsletterMutation = { unsubscribeFromNewsletter: boolean };

export type EventCardFragment = { id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, instructor: string | null, image_url: string, rating_avg: number, rating_count: number, is_past: boolean };

export type RegistrationFieldsFragment = { id: string, seats: number, unit_price: number, discount: number, total: number, status: RegistrationStatus, note: string | null, cancel_reason: string | null, can_cancel: boolean, created_at: string, approved_at: string | null, confirmed_at: string | null, rejected_at: string | null, cancelled_at: string | null, event: { address: string, id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, instructor: string | null, image_url: string, rating_avg: number, rating_count: number, is_past: boolean } };

export type EventsQueryVariables = Exact<{
  filter?: EventsFilterInput | null | undefined;
}>;


export type EventsQuery = { events: { items: Array<{ id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, instructor: string | null, image_url: string, rating_avg: number, rating_count: number, is_past: boolean }>, page_info: { total: number, page: number, limit: number, has_more: boolean } } };

export type EventQueryVariables = Exact<{
  slug: string;
}>;


export type EventQuery = { event: { description: string, address: string, gallery: Array<string>, includes: Array<string>, highlights: Array<string>, performers: Array<string>, id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, instructor: string | null, image_url: string, rating_avg: number, rating_count: number, is_past: boolean, my_registration: { id: string, seats: number, unit_price: number, discount: number, total: number, status: RegistrationStatus, note: string | null, cancel_reason: string | null, can_cancel: boolean, created_at: string, approved_at: string | null, confirmed_at: string | null, rejected_at: string | null, cancelled_at: string | null, event: { address: string, id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, instructor: string | null, image_url: string, rating_avg: number, rating_count: number, is_past: boolean } } | null } };

export type UpcomingEventsQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export type UpcomingEventsQuery = { upcomingEvents: Array<{ id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, instructor: string | null, image_url: string, rating_avg: number, rating_count: number, is_past: boolean }> };

export type RegisterForEventMutationVariables = Exact<{
  input: RegisterForEventInput;
}>;


export type RegisterForEventMutation = { registerForEvent: { id: string, seats: number, unit_price: number, discount: number, total: number, status: RegistrationStatus, note: string | null, cancel_reason: string | null, can_cancel: boolean, created_at: string, approved_at: string | null, confirmed_at: string | null, rejected_at: string | null, cancelled_at: string | null, event: { address: string, id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, instructor: string | null, image_url: string, rating_avg: number, rating_count: number, is_past: boolean } } };

export type MyRegistrationsQueryVariables = Exact<{
  page?: number | null | undefined;
  limit?: number | null | undefined;
}>;


export type MyRegistrationsQuery = { myRegistrations: { items: Array<{ id: string, seats: number, unit_price: number, discount: number, total: number, status: RegistrationStatus, note: string | null, cancel_reason: string | null, can_cancel: boolean, created_at: string, approved_at: string | null, confirmed_at: string | null, rejected_at: string | null, cancelled_at: string | null, event: { address: string, id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, instructor: string | null, image_url: string, rating_avg: number, rating_count: number, is_past: boolean } }>, page_info: { total: number, page: number, limit: number, has_more: boolean } } };

export type RegistrationQueryVariables = Exact<{
  id: string;
}>;


export type RegistrationQuery = { registration: { id: string, seats: number, unit_price: number, discount: number, total: number, status: RegistrationStatus, note: string | null, cancel_reason: string | null, can_cancel: boolean, created_at: string, approved_at: string | null, confirmed_at: string | null, rejected_at: string | null, cancelled_at: string | null, event: { address: string, id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, instructor: string | null, image_url: string, rating_avg: number, rating_count: number, is_past: boolean } } };

export type CancelRegistrationMutationVariables = Exact<{
  id: string;
  reason?: string | null | undefined;
}>;


export type CancelRegistrationMutation = { cancelRegistration: { id: string, seats: number, unit_price: number, discount: number, total: number, status: RegistrationStatus, note: string | null, cancel_reason: string | null, can_cancel: boolean, created_at: string, approved_at: string | null, confirmed_at: string | null, rejected_at: string | null, cancelled_at: string | null, event: { address: string, id: number, slug: string, title: string, event_type: EventType, status: EventStatus, level: EventLevel | null, starts_at: string, ends_at: string, location: string, price: number, total_seats: number, available_seats: number, instructor: string | null, image_url: string, rating_avg: number, rating_count: number, is_past: boolean } } };

export type NotifyWhenBackInStockMutationVariables = Exact<{
  productId: number;
  email: string;
}>;


export type NotifyWhenBackInStockMutation = { notifyWhenBackInStock: { email: string, was_already_waiting: boolean } };

export type StopBatchNotificationMutationVariables = Exact<{
  token: string;
}>;


export type StopBatchNotificationMutation = { stopBatchNotification: boolean };

export type OrderFieldsFragment = { id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, gift_note: string | null, hide_prices: boolean, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, care_notes: Array<string>, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }>, studio_notes: Array<{ id: number, body: string, image_url: string | null, created_at: string }> };

export type CheckoutQuoteQueryVariables = Exact<{
  input?: CheckoutQuoteInput | null | undefined;
}>;


export type CheckoutQuoteQuery = { checkoutQuote: { subtotal: number, discount: number, shipping_fee: number, total: number, item_count: number, coupon_code: string | null, coupon_message: string | null, problems: Array<string> } };

export type PlaceOrderMutationVariables = Exact<{
  input: PlaceOrderInput;
}>;


export type PlaceOrderMutation = { placeOrder: { id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, gift_note: string | null, hide_prices: boolean, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, care_notes: Array<string>, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }>, studio_notes: Array<{ id: number, body: string, image_url: string | null, created_at: string }> } };

export type OrdersQueryVariables = Exact<{
  page?: number | null | undefined;
  limit?: number | null | undefined;
}>;


export type OrdersQuery = { orders: { items: Array<{ id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, gift_note: string | null, hide_prices: boolean, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, care_notes: Array<string>, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }>, studio_notes: Array<{ id: number, body: string, image_url: string | null, created_at: string }> }>, page_info: { total: number, page: number, limit: number, has_more: boolean } } };

export type OrderQueryVariables = Exact<{
  id: string;
}>;


export type OrderQuery = { order: { id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, gift_note: string | null, hide_prices: boolean, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, care_notes: Array<string>, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }>, studio_notes: Array<{ id: number, body: string, image_url: string | null, created_at: string }> } };

export type CancelOrderMutationVariables = Exact<{
  id: string;
  reason?: string | null | undefined;
}>;


export type CancelOrderMutation = { cancelOrder: { id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, gift_note: string | null, hide_prices: boolean, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, care_notes: Array<string>, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, reference_image_urls: Array<string>, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }>, studio_notes: Array<{ id: number, body: string, image_url: string | null, created_at: string }> } };

export type GlazeCardFragment = { id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null };

export type ProductCardFragment = { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, is_second: boolean, rating_avg: number, rating_count: number, glaze: { id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null } | null, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null };

export type ProductsQueryVariables = Exact<{
  filter?: ProductsFilterInput | null | undefined;
}>;


export type ProductsQuery = { products: { items: Array<{ id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, is_second: boolean, rating_avg: number, rating_count: number, glaze: { id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null } | null, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null }>, page_info: { total: number, page: number, limit: number, has_more: boolean }, facets: { price_min: number, price_max: number, active_count: number, archive_count: number, seconds_count: number, categories: Array<{ value: string, label: string, count: number }>, collections: Array<{ value: string, label: string, count: number }>, materials: Array<{ value: string, label: string, count: number }>, glazes: Array<{ value: string, label: string, count: number }> } } };

export type ProductQueryVariables = Exact<{
  slug: string;
}>;


export type ProductQuery = { product: { description: string, created_at: string, flaw_note: string | null, dimensions: string | null, capacity_ml: number | null, height_cm: number | null, diameter_cm: number | null, weight_g: number | null, maker_note: string | null, care_notes: Array<string>, sales_count: number, id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, is_second: boolean, rating_avg: number, rating_count: number, glaze: { description: string, variation_note: string | null, id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null } | null, categories: Array<{ id: number, slug: string, name: string }>, option_groups: Array<{ id: number, name: string, kind: OptionGroupKind, is_required: boolean, price_modifier: number, max_length: number | null, options: Array<{ id: number, name: string, price_modifier: number }> }>, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null } };

export type RelatedProductsQueryVariables = Exact<{
  slug: string;
  limit?: number | null | undefined;
}>;


export type RelatedProductsQuery = { relatedProducts: Array<{ id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, is_second: boolean, rating_avg: number, rating_count: number, glaze: { id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null } | null, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null }> };

export type FeaturedProductsQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export type FeaturedProductsQuery = { featuredProducts: Array<{ id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, is_second: boolean, rating_avg: number, rating_count: number, glaze: { id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null } | null, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null }> };

export type CategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoriesQuery = { categories: Array<{ id: number, slug: string, name: string, icon: string | null, image_url: string | null, product_count: number }> };

export type CollectionsQueryVariables = Exact<{
  archive?: boolean | null | undefined;
}>;


export type CollectionsQuery = { collections: Array<{ id: number, slug: string, name: string, description: string | null, image_url: string | null, ends_at: string | null, product_count: number }> };

export type CollectionQueryVariables = Exact<{
  slug: string;
  archive?: boolean | null | undefined;
}>;


export type CollectionQuery = { collection: { id: number, slug: string, name: string, description: string | null, image_url: string | null, ends_at: string | null, product_count: number } };

export type GlazesQueryVariables = Exact<{ [key: string]: never; }>;


export type GlazesQuery = { glazes: Array<{ description: string, variation_note: string | null, id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null }> };

export type GlazeQueryVariables = Exact<{
  slug: string;
}>;


export type GlazeQuery = { glaze: { description: string, variation_note: string | null, id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null, pieces: Array<{ id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, is_second: boolean, rating_avg: number, rating_count: number, glaze: { id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null } | null, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null }> } };

export type CreateProductReviewMutationVariables = Exact<{
  product_id: number;
  input: ReviewInput;
}>;


export type CreateProductReviewMutation = { createProductReview: { id: number, rating: number, body: string | null, image_urls: Array<string>, created_at: string, is_mine: boolean, subject_name: string | null, subject_href: string | null, author: { name: string, image: string | null } } };

export type CreateEventReviewMutationVariables = Exact<{
  event_id: number;
  input: ReviewInput;
}>;


export type CreateEventReviewMutation = { createEventReview: { id: number, rating: number, body: string | null, image_urls: Array<string>, created_at: string, is_mine: boolean, subject_name: string | null, subject_href: string | null, author: { name: string, image: string | null } } };

export type UpdateReviewMutationVariables = Exact<{
  id: number;
  input: ReviewInput;
}>;


export type UpdateReviewMutation = { updateReview: { id: number, rating: number, body: string | null, image_urls: Array<string>, created_at: string, is_mine: boolean, subject_name: string | null, subject_href: string | null, author: { name: string, image: string | null } } };

export type DeleteReviewMutationVariables = Exact<{
  id: number;
}>;


export type DeleteReviewMutation = { deleteReview: boolean };

export type CreateReviewImageUploadMutationVariables = Exact<{
  input: ReviewUploadInput;
}>;


export type CreateReviewImageUploadMutation = { createReviewImageUpload: { upload_url: string, public_url: string, key: string } };

export type ReviewFieldsFragment = { id: number, rating: number, body: string | null, image_urls: Array<string>, created_at: string, is_mine: boolean, subject_name: string | null, subject_href: string | null, author: { name: string, image: string | null } };

export type ReviewSummaryFieldsFragment = { average: number, count: number, distribution: Array<number> };

export type ReviewEligibilityFieldsFragment = { can_review: boolean, reason: string | null, my_review: { id: number, rating: number, body: string | null, image_urls: Array<string>, created_at: string, is_mine: boolean, subject_name: string | null, subject_href: string | null, author: { name: string, image: string | null } } | null };

export type ProductReviewsQueryVariables = Exact<{
  product_id: number;
  page?: number | null | undefined;
  limit?: number | null | undefined;
}>;


export type ProductReviewsQuery = { productReviews: { items: Array<{ id: number, rating: number, body: string | null, image_urls: Array<string>, created_at: string, is_mine: boolean, subject_name: string | null, subject_href: string | null, author: { name: string, image: string | null } }>, page_info: { total: number, page: number, limit: number, has_more: boolean }, summary: { average: number, count: number, distribution: Array<number> } } };

export type EventReviewsQueryVariables = Exact<{
  event_id: number;
  page?: number | null | undefined;
  limit?: number | null | undefined;
}>;


export type EventReviewsQuery = { eventReviews: { items: Array<{ id: number, rating: number, body: string | null, image_urls: Array<string>, created_at: string, is_mine: boolean, subject_name: string | null, subject_href: string | null, author: { name: string, image: string | null } }>, page_info: { total: number, page: number, limit: number, has_more: boolean }, summary: { average: number, count: number, distribution: Array<number> } } };

export type ProductReviewEligibilityQueryVariables = Exact<{
  slug: string;
}>;


export type ProductReviewEligibilityQuery = { product: { id: number, review_eligibility: { can_review: boolean, reason: string | null, my_review: { id: number, rating: number, body: string | null, image_urls: Array<string>, created_at: string, is_mine: boolean, subject_name: string | null, subject_href: string | null, author: { name: string, image: string | null } } | null } } };

export type EventReviewEligibilityQueryVariables = Exact<{
  slug: string;
}>;


export type EventReviewEligibilityQuery = { event: { id: number, review_eligibility: { can_review: boolean, reason: string | null, my_review: { id: number, rating: number, body: string | null, image_urls: Array<string>, created_at: string, is_mine: boolean, subject_name: string | null, subject_href: string | null, author: { name: string, image: string | null } } | null } } };

export type RecentReviewsQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export type RecentReviewsQuery = { recentReviews: Array<{ id: number, rating: number, body: string | null, image_urls: Array<string>, created_at: string, is_mine: boolean, subject_name: string | null, subject_href: string | null, author: { name: string, image: string | null } }> };

export type SiteSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type SiteSettingsQuery = { siteSettings: { contact_phone: string, whatsapp_number: string, contact_email: string, address: string, opening_hours: string, instagram_url: string, facebook_url: string, youtube_url: string, shipping_flat_fee: number, free_shipping_above: number | null, dispatch_days_min: number, dispatch_days_max: number, announcement_text: string | null, announcement_href: string | null, hero_heading: string, hero_subheading: string, hero_image_url: string, hero_cta_text: string, hero_cta_href: string } };

export type SitemapQueryVariables = Exact<{ [key: string]: never; }>;


export type SitemapQuery = { sitemap: { products: Array<{ slug: string, updated_at: string }>, events: Array<{ slug: string, updated_at: string }>, workshops: Array<{ slug: string, updated_at: string }> } };

export type SuggestQueryVariables = Exact<{
  q: string;
}>;


export type SuggestQuery = { suggest: { pieces: Array<{ id: number, slug: string, name: string, price: number, image_url: string | null, is_archived: boolean }>, events: Array<{ id: number, slug: string, title: string, starts_at: string }>, workshops: Array<{ id: number, slug: string, name: string }> } };

export type CreateCustomizationUploadMutationVariables = Exact<{
  content_type: string;
  size: number;
}>;


export type CreateCustomizationUploadMutation = { createCustomizationUpload: { upload_url: string, public_url: string, key: string } };

export type StudioVisitAvailabilityQueryVariables = Exact<{
  from?: string | null | undefined;
  days?: number | null | undefined;
}>;


export type StudioVisitAvailabilityQuery = { studioVisitAvailability: Array<{ date: string, weekday: number, is_closed: boolean, reason: string | null, windows: Array<{ starts_at: string, ends_at: string, is_available: boolean, reason: string | null }> }> };

export type BookStudioVisitMutationVariables = Exact<{
  input: StudioVisitInput;
}>;


export type BookStudioVisitMutation = { bookStudioVisit: { id: string, starts_at: string, ends_at: string, name: string } };

export type RecordWhatsAppMessageMutationVariables = Exact<{
  input: RecordWhatsAppMessageInput;
}>;


export type RecordWhatsAppMessageMutation = { recordWhatsAppMessage: boolean };

export type WishlistQueryVariables = Exact<{ [key: string]: never; }>;


export type WishlistQuery = { wishlist: Array<{ id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, is_second: boolean, rating_avg: number, rating_count: number, glaze: { id: number, slug: string, name: string, color_code: string | null, swatch_url: string | null } | null, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null }> };

export type WishlistIdsQueryVariables = Exact<{ [key: string]: never; }>;


export type WishlistIdsQuery = { wishlistIds: Array<number> };

export type ToggleWishlistMutationVariables = Exact<{
  productId: number;
}>;


export type ToggleWishlistMutation = { toggleWishlist: { product_id: number, is_wishlisted: boolean, wishlist_count: number } };

export type WorkshopConfigFieldsFragment = { id: number, slug: string, name: string, description: string | null, image_url: string | null, timezone: string, opening_minutes: number, closing_minutes: number, slot_minutes: number, capacity_per_slot: number, booking_window_days: number, slot_span_days: number, closed_weekdays: Array<number>, tiers: Array<{ hours: number, price_per_person: number, pieces_per_person: number }> };

export type WorkshopBookingFieldsFragment = { id: string, starts_at: string, ends_at: string, hours: number, participants: number, price_per_person: number, pieces_per_person: number, subtotal: number, discount: number, total: number, status: RegistrationStatus, note: string | null, cancel_reason: string | null, can_cancel: boolean, can_reschedule: boolean, created_at: string, approved_at: string | null, confirmed_at: string | null, rejected_at: string | null, cancelled_at: string | null, slots: Array<{ starts_at: string, ends_at: string }>, config: { id: number, slug: string, name: string, description: string | null, image_url: string | null, timezone: string, opening_minutes: number, closing_minutes: number, slot_minutes: number, capacity_per_slot: number, booking_window_days: number, slot_span_days: number, closed_weekdays: Array<number>, tiers: Array<{ hours: number, price_per_person: number, pieces_per_person: number }> } };

export type WorkshopsQueryVariables = Exact<{ [key: string]: never; }>;


export type WorkshopsQuery = { workshops: Array<{ id: number, slug: string, name: string, description: string | null, image_url: string | null, timezone: string, opening_minutes: number, closing_minutes: number, slot_minutes: number, capacity_per_slot: number, booking_window_days: number, slot_span_days: number, closed_weekdays: Array<number>, tiers: Array<{ hours: number, price_per_person: number, pieces_per_person: number }> }> };

export type WorkshopQueryVariables = Exact<{
  slug: string;
}>;


export type WorkshopQuery = { workshop: { id: number, slug: string, name: string, description: string | null, image_url: string | null, timezone: string, opening_minutes: number, closing_minutes: number, slot_minutes: number, capacity_per_slot: number, booking_window_days: number, slot_span_days: number, closed_weekdays: Array<number>, tiers: Array<{ hours: number, price_per_person: number, pieces_per_person: number }> } };

export type WorkshopAvailabilityQueryVariables = Exact<{
  input: WorkshopAvailabilityInput;
}>;


export type WorkshopAvailabilityQuery = { workshopAvailability: Array<{ date: string, weekday: number, is_closed: boolean, reason: string | null, slots: Array<{ starts_at: string, ends_at: string, remaining: number, is_available: boolean, reason: string | null }> }> };

export type BookWorkshopMutationVariables = Exact<{
  input: BookWorkshopInput;
}>;


export type BookWorkshopMutation = { bookWorkshop: { id: string, starts_at: string, ends_at: string, hours: number, participants: number, price_per_person: number, pieces_per_person: number, subtotal: number, discount: number, total: number, status: RegistrationStatus, note: string | null, cancel_reason: string | null, can_cancel: boolean, can_reschedule: boolean, created_at: string, approved_at: string | null, confirmed_at: string | null, rejected_at: string | null, cancelled_at: string | null, slots: Array<{ starts_at: string, ends_at: string }>, config: { id: number, slug: string, name: string, description: string | null, image_url: string | null, timezone: string, opening_minutes: number, closing_minutes: number, slot_minutes: number, capacity_per_slot: number, booking_window_days: number, slot_span_days: number, closed_weekdays: Array<number>, tiers: Array<{ hours: number, price_per_person: number, pieces_per_person: number }> } } };

export type RescheduleWorkshopBookingMutationVariables = Exact<{
  input: RescheduleWorkshopInput;
}>;


export type RescheduleWorkshopBookingMutation = { rescheduleWorkshopBooking: { id: string, starts_at: string, ends_at: string, hours: number, participants: number, price_per_person: number, pieces_per_person: number, subtotal: number, discount: number, total: number, status: RegistrationStatus, note: string | null, cancel_reason: string | null, can_cancel: boolean, can_reschedule: boolean, created_at: string, approved_at: string | null, confirmed_at: string | null, rejected_at: string | null, cancelled_at: string | null, slots: Array<{ starts_at: string, ends_at: string }>, config: { id: number, slug: string, name: string, description: string | null, image_url: string | null, timezone: string, opening_minutes: number, closing_minutes: number, slot_minutes: number, capacity_per_slot: number, booking_window_days: number, slot_span_days: number, closed_weekdays: Array<number>, tiers: Array<{ hours: number, price_per_person: number, pieces_per_person: number }> } } };

export type MyWorkshopBookingsQueryVariables = Exact<{
  page?: number | null | undefined;
  limit?: number | null | undefined;
}>;


export type MyWorkshopBookingsQuery = { myWorkshopBookings: { items: Array<{ id: string, starts_at: string, ends_at: string, hours: number, participants: number, price_per_person: number, pieces_per_person: number, subtotal: number, discount: number, total: number, status: RegistrationStatus, note: string | null, cancel_reason: string | null, can_cancel: boolean, can_reschedule: boolean, created_at: string, approved_at: string | null, confirmed_at: string | null, rejected_at: string | null, cancelled_at: string | null, slots: Array<{ starts_at: string, ends_at: string }>, config: { id: number, slug: string, name: string, description: string | null, image_url: string | null, timezone: string, opening_minutes: number, closing_minutes: number, slot_minutes: number, capacity_per_slot: number, booking_window_days: number, slot_span_days: number, closed_weekdays: Array<number>, tiers: Array<{ hours: number, price_per_person: number, pieces_per_person: number }> } }>, page_info: { total: number, page: number, limit: number, has_more: boolean } } };

export type WorkshopBookingQueryVariables = Exact<{
  id: string;
}>;


export type WorkshopBookingQuery = { workshopBooking: { id: string, starts_at: string, ends_at: string, hours: number, participants: number, price_per_person: number, pieces_per_person: number, subtotal: number, discount: number, total: number, status: RegistrationStatus, note: string | null, cancel_reason: string | null, can_cancel: boolean, can_reschedule: boolean, created_at: string, approved_at: string | null, confirmed_at: string | null, rejected_at: string | null, cancelled_at: string | null, slots: Array<{ starts_at: string, ends_at: string }>, config: { id: number, slug: string, name: string, description: string | null, image_url: string | null, timezone: string, opening_minutes: number, closing_minutes: number, slot_minutes: number, capacity_per_slot: number, booking_window_days: number, slot_span_days: number, closed_weekdays: Array<number>, tiers: Array<{ hours: number, price_per_person: number, pieces_per_person: number }> } } };

export type CancelWorkshopBookingMutationVariables = Exact<{
  id: string;
  reason?: string | null | undefined;
}>;


export type CancelWorkshopBookingMutation = { cancelWorkshopBooking: { id: string, starts_at: string, ends_at: string, hours: number, participants: number, price_per_person: number, pieces_per_person: number, subtotal: number, discount: number, total: number, status: RegistrationStatus, note: string | null, cancel_reason: string | null, can_cancel: boolean, can_reschedule: boolean, created_at: string, approved_at: string | null, confirmed_at: string | null, rejected_at: string | null, cancelled_at: string | null, slots: Array<{ starts_at: string, ends_at: string }>, config: { id: number, slug: string, name: string, description: string | null, image_url: string | null, timezone: string, opening_minutes: number, closing_minutes: number, slot_minutes: number, capacity_per_slot: number, booking_window_days: number, slot_span_days: number, closed_weekdays: Array<number>, tiers: Array<{ hours: number, price_per_person: number, pieces_per_person: number }> } } };

export const AddressFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]} as unknown as DocumentNode<AddressFieldsFragment, unknown>;
export const AdminCategoryFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCategoryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"product_count"}}]}}]} as unknown as DocumentNode<AdminCategoryFieldsFragment, unknown>;
export const AdminCollectionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCollectionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Collection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"product_count"}}]}}]} as unknown as DocumentNode<AdminCollectionFieldsFragment, unknown>;
export const AdminCommissionFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCommissionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommissionRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"piece_type"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"}},{"kind":"Field","name":{"kind":"Name","value":"carved_words"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"is_read"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]} as unknown as DocumentNode<AdminCommissionFieldsFragment, unknown>;
export const AdminContentPageFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminContentPageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ContentPage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"hero_image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_published"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"sections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"heading"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}}]}}]}}]}}]} as unknown as DocumentNode<AdminContentPageFieldsFragment, unknown>;
export const AdminSiteSettingsFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminSiteSettingsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SiteSettings"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contact_email"}},{"kind":"Field","name":{"kind":"Name","value":"contact_phone"}},{"kind":"Field","name":{"kind":"Name","value":"whatsapp_number"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"opening_hours"}},{"kind":"Field","name":{"kind":"Name","value":"instagram_url"}},{"kind":"Field","name":{"kind":"Name","value":"facebook_url"}},{"kind":"Field","name":{"kind":"Name","value":"youtube_url"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_flat_fee"}},{"kind":"Field","name":{"kind":"Name","value":"free_shipping_above"}},{"kind":"Field","name":{"kind":"Name","value":"dispatch_days_min"}},{"kind":"Field","name":{"kind":"Name","value":"dispatch_days_max"}},{"kind":"Field","name":{"kind":"Name","value":"hero_heading"}},{"kind":"Field","name":{"kind":"Name","value":"hero_subheading"}},{"kind":"Field","name":{"kind":"Name","value":"hero_cta_text"}},{"kind":"Field","name":{"kind":"Name","value":"hero_cta_href"}},{"kind":"Field","name":{"kind":"Name","value":"hero_image_url"}},{"kind":"Field","name":{"kind":"Name","value":"announcement_text"}},{"kind":"Field","name":{"kind":"Name","value":"announcement_href"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<AdminSiteSettingsFieldsFragment, unknown>;
export const AdminCouponFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCouponFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCoupon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"min_order"}},{"kind":"Field","name":{"kind":"Name","value":"max_uses"}},{"kind":"Field","name":{"kind":"Name","value":"uses_count"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]} as unknown as DocumentNode<AdminCouponFieldsFragment, unknown>;
export const AdminEventRowFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminEventRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}}]} as unknown as DocumentNode<AdminEventRowFragment, unknown>;
export const AdminEventDetailFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminEventDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminEventRow"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"gallery"}},{"kind":"Field","name":{"kind":"Name","value":"highlights"}},{"kind":"Field","name":{"kind":"Name","value":"includes"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminEventRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}}]} as unknown as DocumentNode<AdminEventDetailFragment, unknown>;
export const AdminUserRefFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]} as unknown as DocumentNode<AdminUserRefFieldsFragment, unknown>;
export const AdminRegistrationRowFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminRegistrationRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminRegistration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"next_statuses"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"registration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seats"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]} as unknown as DocumentNode<AdminRegistrationRowFragment, unknown>;
export const AdminGlazeFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminGlazeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminGlaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"variation_note"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product_count"}}]}}]} as unknown as DocumentNode<AdminGlazeFieldsFragment, unknown>;
export const AdminContactMessageFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminContactMessageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ContactMessage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"is_read"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]} as unknown as DocumentNode<AdminContactMessageFieldsFragment, unknown>;
export const AdminSubscriberFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminSubscriberFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminSubscriber"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"unsubscribed_at"}}]}}]} as unknown as DocumentNode<AdminSubscriberFieldsFragment, unknown>;
export const AdminBatchNotificationFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminBatchNotificationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminBatchNotification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"product_id"}},{"kind":"Field","name":{"kind":"Name","value":"product_name"}},{"kind":"Field","name":{"kind":"Name","value":"product_slug"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"notified_at"}}]}}]} as unknown as DocumentNode<AdminBatchNotificationFieldsFragment, unknown>;
export const AdminOrderRowFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"admin_note"}},{"kind":"Field","name":{"kind":"Name","value":"next_statuses"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"paid_at"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_code"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]} as unknown as DocumentNode<AdminOrderRowFragment, unknown>;
export const OrderFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_code"}},{"kind":"Field","name":{"kind":"Name","value":"customer_note"}},{"kind":"Field","name":{"kind":"Name","value":"gift_note"}},{"kind":"Field","name":{"kind":"Name","value":"hide_prices"}},{"kind":"Field","name":{"kind":"Name","value":"tracking_note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"paid_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipped_at"}},{"kind":"Field","name":{"kind":"Name","value":"delivered_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"product_name"}},{"kind":"Field","name":{"kind":"Name","value":"product_image"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"studio_notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<OrderFieldsFragment, unknown>;
export const AdminOrderDetailFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"admin_note"}},{"kind":"Field","name":{"kind":"Name","value":"next_statuses"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_code"}},{"kind":"Field","name":{"kind":"Name","value":"customer_note"}},{"kind":"Field","name":{"kind":"Name","value":"gift_note"}},{"kind":"Field","name":{"kind":"Name","value":"hide_prices"}},{"kind":"Field","name":{"kind":"Name","value":"tracking_note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"paid_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipped_at"}},{"kind":"Field","name":{"kind":"Name","value":"delivered_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"product_name"}},{"kind":"Field","name":{"kind":"Name","value":"product_image"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"studio_notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<AdminOrderDetailFragment, unknown>;
export const AdminProductRowFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"is_commission"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<AdminProductRowFragment, unknown>;
export const AdminOptionGroupFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOptionGroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductOptionGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"max_length"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}}]}}]}}]} as unknown as DocumentNode<AdminOptionGroupFieldsFragment, unknown>;
export const AdminProductDetailFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductRow"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"sales_count"}},{"kind":"Field","name":{"kind":"Name","value":"flaw_note"}},{"kind":"Field","name":{"kind":"Name","value":"maker_note"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_ml"}},{"kind":"Field","name":{"kind":"Name","value":"height_cm"}},{"kind":"Field","name":{"kind":"Name","value":"diameter_cm"}},{"kind":"Field","name":{"kind":"Name","value":"weight_g"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option_groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOptionGroupFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"is_commission"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOptionGroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductOptionGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"max_length"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}}]}}]}}]} as unknown as DocumentNode<AdminProductDetailFragment, unknown>;
export const AdminReviewRowFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminReviewRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminReview"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"is_hidden"}},{"kind":"Field","name":{"kind":"Name","value":"subject_kind"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"review"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"subject_name"}},{"kind":"Field","name":{"kind":"Name","value":"subject_href"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]} as unknown as DocumentNode<AdminReviewRowFragment, unknown>;
export const AdminPageInfoFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<AdminPageInfoFieldsFragment, unknown>;
export const AdminUserFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"orders_count"}},{"kind":"Field","name":{"kind":"Name","value":"registrations_count"}},{"kind":"Field","name":{"kind":"Name","value":"bookings_count"}},{"kind":"Field","name":{"kind":"Name","value":"reviews_count"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]} as unknown as DocumentNode<AdminUserFieldsFragment, unknown>;
export const AdminStudioVisitFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminStudioVisitFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminStudioVisit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"visit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]} as unknown as DocumentNode<AdminStudioVisitFieldsFragment, unknown>;
export const AdminWhatsAppMessageFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminWhatsAppMessageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WhatsAppMessage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"page_url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]} as unknown as DocumentNode<AdminWhatsAppMessageFieldsFragment, unknown>;
export const AdminWorkshopConfigFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminWorkshopConfigFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"opening_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"closing_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"slot_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_per_slot"}},{"kind":"Field","name":{"kind":"Name","value":"booking_window_days"}},{"kind":"Field","name":{"kind":"Name","value":"slot_span_days"}},{"kind":"Field","name":{"kind":"Name","value":"closed_weekdays"}},{"kind":"Field","name":{"kind":"Name","value":"tiers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}}]}}]}}]} as unknown as DocumentNode<AdminWorkshopConfigFieldsFragment, unknown>;
export const AdminWorkshopBlackoutFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminWorkshopBlackoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminWorkshopBlackout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"config_id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}}]} as unknown as DocumentNode<AdminWorkshopBlackoutFieldsFragment, unknown>;
export const AdminWorkshopBookingRowFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminWorkshopBookingRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminWorkshopBooking"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"next_statuses"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"booking"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"participants"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"config"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]} as unknown as DocumentNode<AdminWorkshopBookingRowFragment, unknown>;
export const ArchivePieceFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ArchivePiece"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<ArchivePieceFragment, unknown>;
export const GlazeCardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}}]} as unknown as DocumentNode<GlazeCardFragment, unknown>;
export const ProductCardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}}]} as unknown as DocumentNode<ProductCardFragment, unknown>;
export const CartFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Cart"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"free_shipping_above"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"unavailable_reason"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductCard"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}}]}}]} as unknown as DocumentNode<CartFieldsFragment, unknown>;
export const EventCardFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}}]} as unknown as DocumentNode<EventCardFragment, unknown>;
export const RegistrationFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RegistrationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Registration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seats"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"rejected_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventCard"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}}]} as unknown as DocumentNode<RegistrationFieldsFragment, unknown>;
export const ReviewSummaryFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RatingSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"average"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"distribution"}}]}}]} as unknown as DocumentNode<ReviewSummaryFieldsFragment, unknown>;
export const ReviewFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Review"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_mine"}},{"kind":"Field","name":{"kind":"Name","value":"subject_name"}},{"kind":"Field","name":{"kind":"Name","value":"subject_href"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]}}]} as unknown as DocumentNode<ReviewFieldsFragment, unknown>;
export const ReviewEligibilityFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewEligibilityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewEligibility"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"can_review"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"my_review"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Review"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_mine"}},{"kind":"Field","name":{"kind":"Name","value":"subject_name"}},{"kind":"Field","name":{"kind":"Name","value":"subject_href"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]}}]} as unknown as DocumentNode<ReviewEligibilityFieldsFragment, unknown>;
export const WorkshopConfigFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkshopConfigFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"opening_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"closing_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"slot_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_per_slot"}},{"kind":"Field","name":{"kind":"Name","value":"booking_window_days"}},{"kind":"Field","name":{"kind":"Name","value":"slot_span_days"}},{"kind":"Field","name":{"kind":"Name","value":"closed_weekdays"}},{"kind":"Field","name":{"kind":"Name","value":"tiers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}}]}}]}}]} as unknown as DocumentNode<WorkshopConfigFieldsFragment, unknown>;
export const WorkshopBookingFieldsFragmentDoc = {"kind":"Document","definitions":[{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkshopBookingFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopBooking"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"slots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"participants"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"can_reschedule"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"rejected_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"config"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkshopConfigFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkshopConfigFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"opening_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"closing_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"slot_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_per_slot"}},{"kind":"Field","name":{"kind":"Name","value":"booking_window_days"}},{"kind":"Field","name":{"kind":"Name","value":"slot_span_days"}},{"kind":"Field","name":{"kind":"Name","value":"closed_weekdays"}},{"kind":"Field","name":{"kind":"Name","value":"tiers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}}]}}]}}]} as unknown as DocumentNode<WorkshopBookingFieldsFragment, unknown>;
export const AddressesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Addresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addresses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]} as unknown as DocumentNode<AddressesQuery, AddressesQueryVariables>;
export const CreateAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]} as unknown as DocumentNode<CreateAddressMutation, CreateAddressMutationVariables>;
export const UpdateAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddressInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]} as unknown as DocumentNode<UpdateAddressMutation, UpdateAddressMutationVariables>;
export const DeleteAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteAddressMutation, DeleteAddressMutationVariables>;
export const SetDefaultAddressDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetDefaultAddress"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setDefaultAddress"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AddressFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AddressFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Address"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}},{"kind":"Field","name":{"kind":"Name","value":"is_default"}}]}}]} as unknown as DocumentNode<SetDefaultAddressMutation, SetDefaultAddressMutationVariables>;
export const AdminCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCategoryFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCategoryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"product_count"}}]}}]} as unknown as DocumentNode<AdminCategoriesQuery, AdminCategoriesQueryVariables>;
export const AdminCollectionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCollections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCollections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCollectionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCollectionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Collection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"product_count"}}]}}]} as unknown as DocumentNode<AdminCollectionsQuery, AdminCollectionsQueryVariables>;
export const CreateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCategoryFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCategoryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"product_count"}}]}}]} as unknown as DocumentNode<CreateCategoryMutation, CreateCategoryMutationVariables>;
export const UpdateCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCategoryInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCategoryFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCategoryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Category"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"product_count"}}]}}]} as unknown as DocumentNode<UpdateCategoryMutation, UpdateCategoryMutationVariables>;
export const DeleteCategoryDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCategory"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCategory"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteCategoryMutation, DeleteCategoryMutationVariables>;
export const CreateCollectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCollection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCollectionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCollectionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCollectionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Collection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"product_count"}}]}}]} as unknown as DocumentNode<CreateCollectionMutation, CreateCollectionMutationVariables>;
export const UpdateCollectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCollection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCollectionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCollectionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCollectionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Collection"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"product_count"}}]}}]} as unknown as DocumentNode<UpdateCollectionMutation, UpdateCollectionMutationVariables>;
export const DeleteCollectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCollection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCollection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteCollectionMutation, DeleteCollectionMutationVariables>;
export const CommissionRequestsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CommissionRequests"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CommissionRequestsFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commissionRequests"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCommissionFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCommissionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommissionRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"piece_type"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"}},{"kind":"Field","name":{"kind":"Name","value":"carved_words"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"is_read"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<CommissionRequestsQuery, CommissionRequestsQueryVariables>;
export const MarkCommissionRequestReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkCommissionRequestRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markCommissionRequestRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCommissionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCommissionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommissionRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"piece_type"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"}},{"kind":"Field","name":{"kind":"Name","value":"carved_words"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"is_read"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]} as unknown as DocumentNode<MarkCommissionRequestReadMutation, MarkCommissionRequestReadMutationVariables>;
export const SetCommissionRequestStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetCommissionRequestStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CommissionStatus"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setCommissionRequestStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCommissionFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCommissionFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"CommissionRequest"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"piece_type"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"}},{"kind":"Field","name":{"kind":"Name","value":"carved_words"}},{"kind":"Field","name":{"kind":"Name","value":"notes"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"is_read"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]} as unknown as DocumentNode<SetCommissionRequestStatusMutation, SetCommissionRequestStatusMutationVariables>;
export const AdminContentPagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminContentPages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminContentPages"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"is_published"}}]}}]}}]} as unknown as DocumentNode<AdminContentPagesQuery, AdminContentPagesQueryVariables>;
export const AdminContentPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminContentPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminContentPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminContentPageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminContentPageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ContentPage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"hero_image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_published"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"sections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"heading"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}}]}}]}}]}}]} as unknown as DocumentNode<AdminContentPageQuery, AdminContentPageQueryVariables>;
export const AdminSiteSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminSiteSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"siteSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminSiteSettingsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminSiteSettingsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SiteSettings"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contact_email"}},{"kind":"Field","name":{"kind":"Name","value":"contact_phone"}},{"kind":"Field","name":{"kind":"Name","value":"whatsapp_number"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"opening_hours"}},{"kind":"Field","name":{"kind":"Name","value":"instagram_url"}},{"kind":"Field","name":{"kind":"Name","value":"facebook_url"}},{"kind":"Field","name":{"kind":"Name","value":"youtube_url"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_flat_fee"}},{"kind":"Field","name":{"kind":"Name","value":"free_shipping_above"}},{"kind":"Field","name":{"kind":"Name","value":"dispatch_days_min"}},{"kind":"Field","name":{"kind":"Name","value":"dispatch_days_max"}},{"kind":"Field","name":{"kind":"Name","value":"hero_heading"}},{"kind":"Field","name":{"kind":"Name","value":"hero_subheading"}},{"kind":"Field","name":{"kind":"Name","value":"hero_cta_text"}},{"kind":"Field","name":{"kind":"Name","value":"hero_cta_href"}},{"kind":"Field","name":{"kind":"Name","value":"hero_image_url"}},{"kind":"Field","name":{"kind":"Name","value":"announcement_text"}},{"kind":"Field","name":{"kind":"Name","value":"announcement_href"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<AdminSiteSettingsQuery, AdminSiteSettingsQueryVariables>;
export const SaveContentPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveContentPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ContentPageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveContentPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminContentPageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminContentPageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ContentPage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"hero_image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_published"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"sections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"heading"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}}]}}]}}]}}]} as unknown as DocumentNode<SaveContentPageMutation, SaveContentPageMutationVariables>;
export const DeleteContentPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteContentPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteContentPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}]}]}}]} as unknown as DocumentNode<DeleteContentPageMutation, DeleteContentPageMutationVariables>;
export const UpdateSiteSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSiteSettings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminSiteSettingsInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSiteSettings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminSiteSettingsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminSiteSettingsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SiteSettings"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contact_email"}},{"kind":"Field","name":{"kind":"Name","value":"contact_phone"}},{"kind":"Field","name":{"kind":"Name","value":"whatsapp_number"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"opening_hours"}},{"kind":"Field","name":{"kind":"Name","value":"instagram_url"}},{"kind":"Field","name":{"kind":"Name","value":"facebook_url"}},{"kind":"Field","name":{"kind":"Name","value":"youtube_url"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_flat_fee"}},{"kind":"Field","name":{"kind":"Name","value":"free_shipping_above"}},{"kind":"Field","name":{"kind":"Name","value":"dispatch_days_min"}},{"kind":"Field","name":{"kind":"Name","value":"dispatch_days_max"}},{"kind":"Field","name":{"kind":"Name","value":"hero_heading"}},{"kind":"Field","name":{"kind":"Name","value":"hero_subheading"}},{"kind":"Field","name":{"kind":"Name","value":"hero_cta_text"}},{"kind":"Field","name":{"kind":"Name","value":"hero_cta_href"}},{"kind":"Field","name":{"kind":"Name","value":"hero_image_url"}},{"kind":"Field","name":{"kind":"Name","value":"announcement_text"}},{"kind":"Field","name":{"kind":"Name","value":"announcement_href"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<UpdateSiteSettingsMutation, UpdateSiteSettingsMutationVariables>;
export const UpdateAnnouncementDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateAnnouncement"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminAnnouncementInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateAnnouncement"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminSiteSettingsFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminSiteSettingsFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"SiteSettings"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contact_email"}},{"kind":"Field","name":{"kind":"Name","value":"contact_phone"}},{"kind":"Field","name":{"kind":"Name","value":"whatsapp_number"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"opening_hours"}},{"kind":"Field","name":{"kind":"Name","value":"instagram_url"}},{"kind":"Field","name":{"kind":"Name","value":"facebook_url"}},{"kind":"Field","name":{"kind":"Name","value":"youtube_url"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_flat_fee"}},{"kind":"Field","name":{"kind":"Name","value":"free_shipping_above"}},{"kind":"Field","name":{"kind":"Name","value":"dispatch_days_min"}},{"kind":"Field","name":{"kind":"Name","value":"dispatch_days_max"}},{"kind":"Field","name":{"kind":"Name","value":"hero_heading"}},{"kind":"Field","name":{"kind":"Name","value":"hero_subheading"}},{"kind":"Field","name":{"kind":"Name","value":"hero_cta_text"}},{"kind":"Field","name":{"kind":"Name","value":"hero_cta_href"}},{"kind":"Field","name":{"kind":"Name","value":"hero_image_url"}},{"kind":"Field","name":{"kind":"Name","value":"announcement_text"}},{"kind":"Field","name":{"kind":"Name","value":"announcement_href"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]} as unknown as DocumentNode<UpdateAnnouncementMutation, UpdateAnnouncementMutationVariables>;
export const AdminCouponsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminCoupons"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCouponsFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminCoupons"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCouponFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCouponFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCoupon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"min_order"}},{"kind":"Field","name":{"kind":"Name","value":"max_uses"}},{"kind":"Field","name":{"kind":"Name","value":"uses_count"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<AdminCouponsQuery, AdminCouponsQueryVariables>;
export const CreateCouponDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCoupon"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCouponInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCoupon"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCouponFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCouponFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCoupon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"min_order"}},{"kind":"Field","name":{"kind":"Name","value":"max_uses"}},{"kind":"Field","name":{"kind":"Name","value":"uses_count"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]} as unknown as DocumentNode<CreateCouponMutation, CreateCouponMutationVariables>;
export const UpdateCouponDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCoupon"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCouponInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCoupon"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminCouponFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminCouponFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminCoupon"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"code"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"min_order"}},{"kind":"Field","name":{"kind":"Name","value":"max_uses"}},{"kind":"Field","name":{"kind":"Name","value":"uses_count"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"expires_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]} as unknown as DocumentNode<UpdateCouponMutation, UpdateCouponMutationVariables>;
export const DeleteCouponDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteCoupon"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteCoupon"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteCouponMutation, DeleteCouponMutationVariables>;
export const AdminDashboardDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminDashboard"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orders_last_30_days"}},{"kind":"Field","name":{"kind":"Name","value":"revenue_last_30_days"}},{"kind":"Field","name":{"kind":"Name","value":"pending_registrations"}},{"kind":"Field","name":{"kind":"Name","value":"pending_bookings"}},{"kind":"Field","name":{"kind":"Name","value":"unread_messages"}},{"kind":"Field","name":{"kind":"Name","value":"new_commission_requests"}},{"kind":"Field","name":{"kind":"Name","value":"upcoming_visits"}},{"kind":"Field","name":{"kind":"Name","value":"orders_by_status"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"recent_orders"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"recent_bookings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"participants"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"low_stock"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]} as unknown as DocumentNode<AdminDashboardQuery, AdminDashboardQueryVariables>;
export const AdminEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminEvents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminEventsFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminEventRow"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminEventRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<AdminEventsQuery, AdminEventsQueryVariables>;
export const AdminEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminEventDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminEventRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminEventDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminEventRow"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"gallery"}},{"kind":"Field","name":{"kind":"Name","value":"highlights"}},{"kind":"Field","name":{"kind":"Name","value":"includes"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}}]}}]} as unknown as DocumentNode<AdminEventQuery, AdminEventQueryVariables>;
export const AdminEventRegistrationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminEventRegistrations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminRegistrationsFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminEventRegistrations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminRegistrationRow"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminRegistrationRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminRegistration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"next_statuses"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"registration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seats"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<AdminEventRegistrationsQuery, AdminEventRegistrationsQueryVariables>;
export const CreateEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminEventDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminEventRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminEventDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminEventRow"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"gallery"}},{"kind":"Field","name":{"kind":"Name","value":"highlights"}},{"kind":"Field","name":{"kind":"Name","value":"includes"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}}]}}]} as unknown as DocumentNode<CreateEventMutation, CreateEventMutationVariables>;
export const UpdateEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminEventDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminEventRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminEventDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminEventRow"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"gallery"}},{"kind":"Field","name":{"kind":"Name","value":"highlights"}},{"kind":"Field","name":{"kind":"Name","value":"includes"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}}]}}]} as unknown as DocumentNode<UpdateEventMutation, UpdateEventMutationVariables>;
export const PublishEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PublishEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"publishEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminEventRow"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminEventRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}}]} as unknown as DocumentNode<PublishEventMutation, PublishEventMutationVariables>;
export const UnpublishEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnpublishEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unpublishEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminEventRow"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminEventRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}}]} as unknown as DocumentNode<UnpublishEventMutation, UnpublishEventMutationVariables>;
export const CompleteEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CompleteEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"completeEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminEventRow"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminEventRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}}]} as unknown as DocumentNode<CompleteEventMutation, CompleteEventMutationVariables>;
export const CancelEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminEventRow"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminEventRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}}]} as unknown as DocumentNode<CancelEventMutation, CancelEventMutationVariables>;
export const SetRegistrationStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetRegistrationStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegistrationStatus"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setRegistrationStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminRegistrationRow"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminRegistrationRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminRegistration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"next_statuses"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"registration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seats"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}}]}}]}}]}}]} as unknown as DocumentNode<SetRegistrationStatusMutation, SetRegistrationStatusMutationVariables>;
export const AdminGlazesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminGlazes"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminGlazesFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminGlazes"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminGlazeFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminGlazeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminGlaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"variation_note"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product_count"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<AdminGlazesQuery, AdminGlazesQueryVariables>;
export const CreateGlazeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateGlaze"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminGlazeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createGlaze"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminGlazeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminGlazeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminGlaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"variation_note"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product_count"}}]}}]} as unknown as DocumentNode<CreateGlazeMutation, CreateGlazeMutationVariables>;
export const UpdateGlazeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateGlaze"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminGlazeInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateGlaze"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminGlazeFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminGlazeFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminGlaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"variation_note"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"product_count"}}]}}]} as unknown as DocumentNode<UpdateGlazeMutation, UpdateGlazeMutationVariables>;
export const DeleteGlazeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteGlaze"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteGlaze"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteGlazeMutation, DeleteGlazeMutationVariables>;
export const AdminContactMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminContactMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminContactFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminContactMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminContactMessageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminContactMessageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ContactMessage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"is_read"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<AdminContactMessagesQuery, AdminContactMessagesQueryVariables>;
export const AdminNewsletterSubscribersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminNewsletterSubscribers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminSubscribersFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminNewsletterSubscribers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminSubscriberFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminSubscriberFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminSubscriber"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"user_id"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"unsubscribed_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<AdminNewsletterSubscribersQuery, AdminNewsletterSubscribersQueryVariables>;
export const ExportNewsletterSubscribersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExportNewsletterSubscribers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminSubscribersFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exportNewsletterSubscribers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}]}]}}]} as unknown as DocumentNode<ExportNewsletterSubscribersQuery, ExportNewsletterSubscribersQueryVariables>;
export const SetContactMessageReadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetContactMessageRead"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"is_read"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setContactMessageRead"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"is_read"},"value":{"kind":"Variable","name":{"kind":"Name","value":"is_read"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminContactMessageFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminContactMessageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ContactMessage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"subject"}},{"kind":"Field","name":{"kind":"Name","value":"message"}},{"kind":"Field","name":{"kind":"Name","value":"is_read"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]} as unknown as DocumentNode<SetContactMessageReadMutation, SetContactMessageReadMutationVariables>;
export const DeleteContactMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteContactMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteContactMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteContactMessageMutation, DeleteContactMessageMutationVariables>;
export const UnsubscribeSubscriberDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnsubscribeSubscriber"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unsubscribeSubscriber"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}]}]}}]} as unknown as DocumentNode<UnsubscribeSubscriberMutation, UnsubscribeSubscriberMutationVariables>;
export const AdminBatchNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminBatchNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminBatchNotificationsFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminBatchNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminBatchNotificationFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminBatchNotificationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminBatchNotification"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"product_id"}},{"kind":"Field","name":{"kind":"Name","value":"product_name"}},{"kind":"Field","name":{"kind":"Name","value":"product_slug"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"notified_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<AdminBatchNotificationsQuery, AdminBatchNotificationsQueryVariables>;
export const ExportBatchNotificationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ExportBatchNotifications"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminBatchNotificationsFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"exportBatchNotifications"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}]}]}}]} as unknown as DocumentNode<ExportBatchNotificationsQuery, ExportBatchNotificationsQueryVariables>;
export const AdminOrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminOrders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrdersFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminOrders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderRow"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"admin_note"}},{"kind":"Field","name":{"kind":"Name","value":"next_statuses"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"paid_at"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_code"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<AdminOrdersQuery, AdminOrdersQueryVariables>;
export const AdminOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_code"}},{"kind":"Field","name":{"kind":"Name","value":"customer_note"}},{"kind":"Field","name":{"kind":"Name","value":"gift_note"}},{"kind":"Field","name":{"kind":"Name","value":"hide_prices"}},{"kind":"Field","name":{"kind":"Name","value":"tracking_note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"paid_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipped_at"}},{"kind":"Field","name":{"kind":"Name","value":"delivered_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"product_name"}},{"kind":"Field","name":{"kind":"Name","value":"product_image"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"studio_notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"admin_note"}},{"kind":"Field","name":{"kind":"Name","value":"next_statuses"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}}]} as unknown as DocumentNode<AdminOrderQuery, AdminOrderQueryVariables>;
export const SetOrderStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetOrderStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"OrderStatus"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"tracking_note"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"cancel_reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setOrderStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"tracking_note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"tracking_note"}}},{"kind":"Argument","name":{"kind":"Name","value":"cancel_reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"cancel_reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_code"}},{"kind":"Field","name":{"kind":"Name","value":"customer_note"}},{"kind":"Field","name":{"kind":"Name","value":"gift_note"}},{"kind":"Field","name":{"kind":"Name","value":"hide_prices"}},{"kind":"Field","name":{"kind":"Name","value":"tracking_note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"paid_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipped_at"}},{"kind":"Field","name":{"kind":"Name","value":"delivered_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"product_name"}},{"kind":"Field","name":{"kind":"Name","value":"product_image"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"studio_notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"admin_note"}},{"kind":"Field","name":{"kind":"Name","value":"next_statuses"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}}]} as unknown as DocumentNode<SetOrderStatusMutation, SetOrderStatusMutationVariables>;
export const MarkOrderPaidDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"MarkOrderPaid"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"markOrderPaid"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_code"}},{"kind":"Field","name":{"kind":"Name","value":"customer_note"}},{"kind":"Field","name":{"kind":"Name","value":"gift_note"}},{"kind":"Field","name":{"kind":"Name","value":"hide_prices"}},{"kind":"Field","name":{"kind":"Name","value":"tracking_note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"paid_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipped_at"}},{"kind":"Field","name":{"kind":"Name","value":"delivered_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"product_name"}},{"kind":"Field","name":{"kind":"Name","value":"product_image"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"studio_notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"admin_note"}},{"kind":"Field","name":{"kind":"Name","value":"next_statuses"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}}]} as unknown as DocumentNode<MarkOrderPaidMutation, MarkOrderPaidMutationVariables>;
export const CancelOrderAsAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelOrderAsAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelOrderAsAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_code"}},{"kind":"Field","name":{"kind":"Name","value":"customer_note"}},{"kind":"Field","name":{"kind":"Name","value":"gift_note"}},{"kind":"Field","name":{"kind":"Name","value":"hide_prices"}},{"kind":"Field","name":{"kind":"Name","value":"tracking_note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"paid_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipped_at"}},{"kind":"Field","name":{"kind":"Name","value":"delivered_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"product_name"}},{"kind":"Field","name":{"kind":"Name","value":"product_image"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"studio_notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"admin_note"}},{"kind":"Field","name":{"kind":"Name","value":"next_statuses"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}}]} as unknown as DocumentNode<CancelOrderAsAdminMutation, CancelOrderAsAdminMutationVariables>;
export const SetOrderAdminNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetOrderAdminNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"note"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setOrderAdminNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"note"},"value":{"kind":"Variable","name":{"kind":"Name","value":"note"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOrderDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_code"}},{"kind":"Field","name":{"kind":"Name","value":"customer_note"}},{"kind":"Field","name":{"kind":"Name","value":"gift_note"}},{"kind":"Field","name":{"kind":"Name","value":"hide_prices"}},{"kind":"Field","name":{"kind":"Name","value":"tracking_note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"paid_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipped_at"}},{"kind":"Field","name":{"kind":"Name","value":"delivered_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"product_name"}},{"kind":"Field","name":{"kind":"Name","value":"product_image"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"studio_notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOrderDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOrder"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"admin_note"}},{"kind":"Field","name":{"kind":"Name","value":"next_statuses"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"order"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}}]} as unknown as DocumentNode<SetOrderAdminNoteMutation, SetOrderAdminNoteMutationVariables>;
export const AddOrderNoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddOrderNote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddOrderNoteInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addOrderNote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_code"}},{"kind":"Field","name":{"kind":"Name","value":"customer_note"}},{"kind":"Field","name":{"kind":"Name","value":"gift_note"}},{"kind":"Field","name":{"kind":"Name","value":"hide_prices"}},{"kind":"Field","name":{"kind":"Name","value":"tracking_note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"paid_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipped_at"}},{"kind":"Field","name":{"kind":"Name","value":"delivered_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"product_name"}},{"kind":"Field","name":{"kind":"Name","value":"product_image"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"studio_notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<AddOrderNoteMutation, AddOrderNoteMutationVariables>;
export const AdminProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminProductsFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductRow"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"is_commission"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<AdminProductsQuery, AdminProductsQueryVariables>;
export const AdminProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"is_commission"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOptionGroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductOptionGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"max_length"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductRow"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"sales_count"}},{"kind":"Field","name":{"kind":"Name","value":"flaw_note"}},{"kind":"Field","name":{"kind":"Name","value":"maker_note"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_ml"}},{"kind":"Field","name":{"kind":"Name","value":"height_cm"}},{"kind":"Field","name":{"kind":"Name","value":"diameter_cm"}},{"kind":"Field","name":{"kind":"Name","value":"weight_g"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option_groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOptionGroupFields"}}]}}]}}]} as unknown as DocumentNode<AdminProductQuery, AdminProductQueryVariables>;
export const AdminProductOptionGroupsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminProductOptionGroups"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"product_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminProductOptionGroups"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"product_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"product_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOptionGroupFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOptionGroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductOptionGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"max_length"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}}]}}]}}]} as unknown as DocumentNode<AdminProductOptionGroupsQuery, AdminProductOptionGroupsQueryVariables>;
export const CreateProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminProductInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"is_commission"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOptionGroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductOptionGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"max_length"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductRow"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"sales_count"}},{"kind":"Field","name":{"kind":"Name","value":"flaw_note"}},{"kind":"Field","name":{"kind":"Name","value":"maker_note"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_ml"}},{"kind":"Field","name":{"kind":"Name","value":"height_cm"}},{"kind":"Field","name":{"kind":"Name","value":"diameter_cm"}},{"kind":"Field","name":{"kind":"Name","value":"weight_g"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option_groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOptionGroupFields"}}]}}]}}]} as unknown as DocumentNode<CreateProductMutation, CreateProductMutationVariables>;
export const UpdateProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProduct"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminProductUpdateInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProduct"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductDetail"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"is_commission"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOptionGroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductOptionGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"max_length"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductDetail"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductRow"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"sales_count"}},{"kind":"Field","name":{"kind":"Name","value":"flaw_note"}},{"kind":"Field","name":{"kind":"Name","value":"maker_note"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_ml"}},{"kind":"Field","name":{"kind":"Name","value":"height_cm"}},{"kind":"Field","name":{"kind":"Name","value":"diameter_cm"}},{"kind":"Field","name":{"kind":"Name","value":"weight_g"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option_groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOptionGroupFields"}}]}}]}}]} as unknown as DocumentNode<UpdateProductMutation, UpdateProductMutationVariables>;
export const SetProductActiveDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetProductActive"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"is_active"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setProductActive"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"is_active"},"value":{"kind":"Variable","name":{"kind":"Name","value":"is_active"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductRow"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"is_commission"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<SetProductActiveMutation, SetProductActiveMutationVariables>;
export const SetProductFeaturedDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetProductFeatured"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"is_featured"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setProductFeatured"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"is_featured"},"value":{"kind":"Variable","name":{"kind":"Name","value":"is_featured"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductRow"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"is_commission"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<SetProductFeaturedMutation, SetProductFeaturedMutationVariables>;
export const AdjustProductStockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AdjustProductStock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"delta"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adjustProductStock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"delta"},"value":{"kind":"Variable","name":{"kind":"Name","value":"delta"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminProductRow"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminProductRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"is_commission"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<AdjustProductStockMutation, AdjustProductStockMutationVariables>;
export const CreateProductOptionGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProductOptionGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"product_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOptionGroupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProductOptionGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"product_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"product_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOptionGroupFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOptionGroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductOptionGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"max_length"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}}]}}]}}]} as unknown as DocumentNode<CreateProductOptionGroupMutation, CreateProductOptionGroupMutationVariables>;
export const UpdateProductOptionGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProductOptionGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOptionGroupInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProductOptionGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOptionGroupFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOptionGroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductOptionGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"max_length"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}}]}}]}}]} as unknown as DocumentNode<UpdateProductOptionGroupMutation, UpdateProductOptionGroupMutationVariables>;
export const DeleteProductOptionGroupDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteProductOptionGroup"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProductOptionGroup"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteProductOptionGroupMutation, DeleteProductOptionGroupMutationVariables>;
export const CreateProductOptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProductOption"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"group_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOptionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProductOption"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"group_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"group_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOptionGroupFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOptionGroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductOptionGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"max_length"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}}]}}]}}]} as unknown as DocumentNode<CreateProductOptionMutation, CreateProductOptionMutationVariables>;
export const UpdateProductOptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateProductOption"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminOptionInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateProductOption"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminOptionGroupFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminOptionGroupFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ProductOptionGroup"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"max_length"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"sort_order"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}}]}}]}}]} as unknown as DocumentNode<UpdateProductOptionMutation, UpdateProductOptionMutationVariables>;
export const DeleteProductOptionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteProductOption"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteProductOption"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteProductOptionMutation, DeleteProductOptionMutationVariables>;
export const AdminReviewsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminReviews"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminReviewsFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminReviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminReviewRow"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminReviewRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminReview"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"is_hidden"}},{"kind":"Field","name":{"kind":"Name","value":"subject_kind"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"review"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"subject_name"}},{"kind":"Field","name":{"kind":"Name","value":"subject_href"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<AdminReviewsQuery, AdminReviewsQueryVariables>;
export const SetReviewHiddenDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetReviewHidden"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"is_hidden"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setReviewHidden"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"is_hidden"},"value":{"kind":"Variable","name":{"kind":"Name","value":"is_hidden"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminReviewRow"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminReviewRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminReview"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"is_hidden"}},{"kind":"Field","name":{"kind":"Name","value":"subject_kind"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"review"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"subject_name"}},{"kind":"Field","name":{"kind":"Name","value":"subject_href"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]}}]}}]} as unknown as DocumentNode<SetReviewHiddenMutation, SetReviewHiddenMutationVariables>;
export const DeleteReviewAsAdminDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteReviewAsAdmin"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteReviewAsAdmin"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteReviewAsAdminMutation, DeleteReviewAsAdminMutationVariables>;
export const ImageSpecsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ImageSpecs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"imageSpecs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"purpose"}},{"kind":"Field","name":{"kind":"Name","value":"ratio"}},{"kind":"Field","name":{"kind":"Name","value":"ratio_label"}},{"kind":"Field","name":{"kind":"Name","value":"min_width"}},{"kind":"Field","name":{"kind":"Name","value":"min_height"}},{"kind":"Field","name":{"kind":"Name","value":"max_bytes"}},{"kind":"Field","name":{"kind":"Name","value":"content_types"}},{"kind":"Field","name":{"kind":"Name","value":"renders_at"}}]}}]}}]} as unknown as DocumentNode<ImageSpecsQuery, ImageSpecsQueryVariables>;
export const CreateAdminUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateAdminUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"purpose"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UploadPurpose"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content_type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createAdminUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"purpose"},"value":{"kind":"Variable","name":{"kind":"Name","value":"purpose"}}},{"kind":"Argument","name":{"kind":"Name","value":"content_type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content_type"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"upload_url"}},{"kind":"Field","name":{"kind":"Name","value":"public_url"}}]}}]}}]} as unknown as DocumentNode<CreateAdminUploadMutation, CreateAdminUploadMutationVariables>;
export const ConfirmUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ConfirmUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"key"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"purpose"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UploadPurpose"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"confirmUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"key"},"value":{"kind":"Variable","name":{"kind":"Name","value":"key"}}},{"kind":"Argument","name":{"kind":"Name","value":"purpose"},"value":{"kind":"Variable","name":{"kind":"Name","value":"purpose"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"key"}},{"kind":"Field","name":{"kind":"Name","value":"public_url"}},{"kind":"Field","name":{"kind":"Name","value":"width"}},{"kind":"Field","name":{"kind":"Name","value":"height"}},{"kind":"Field","name":{"kind":"Name","value":"bytes"}}]}}]}}]} as unknown as DocumentNode<ConfirmUploadMutation, ConfirmUploadMutationVariables>;
export const AdminUsersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminUsers"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUsersFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUsers"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"orders_count"}},{"kind":"Field","name":{"kind":"Name","value":"registrations_count"}},{"kind":"Field","name":{"kind":"Name","value":"bookings_count"}},{"kind":"Field","name":{"kind":"Name","value":"reviews_count"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<AdminUsersQuery, AdminUsersQueryVariables>;
export const AdminUserDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminUser"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminUser"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"orders_count"}},{"kind":"Field","name":{"kind":"Name","value":"registrations_count"}},{"kind":"Field","name":{"kind":"Name","value":"bookings_count"}},{"kind":"Field","name":{"kind":"Name","value":"reviews_count"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}}]}}]} as unknown as DocumentNode<AdminUserQuery, AdminUserQueryVariables>;
export const SetUserRoleDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetUserRole"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"role"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UserRole"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setUserRole"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"role"},"value":{"kind":"Variable","name":{"kind":"Name","value":"role"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUser"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"role"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"orders_count"}},{"kind":"Field","name":{"kind":"Name","value":"registrations_count"}},{"kind":"Field","name":{"kind":"Name","value":"bookings_count"}},{"kind":"Field","name":{"kind":"Name","value":"reviews_count"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}}]}}]} as unknown as DocumentNode<SetUserRoleMutation, SetUserRoleMutationVariables>;
export const AdminStudioVisitsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminStudioVisits"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminStudioVisitsFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminStudioVisits"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminStudioVisitFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminStudioVisitFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminStudioVisit"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"visit"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<AdminStudioVisitsQuery, AdminStudioVisitsQueryVariables>;
export const CancelStudioVisitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelStudioVisit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelStudioVisit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}}]}}]}}]} as unknown as DocumentNode<CancelStudioVisitMutation, CancelStudioVisitMutationVariables>;
export const AdminWhatsAppMessagesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminWhatsAppMessages"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminWhatsAppFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminWhatsAppMessages"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminWhatsAppMessageFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminWhatsAppMessageFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WhatsAppMessage"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"direction"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"page_url"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"reference"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<AdminWhatsAppMessagesQuery, AdminWhatsAppMessagesQueryVariables>;
export const SendWhatsAppReplyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendWhatsAppReply"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"SendWhatsAppReplyInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendWhatsAppReply"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<SendWhatsAppReplyMutation, SendWhatsAppReplyMutationVariables>;
export const AdminWorkshopConfigsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminWorkshopConfigs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminWorkshopConfigs"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminWorkshopConfigFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminWorkshopConfigFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"opening_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"closing_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"slot_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_per_slot"}},{"kind":"Field","name":{"kind":"Name","value":"booking_window_days"}},{"kind":"Field","name":{"kind":"Name","value":"slot_span_days"}},{"kind":"Field","name":{"kind":"Name","value":"closed_weekdays"}},{"kind":"Field","name":{"kind":"Name","value":"tiers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}}]}}]}}]} as unknown as DocumentNode<AdminWorkshopConfigsQuery, AdminWorkshopConfigsQueryVariables>;
export const AdminWorkshopBlackoutsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminWorkshopBlackouts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"config_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminWorkshopBlackouts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"config_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"config_id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminWorkshopBlackoutFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminWorkshopBlackoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminWorkshopBlackout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"config_id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}}]} as unknown as DocumentNode<AdminWorkshopBlackoutsQuery, AdminWorkshopBlackoutsQueryVariables>;
export const AdminWorkshopBookingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"AdminWorkshopBookings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminWorkshopBookingsFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"adminWorkshopBookings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminWorkshopBookingRow"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminPageInfoFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminWorkshopBookingRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminWorkshopBooking"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"next_statuses"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"booking"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"participants"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"config"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminPageInfoFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"PageInfo"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]} as unknown as DocumentNode<AdminWorkshopBookingsQuery, AdminWorkshopBookingsQueryVariables>;
export const UpdateWorkshopConfigDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWorkshopConfig"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminWorkshopConfigInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWorkshopConfig"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminWorkshopConfigFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminWorkshopConfigFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"opening_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"closing_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"slot_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_per_slot"}},{"kind":"Field","name":{"kind":"Name","value":"booking_window_days"}},{"kind":"Field","name":{"kind":"Name","value":"slot_span_days"}},{"kind":"Field","name":{"kind":"Name","value":"closed_weekdays"}},{"kind":"Field","name":{"kind":"Name","value":"tiers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}}]}}]}}]} as unknown as DocumentNode<UpdateWorkshopConfigMutation, UpdateWorkshopConfigMutationVariables>;
export const SaveWorkshopTierDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SaveWorkshopTier"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"config_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminWorkshopTierInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"saveWorkshopTier"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"config_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"config_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminWorkshopConfigFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminWorkshopConfigFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"opening_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"closing_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"slot_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_per_slot"}},{"kind":"Field","name":{"kind":"Name","value":"booking_window_days"}},{"kind":"Field","name":{"kind":"Name","value":"slot_span_days"}},{"kind":"Field","name":{"kind":"Name","value":"closed_weekdays"}},{"kind":"Field","name":{"kind":"Name","value":"tiers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}}]}}]}}]} as unknown as DocumentNode<SaveWorkshopTierMutation, SaveWorkshopTierMutationVariables>;
export const DeleteWorkshopTierDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteWorkshopTier"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteWorkshopTier"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteWorkshopTierMutation, DeleteWorkshopTierMutationVariables>;
export const CreateWorkshopBlackoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateWorkshopBlackout"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"config_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminWorkshopBlackoutInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createWorkshopBlackout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"config_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"config_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminWorkshopBlackoutFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminWorkshopBlackoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminWorkshopBlackout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"config_id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}}]} as unknown as DocumentNode<CreateWorkshopBlackoutMutation, CreateWorkshopBlackoutMutationVariables>;
export const UpdateWorkshopBlackoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateWorkshopBlackout"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AdminWorkshopBlackoutInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateWorkshopBlackout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminWorkshopBlackoutFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminWorkshopBlackoutFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminWorkshopBlackout"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"config_id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}}]} as unknown as DocumentNode<UpdateWorkshopBlackoutMutation, UpdateWorkshopBlackoutMutationVariables>;
export const DeleteWorkshopBlackoutDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteWorkshopBlackout"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteWorkshopBlackout"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteWorkshopBlackoutMutation, DeleteWorkshopBlackoutMutationVariables>;
export const SetWorkshopBookingStatusDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SetWorkshopBookingStatus"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"status"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegistrationStatus"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"setWorkshopBookingStatus"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"status"},"value":{"kind":"Variable","name":{"kind":"Name","value":"status"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminWorkshopBookingRow"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminUserRefFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminUserRef"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"AdminWorkshopBookingRow"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"AdminWorkshopBooking"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"next_statuses"}},{"kind":"Field","name":{"kind":"Name","value":"customer"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"AdminUserRefFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"booking"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"participants"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"config"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]}}]} as unknown as DocumentNode<SetWorkshopBookingStatusMutation, SetWorkshopBookingStatusMutationVariables>;
export const ArchiveWallDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ArchiveWall"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ArchivePiece"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ArchivePiece"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<ArchiveWallQuery, ArchiveWallQueryVariables>;
export const CartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Cart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Cart"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"free_shipping_above"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"unavailable_reason"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductCard"}}]}}]}}]}}]} as unknown as DocumentNode<CartQuery, CartQueryVariables>;
export const CartCountDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CartCount"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cartCount"}}]}}]} as unknown as DocumentNode<CartCountQuery, CartCountQueryVariables>;
export const AddToCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"AddToCart"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"AddToCartInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"addToCart"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Cart"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"free_shipping_above"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"unavailable_reason"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductCard"}}]}}]}}]}}]} as unknown as DocumentNode<AddToCartMutation, AddToCartMutationVariables>;
export const UpdateCartItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateCartItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateCartItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"quantity"},"value":{"kind":"Variable","name":{"kind":"Name","value":"quantity"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Cart"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"free_shipping_above"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"unavailable_reason"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductCard"}}]}}]}}]}}]} as unknown as DocumentNode<UpdateCartItemMutation, UpdateCartItemMutationVariables>;
export const RemoveCartItemDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RemoveCartItem"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"removeCartItem"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Cart"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"free_shipping_above"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"unavailable_reason"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductCard"}}]}}]}}]}}]} as unknown as DocumentNode<RemoveCartItemMutation, RemoveCartItemMutationVariables>;
export const ClearCartDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ClearCart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"clearCart"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"CartFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"CartFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Cart"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"free_shipping_above"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"unavailable_reason"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductCard"}}]}}]}}]}}]} as unknown as DocumentNode<ClearCartMutation, ClearCartMutationVariables>;
export const CommissionOptionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CommissionOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commissionOptions"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"piece_types"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"sizes"}}]}},{"kind":"Field","name":{"kind":"Name","value":"glazes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}}]}}]}}]}}]} as unknown as DocumentNode<CommissionOptionsQuery, CommissionOptionsQueryVariables>;
export const CommissionPiecesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CommissionPieces"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"commissionPieces"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductCard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}}]}}]} as unknown as DocumentNode<CommissionPiecesQuery, CommissionPiecesQueryVariables>;
export const CreateCommissionRequestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCommissionRequest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CommissionRequestInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCommissionRequest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"piece_type"}},{"kind":"Field","name":{"kind":"Name","value":"size"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<CreateCommissionRequestMutation, CreateCommissionRequestMutationVariables>;
export const ContentPageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ContentPage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contentPage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"subtitle"}},{"kind":"Field","name":{"kind":"Name","value":"hero_image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_published"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}},{"kind":"Field","name":{"kind":"Name","value":"sections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"heading"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"body"}}]}}]}}]}}]}}]} as unknown as DocumentNode<ContentPageQuery, ContentPageQueryVariables>;
export const SendContactMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SendContactMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ContactMessageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sendContactMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<SendContactMessageMutation, SendContactMessageMutationVariables>;
export const SubscribeToNewsletterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"SubscribeToNewsletter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subscribeToNewsletter"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"was_already_subscribed"}}]}}]}}]} as unknown as DocumentNode<SubscribeToNewsletterMutation, SubscribeToNewsletterMutationVariables>;
export const UnsubscribeFromNewsletterDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UnsubscribeFromNewsletter"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"unsubscribeFromNewsletter"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}]}]}}]} as unknown as DocumentNode<UnsubscribeFromNewsletterMutation, UnsubscribeFromNewsletterMutationVariables>;
export const EventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Events"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"EventsFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"events"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}}]} as unknown as DocumentNode<EventsQuery, EventsQueryVariables>;
export const EventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Event"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventCard"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"gallery"}},{"kind":"Field","name":{"kind":"Name","value":"includes"}},{"kind":"Field","name":{"kind":"Name","value":"highlights"}},{"kind":"Field","name":{"kind":"Name","value":"performers"}},{"kind":"Field","name":{"kind":"Name","value":"my_registration"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RegistrationFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RegistrationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Registration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seats"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"rejected_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventCard"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<EventQuery, EventQueryVariables>;
export const UpcomingEventsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"UpcomingEvents"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upcomingEvents"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventCard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}}]} as unknown as DocumentNode<UpcomingEventsQuery, UpcomingEventsQueryVariables>;
export const RegisterForEventDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RegisterForEvent"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RegisterForEventInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registerForEvent"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RegistrationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RegistrationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Registration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seats"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"rejected_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventCard"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<RegisterForEventMutation, RegisterForEventMutationVariables>;
export const MyRegistrationsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyRegistrations"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myRegistrations"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RegistrationFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RegistrationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Registration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seats"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"rejected_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventCard"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<MyRegistrationsQuery, MyRegistrationsQueryVariables>;
export const RegistrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Registration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"registration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RegistrationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RegistrationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Registration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seats"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"rejected_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventCard"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<RegistrationQuery, RegistrationQueryVariables>;
export const CancelRegistrationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelRegistration"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelRegistration"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"RegistrationFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"EventCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Event"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"event_type"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"level"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"total_seats"}},{"kind":"Field","name":{"kind":"Name","value":"available_seats"}},{"kind":"Field","name":{"kind":"Name","value":"instructor"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"is_past"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"RegistrationFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Registration"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"seats"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"rejected_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"event"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"EventCard"}},{"kind":"Field","name":{"kind":"Name","value":"address"}}]}}]}}]} as unknown as DocumentNode<CancelRegistrationMutation, CancelRegistrationMutationVariables>;
export const NotifyWhenBackInStockDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"NotifyWhenBackInStock"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"email"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"notifyWhenBackInStock"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"product_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}},{"kind":"Argument","name":{"kind":"Name","value":"email"},"value":{"kind":"Variable","name":{"kind":"Name","value":"email"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"email"}},{"kind":"Field","name":{"kind":"Name","value":"was_already_waiting"}}]}}]}}]} as unknown as DocumentNode<NotifyWhenBackInStockMutation, NotifyWhenBackInStockMutationVariables>;
export const StopBatchNotificationDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"StopBatchNotification"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"token"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"stopBatchNotification"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"token"},"value":{"kind":"Variable","name":{"kind":"Name","value":"token"}}}]}]}}]} as unknown as DocumentNode<StopBatchNotificationMutation, StopBatchNotificationMutationVariables>;
export const CheckoutQuoteDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"CheckoutQuote"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CheckoutQuoteInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"checkoutQuote"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_code"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_message"}},{"kind":"Field","name":{"kind":"Name","value":"problems"}}]}}]}}]} as unknown as DocumentNode<CheckoutQuoteQuery, CheckoutQuoteQueryVariables>;
export const PlaceOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"PlaceOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"PlaceOrderInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"placeOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_code"}},{"kind":"Field","name":{"kind":"Name","value":"customer_note"}},{"kind":"Field","name":{"kind":"Name","value":"gift_note"}},{"kind":"Field","name":{"kind":"Name","value":"hide_prices"}},{"kind":"Field","name":{"kind":"Name","value":"tracking_note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"paid_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipped_at"}},{"kind":"Field","name":{"kind":"Name","value":"delivered_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"product_name"}},{"kind":"Field","name":{"kind":"Name","value":"product_image"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"studio_notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<PlaceOrderMutation, PlaceOrderMutationVariables>;
export const OrdersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Orders"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"orders"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_code"}},{"kind":"Field","name":{"kind":"Name","value":"customer_note"}},{"kind":"Field","name":{"kind":"Name","value":"gift_note"}},{"kind":"Field","name":{"kind":"Name","value":"hide_prices"}},{"kind":"Field","name":{"kind":"Name","value":"tracking_note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"paid_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipped_at"}},{"kind":"Field","name":{"kind":"Name","value":"delivered_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"product_name"}},{"kind":"Field","name":{"kind":"Name","value":"product_image"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"studio_notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<OrdersQuery, OrdersQueryVariables>;
export const OrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Order"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"order"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_code"}},{"kind":"Field","name":{"kind":"Name","value":"customer_note"}},{"kind":"Field","name":{"kind":"Name","value":"gift_note"}},{"kind":"Field","name":{"kind":"Name","value":"hide_prices"}},{"kind":"Field","name":{"kind":"Name","value":"tracking_note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"paid_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipped_at"}},{"kind":"Field","name":{"kind":"Name","value":"delivered_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"product_name"}},{"kind":"Field","name":{"kind":"Name","value":"product_image"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"studio_notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<OrderQuery, OrderQueryVariables>;
export const CancelOrderDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelOrder"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelOrder"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"OrderFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"OrderFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Order"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_fee"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"coupon_code"}},{"kind":"Field","name":{"kind":"Name","value":"customer_note"}},{"kind":"Field","name":{"kind":"Name","value":"gift_note"}},{"kind":"Field","name":{"kind":"Name","value":"hide_prices"}},{"kind":"Field","name":{"kind":"Name","value":"tracking_note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"item_count"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"paid_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipped_at"}},{"kind":"Field","name":{"kind":"Name","value":"delivered_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"refunded_at"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_address"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"phone"}},{"kind":"Field","name":{"kind":"Name","value":"line1"}},{"kind":"Field","name":{"kind":"Name","value":"line2"}},{"kind":"Field","name":{"kind":"Name","value":"landmark"}},{"kind":"Field","name":{"kind":"Name","value":"city"}},{"kind":"Field","name":{"kind":"Name","value":"state"}},{"kind":"Field","name":{"kind":"Name","value":"pincode"}}]}},{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"product_name"}},{"kind":"Field","name":{"kind":"Name","value":"product_image"}},{"kind":"Field","name":{"kind":"Name","value":"unit_price"}},{"kind":"Field","name":{"kind":"Name","value":"quantity"}},{"kind":"Field","name":{"kind":"Name","value":"line_total"}},{"kind":"Field","name":{"kind":"Name","value":"selections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"group_id"}},{"kind":"Field","name":{"kind":"Name","value":"group_name"}},{"kind":"Field","name":{"kind":"Name","value":"option_id"}},{"kind":"Field","name":{"kind":"Name","value":"option_name"}},{"kind":"Field","name":{"kind":"Name","value":"text"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}},{"kind":"Field","name":{"kind":"Name","value":"reference_image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"product"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"studio_notes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}}]}}]}}]} as unknown as DocumentNode<CancelOrderMutation, CancelOrderMutationVariables>;
export const ProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Products"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"ProductsFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}},{"kind":"Field","name":{"kind":"Name","value":"facets"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"collections"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"materials"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"glazes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"value"}},{"kind":"Field","name":{"kind":"Name","value":"label"}},{"kind":"Field","name":{"kind":"Name","value":"count"}}]}},{"kind":"Field","name":{"kind":"Name","value":"price_min"}},{"kind":"Field","name":{"kind":"Name","value":"price_max"}},{"kind":"Field","name":{"kind":"Name","value":"active_count"}},{"kind":"Field","name":{"kind":"Name","value":"archive_count"}},{"kind":"Field","name":{"kind":"Name","value":"seconds_count"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}}]}}]} as unknown as DocumentNode<ProductsQuery, ProductsQueryVariables>;
export const ProductDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Product"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductCard"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"flaw_note"}},{"kind":"Field","name":{"kind":"Name","value":"dimensions"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_ml"}},{"kind":"Field","name":{"kind":"Name","value":"height_cm"}},{"kind":"Field","name":{"kind":"Name","value":"diameter_cm"}},{"kind":"Field","name":{"kind":"Name","value":"weight_g"}},{"kind":"Field","name":{"kind":"Name","value":"maker_note"}},{"kind":"Field","name":{"kind":"Name","value":"care_notes"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"variation_note"}}]}},{"kind":"Field","name":{"kind":"Name","value":"sales_count"}},{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"option_groups"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"kind"}},{"kind":"Field","name":{"kind":"Name","value":"is_required"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}},{"kind":"Field","name":{"kind":"Name","value":"max_length"}},{"kind":"Field","name":{"kind":"Name","value":"options"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price_modifier"}}]}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}}]}}]} as unknown as DocumentNode<ProductQuery, ProductQueryVariables>;
export const RelatedProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RelatedProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"relatedProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductCard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}}]}}]} as unknown as DocumentNode<RelatedProductsQuery, RelatedProductsQueryVariables>;
export const FeaturedProductsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"FeaturedProducts"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"featuredProducts"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductCard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}}]}}]} as unknown as DocumentNode<FeaturedProductsQuery, FeaturedProductsQueryVariables>;
export const CategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"icon"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"product_count"}}]}}]}}]} as unknown as DocumentNode<CategoriesQuery, CategoriesQueryVariables>;
export const CollectionsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Collections"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"archive"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collections"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"archive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"archive"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"product_count"}}]}}]}}]} as unknown as DocumentNode<CollectionsQuery, CollectionsQueryVariables>;
export const CollectionDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Collection"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"archive"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Boolean"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"collection"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}},{"kind":"Argument","name":{"kind":"Name","value":"archive"},"value":{"kind":"Variable","name":{"kind":"Name","value":"archive"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"product_count"}}]}}]}}]} as unknown as DocumentNode<CollectionQuery, CollectionQueryVariables>;
export const GlazesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Glazes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"glazes"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"variation_note"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}}]} as unknown as DocumentNode<GlazesQuery, GlazesQueryVariables>;
export const GlazeDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Glaze"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"glaze"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"variation_note"}},{"kind":"Field","name":{"kind":"Name","value":"pieces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductCard"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}}]}}]} as unknown as DocumentNode<GlazeQuery, GlazeQueryVariables>;
export const CreateProductReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateProductReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"product_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createProductReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"product_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"product_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Review"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_mine"}},{"kind":"Field","name":{"kind":"Name","value":"subject_name"}},{"kind":"Field","name":{"kind":"Name","value":"subject_href"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]}}]} as unknown as DocumentNode<CreateProductReviewMutation, CreateProductReviewMutationVariables>;
export const CreateEventReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateEventReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"event_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createEventReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"event_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"event_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Review"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_mine"}},{"kind":"Field","name":{"kind":"Name","value":"subject_name"}},{"kind":"Field","name":{"kind":"Name","value":"subject_href"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]}}]} as unknown as DocumentNode<CreateEventReviewMutation, CreateEventReviewMutationVariables>;
export const UpdateReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Review"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_mine"}},{"kind":"Field","name":{"kind":"Name","value":"subject_name"}},{"kind":"Field","name":{"kind":"Name","value":"subject_href"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]}}]} as unknown as DocumentNode<UpdateReviewMutation, UpdateReviewMutationVariables>;
export const DeleteReviewDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteReview"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteReview"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteReviewMutation, DeleteReviewMutationVariables>;
export const CreateReviewImageUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateReviewImageUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewUploadInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createReviewImageUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upload_url"}},{"kind":"Field","name":{"kind":"Name","value":"public_url"}},{"kind":"Field","name":{"kind":"Name","value":"key"}}]}}]}}]} as unknown as DocumentNode<CreateReviewImageUploadMutation, CreateReviewImageUploadMutationVariables>;
export const ProductReviewsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductReviews"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"product_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"productReviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"product_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"product_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}},{"kind":"Field","name":{"kind":"Name","value":"summary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewSummaryFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Review"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_mine"}},{"kind":"Field","name":{"kind":"Name","value":"subject_name"}},{"kind":"Field","name":{"kind":"Name","value":"subject_href"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RatingSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"average"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"distribution"}}]}}]} as unknown as DocumentNode<ProductReviewsQuery, ProductReviewsQueryVariables>;
export const EventReviewsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EventReviews"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"event_id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"eventReviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"event_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"event_id"}}},{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}},{"kind":"Field","name":{"kind":"Name","value":"summary"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewSummaryFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Review"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_mine"}},{"kind":"Field","name":{"kind":"Name","value":"subject_name"}},{"kind":"Field","name":{"kind":"Name","value":"subject_href"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewSummaryFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"RatingSummary"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"average"}},{"kind":"Field","name":{"kind":"Name","value":"count"}},{"kind":"Field","name":{"kind":"Name","value":"distribution"}}]}}]} as unknown as DocumentNode<EventReviewsQuery, EventReviewsQueryVariables>;
export const ProductReviewEligibilityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"ProductReviewEligibility"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"review_eligibility"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewEligibilityFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Review"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_mine"}},{"kind":"Field","name":{"kind":"Name","value":"subject_name"}},{"kind":"Field","name":{"kind":"Name","value":"subject_href"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewEligibilityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewEligibility"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"can_review"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"my_review"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewFields"}}]}}]}}]} as unknown as DocumentNode<ProductReviewEligibilityQuery, ProductReviewEligibilityQueryVariables>;
export const EventReviewEligibilityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"EventReviewEligibility"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"event"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"review_eligibility"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewEligibilityFields"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Review"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_mine"}},{"kind":"Field","name":{"kind":"Name","value":"subject_name"}},{"kind":"Field","name":{"kind":"Name","value":"subject_href"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewEligibilityFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"ReviewEligibility"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"can_review"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"my_review"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewFields"}}]}}]}}]} as unknown as DocumentNode<EventReviewEligibilityQuery, EventReviewEligibilityQueryVariables>;
export const RecentReviewsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"RecentReviews"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recentReviews"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ReviewFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ReviewFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Review"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"rating"}},{"kind":"Field","name":{"kind":"Name","value":"body"}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_mine"}},{"kind":"Field","name":{"kind":"Name","value":"subject_name"}},{"kind":"Field","name":{"kind":"Name","value":"subject_href"}},{"kind":"Field","name":{"kind":"Name","value":"author"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}}]}}]}}]} as unknown as DocumentNode<RecentReviewsQuery, RecentReviewsQueryVariables>;
export const SiteSettingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"SiteSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"siteSettings"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"contact_phone"}},{"kind":"Field","name":{"kind":"Name","value":"whatsapp_number"}},{"kind":"Field","name":{"kind":"Name","value":"contact_email"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"opening_hours"}},{"kind":"Field","name":{"kind":"Name","value":"instagram_url"}},{"kind":"Field","name":{"kind":"Name","value":"facebook_url"}},{"kind":"Field","name":{"kind":"Name","value":"youtube_url"}},{"kind":"Field","name":{"kind":"Name","value":"shipping_flat_fee"}},{"kind":"Field","name":{"kind":"Name","value":"free_shipping_above"}},{"kind":"Field","name":{"kind":"Name","value":"dispatch_days_min"}},{"kind":"Field","name":{"kind":"Name","value":"dispatch_days_max"}},{"kind":"Field","name":{"kind":"Name","value":"announcement_text"}},{"kind":"Field","name":{"kind":"Name","value":"announcement_href"}},{"kind":"Field","name":{"kind":"Name","value":"hero_heading"}},{"kind":"Field","name":{"kind":"Name","value":"hero_subheading"}},{"kind":"Field","name":{"kind":"Name","value":"hero_image_url"}},{"kind":"Field","name":{"kind":"Name","value":"hero_cta_text"}},{"kind":"Field","name":{"kind":"Name","value":"hero_cta_href"}}]}}]}}]} as unknown as DocumentNode<SiteSettingsQuery, SiteSettingsQueryVariables>;
export const SitemapDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Sitemap"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"sitemap"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"products"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"workshops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]}}]} as unknown as DocumentNode<SitemapQuery, SitemapQueryVariables>;
export const SuggestDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Suggest"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"q"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"suggest"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"q"},"value":{"kind":"Variable","name":{"kind":"Name","value":"q"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"pieces"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}}]}},{"kind":"Field","name":{"kind":"Name","value":"events"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"workshops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]}}]} as unknown as DocumentNode<SuggestQuery, SuggestQueryVariables>;
export const CreateCustomizationUploadDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateCustomizationUpload"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content_type"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"size"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createCustomizationUpload"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"content_type"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content_type"}}},{"kind":"Argument","name":{"kind":"Name","value":"size"},"value":{"kind":"Variable","name":{"kind":"Name","value":"size"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"upload_url"}},{"kind":"Field","name":{"kind":"Name","value":"public_url"}},{"kind":"Field","name":{"kind":"Name","value":"key"}}]}}]}}]} as unknown as DocumentNode<CreateCustomizationUploadMutation, CreateCustomizationUploadMutationVariables>;
export const StudioVisitAvailabilityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"StudioVisitAvailability"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"from"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"days"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"studioVisitAvailability"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"from"},"value":{"kind":"Variable","name":{"kind":"Name","value":"from"}}},{"kind":"Argument","name":{"kind":"Name","value":"days"},"value":{"kind":"Variable","name":{"kind":"Name","value":"days"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"weekday"}},{"kind":"Field","name":{"kind":"Name","value":"is_closed"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"windows"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}}]}}]}}]} as unknown as DocumentNode<StudioVisitAvailabilityQuery, StudioVisitAvailabilityQueryVariables>;
export const BookStudioVisitDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BookStudioVisit"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"StudioVisitInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bookStudioVisit"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}}]}}]} as unknown as DocumentNode<BookStudioVisitMutation, BookStudioVisitMutationVariables>;
export const RecordWhatsAppMessageDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RecordWhatsAppMessage"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RecordWhatsAppMessageInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"recordWhatsAppMessage"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}]}]}}]} as unknown as DocumentNode<RecordWhatsAppMessageMutation, RecordWhatsAppMessageMutationVariables>;
export const WishlistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Wishlist"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wishlist"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"ProductCard"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"GlazeCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Glaze"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"swatch_url"}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"ProductCard"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"Product"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"price"}},{"kind":"Field","name":{"kind":"Name","value":"compare_at_price"}},{"kind":"Field","name":{"kind":"Name","value":"material"}},{"kind":"Field","name":{"kind":"Name","value":"color_name"}},{"kind":"Field","name":{"kind":"Name","value":"color_code"}},{"kind":"Field","name":{"kind":"Name","value":"glaze"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"GlazeCard"}}]}},{"kind":"Field","name":{"kind":"Name","value":"image_urls"}},{"kind":"Field","name":{"kind":"Name","value":"stock"}},{"kind":"Field","name":{"kind":"Name","value":"is_active"}},{"kind":"Field","name":{"kind":"Name","value":"is_archived"}},{"kind":"Field","name":{"kind":"Name","value":"is_featured"}},{"kind":"Field","name":{"kind":"Name","value":"is_customizable"}},{"kind":"Field","name":{"kind":"Name","value":"is_second"}},{"kind":"Field","name":{"kind":"Name","value":"rating_avg"}},{"kind":"Field","name":{"kind":"Name","value":"rating_count"}},{"kind":"Field","name":{"kind":"Name","value":"collection"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}}]}}]} as unknown as DocumentNode<WishlistQuery, WishlistQueryVariables>;
export const WishlistIdsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WishlistIds"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"wishlistIds"}}]}}]} as unknown as DocumentNode<WishlistIdsQuery, WishlistIdsQueryVariables>;
export const ToggleWishlistDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"ToggleWishlist"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"productId"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"toggleWishlist"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"product_id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"productId"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"product_id"}},{"kind":"Field","name":{"kind":"Name","value":"is_wishlisted"}},{"kind":"Field","name":{"kind":"Name","value":"wishlist_count"}}]}}]}}]} as unknown as DocumentNode<ToggleWishlistMutation, ToggleWishlistMutationVariables>;
export const WorkshopsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Workshops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workshops"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkshopConfigFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkshopConfigFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"opening_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"closing_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"slot_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_per_slot"}},{"kind":"Field","name":{"kind":"Name","value":"booking_window_days"}},{"kind":"Field","name":{"kind":"Name","value":"slot_span_days"}},{"kind":"Field","name":{"kind":"Name","value":"closed_weekdays"}},{"kind":"Field","name":{"kind":"Name","value":"tiers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}}]}}]}}]} as unknown as DocumentNode<WorkshopsQuery, WorkshopsQueryVariables>;
export const WorkshopDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Workshop"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"slug"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workshop"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"slug"},"value":{"kind":"Variable","name":{"kind":"Name","value":"slug"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkshopConfigFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkshopConfigFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"opening_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"closing_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"slot_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_per_slot"}},{"kind":"Field","name":{"kind":"Name","value":"booking_window_days"}},{"kind":"Field","name":{"kind":"Name","value":"slot_span_days"}},{"kind":"Field","name":{"kind":"Name","value":"closed_weekdays"}},{"kind":"Field","name":{"kind":"Name","value":"tiers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}}]}}]}}]} as unknown as DocumentNode<WorkshopQuery, WorkshopQueryVariables>;
export const WorkshopAvailabilityDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkshopAvailability"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopAvailabilityInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workshopAvailability"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"date"}},{"kind":"Field","name":{"kind":"Name","value":"weekday"}},{"kind":"Field","name":{"kind":"Name","value":"is_closed"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}},{"kind":"Field","name":{"kind":"Name","value":"slots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"remaining"}},{"kind":"Field","name":{"kind":"Name","value":"is_available"}},{"kind":"Field","name":{"kind":"Name","value":"reason"}}]}}]}}]}}]} as unknown as DocumentNode<WorkshopAvailabilityQuery, WorkshopAvailabilityQueryVariables>;
export const BookWorkshopDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"BookWorkshop"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"BookWorkshopInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"bookWorkshop"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkshopBookingFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkshopConfigFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"opening_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"closing_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"slot_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_per_slot"}},{"kind":"Field","name":{"kind":"Name","value":"booking_window_days"}},{"kind":"Field","name":{"kind":"Name","value":"slot_span_days"}},{"kind":"Field","name":{"kind":"Name","value":"closed_weekdays"}},{"kind":"Field","name":{"kind":"Name","value":"tiers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkshopBookingFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopBooking"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"slots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"participants"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"can_reschedule"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"rejected_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"config"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkshopConfigFields"}}]}}]}}]} as unknown as DocumentNode<BookWorkshopMutation, BookWorkshopMutationVariables>;
export const RescheduleWorkshopBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"RescheduleWorkshopBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"RescheduleWorkshopInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"rescheduleWorkshopBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkshopBookingFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkshopConfigFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"opening_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"closing_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"slot_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_per_slot"}},{"kind":"Field","name":{"kind":"Name","value":"booking_window_days"}},{"kind":"Field","name":{"kind":"Name","value":"slot_span_days"}},{"kind":"Field","name":{"kind":"Name","value":"closed_weekdays"}},{"kind":"Field","name":{"kind":"Name","value":"tiers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkshopBookingFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopBooking"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"slots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"participants"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"can_reschedule"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"rejected_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"config"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkshopConfigFields"}}]}}]}}]} as unknown as DocumentNode<RescheduleWorkshopBookingMutation, RescheduleWorkshopBookingMutationVariables>;
export const MyWorkshopBookingsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"MyWorkshopBookings"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"page"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"limit"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"myWorkshopBookings"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"page"},"value":{"kind":"Variable","name":{"kind":"Name","value":"page"}}},{"kind":"Argument","name":{"kind":"Name","value":"limit"},"value":{"kind":"Variable","name":{"kind":"Name","value":"limit"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"items"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkshopBookingFields"}}]}},{"kind":"Field","name":{"kind":"Name","value":"page_info"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"page"}},{"kind":"Field","name":{"kind":"Name","value":"limit"}},{"kind":"Field","name":{"kind":"Name","value":"has_more"}}]}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkshopConfigFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"opening_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"closing_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"slot_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_per_slot"}},{"kind":"Field","name":{"kind":"Name","value":"booking_window_days"}},{"kind":"Field","name":{"kind":"Name","value":"slot_span_days"}},{"kind":"Field","name":{"kind":"Name","value":"closed_weekdays"}},{"kind":"Field","name":{"kind":"Name","value":"tiers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkshopBookingFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopBooking"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"slots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"participants"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"can_reschedule"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"rejected_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"config"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkshopConfigFields"}}]}}]}}]} as unknown as DocumentNode<MyWorkshopBookingsQuery, MyWorkshopBookingsQueryVariables>;
export const WorkshopBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"WorkshopBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"workshopBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkshopBookingFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkshopConfigFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"opening_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"closing_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"slot_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_per_slot"}},{"kind":"Field","name":{"kind":"Name","value":"booking_window_days"}},{"kind":"Field","name":{"kind":"Name","value":"slot_span_days"}},{"kind":"Field","name":{"kind":"Name","value":"closed_weekdays"}},{"kind":"Field","name":{"kind":"Name","value":"tiers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkshopBookingFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopBooking"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"slots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"participants"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"can_reschedule"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"rejected_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"config"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkshopConfigFields"}}]}}]}}]} as unknown as DocumentNode<WorkshopBookingQuery, WorkshopBookingQueryVariables>;
export const CancelWorkshopBookingDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CancelWorkshopBooking"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"reason"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"cancelWorkshopBooking"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"reason"},"value":{"kind":"Variable","name":{"kind":"Name","value":"reason"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkshopBookingFields"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkshopConfigFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopConfig"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"image_url"}},{"kind":"Field","name":{"kind":"Name","value":"timezone"}},{"kind":"Field","name":{"kind":"Name","value":"opening_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"closing_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"slot_minutes"}},{"kind":"Field","name":{"kind":"Name","value":"capacity_per_slot"}},{"kind":"Field","name":{"kind":"Name","value":"booking_window_days"}},{"kind":"Field","name":{"kind":"Name","value":"slot_span_days"}},{"kind":"Field","name":{"kind":"Name","value":"closed_weekdays"}},{"kind":"Field","name":{"kind":"Name","value":"tiers"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}}]}}]}},{"kind":"FragmentDefinition","name":{"kind":"Name","value":"WorkshopBookingFields"},"typeCondition":{"kind":"NamedType","name":{"kind":"Name","value":"WorkshopBooking"}},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}},{"kind":"Field","name":{"kind":"Name","value":"slots"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"starts_at"}},{"kind":"Field","name":{"kind":"Name","value":"ends_at"}}]}},{"kind":"Field","name":{"kind":"Name","value":"hours"}},{"kind":"Field","name":{"kind":"Name","value":"participants"}},{"kind":"Field","name":{"kind":"Name","value":"price_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"pieces_per_person"}},{"kind":"Field","name":{"kind":"Name","value":"subtotal"}},{"kind":"Field","name":{"kind":"Name","value":"discount"}},{"kind":"Field","name":{"kind":"Name","value":"total"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"note"}},{"kind":"Field","name":{"kind":"Name","value":"cancel_reason"}},{"kind":"Field","name":{"kind":"Name","value":"can_cancel"}},{"kind":"Field","name":{"kind":"Name","value":"can_reschedule"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"approved_at"}},{"kind":"Field","name":{"kind":"Name","value":"confirmed_at"}},{"kind":"Field","name":{"kind":"Name","value":"rejected_at"}},{"kind":"Field","name":{"kind":"Name","value":"cancelled_at"}},{"kind":"Field","name":{"kind":"Name","value":"config"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"FragmentSpread","name":{"kind":"Name","value":"WorkshopConfigFields"}}]}}]}}]} as unknown as DocumentNode<CancelWorkshopBookingMutation, CancelWorkshopBookingMutationVariables>;