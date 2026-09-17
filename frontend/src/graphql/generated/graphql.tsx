/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { gql } from '@apollo/client';
import type * as ApolloReactCommon from '@apollo/client/react';
import * as ApolloReactHooks from '@apollo/client/react';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
const defaultOptions = {} as const;
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
  piece_types: Array<Scalars['String']['output']>;
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
  registerForEvent: Registration;
  removeCartItem: Cart;
  reorderProductImages: Product;
  rescheduleWorkshopBooking: WorkshopBooking;
  saveContentPage: ContentPage;
  saveWorkshopTier: WorkshopConfig;
  sendContactMessage: Scalars['Boolean']['output'];
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


export type CommissionOptionsQuery = { commissionOptions: { piece_types: Array<string>, sizes: Array<string>, glazes: Array<{ slug: string, name: string, color_code: string | null }> } };

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

export const AddressFieldsFragmentDoc = gql`
    fragment AddressFields on Address {
  id
  name
  phone
  line1
  line2
  landmark
  city
  state
  pincode
  is_default
}
    `;
export const ArchivePieceFragmentDoc = gql`
    fragment ArchivePiece on Product {
  id
  slug
  name
  image_urls
  material
  color_name
  created_at
  collection {
    id
    slug
    name
  }
}
    `;
export const GlazeCardFragmentDoc = gql`
    fragment GlazeCard on Glaze {
  id
  slug
  name
  color_code
  swatch_url
}
    `;
export const ProductCardFragmentDoc = gql`
    fragment ProductCard on Product {
  id
  slug
  name
  price
  compare_at_price
  material
  color_name
  color_code
  glaze {
    ...GlazeCard
  }
  image_urls
  stock
  is_active
  is_archived
  is_featured
  is_customizable
  is_second
  rating_avg
  rating_count
  collection {
    id
    slug
    name
    starts_at
    ends_at
  }
}
    `;
export const CartFieldsFragmentDoc = gql`
    fragment CartFields on Cart {
  item_count
  subtotal
  shipping_fee
  free_shipping_above
  total
  items {
    id
    quantity
    unit_price
    line_total
    is_available
    unavailable_reason
    selections {
      group_id
      group_name
      option_id
      option_name
      text
      price_modifier
    }
    reference_image_urls
    product {
      ...ProductCard
    }
  }
}
    `;
export const EventCardFragmentDoc = gql`
    fragment EventCard on Event {
  id
  slug
  title
  event_type
  status
  level
  starts_at
  ends_at
  location
  price
  total_seats
  available_seats
  instructor
  image_url
  rating_avg
  rating_count
  is_past
}
    `;
export const RegistrationFieldsFragmentDoc = gql`
    fragment RegistrationFields on Registration {
  id
  seats
  unit_price
  discount
  total
  status
  note
  cancel_reason
  can_cancel
  created_at
  approved_at
  confirmed_at
  rejected_at
  cancelled_at
  event {
    ...EventCard
    address
  }
}
    `;
export const OrderFieldsFragmentDoc = gql`
    fragment OrderFields on Order {
  id
  status
  subtotal
  discount
  shipping_fee
  total
  coupon_code
  customer_note
  gift_note
  hide_prices
  tracking_note
  cancel_reason
  can_cancel
  care_notes
  item_count
  created_at
  confirmed_at
  paid_at
  shipped_at
  delivered_at
  cancelled_at
  refunded_at
  shipping_address {
    name
    phone
    line1
    line2
    landmark
    city
    state
    pincode
  }
  items {
    id
    product_name
    product_image
    unit_price
    quantity
    line_total
    selections {
      group_id
      group_name
      option_id
      option_name
      text
      price_modifier
    }
    reference_image_urls
    product {
      id
      slug
      is_customizable
    }
  }
  studio_notes {
    id
    body
    image_url
    created_at
  }
}
    `;
export const ReviewSummaryFieldsFragmentDoc = gql`
    fragment ReviewSummaryFields on RatingSummary {
  average
  count
  distribution
}
    `;
export const ReviewFieldsFragmentDoc = gql`
    fragment ReviewFields on Review {
  id
  rating
  body
  image_urls
  created_at
  is_mine
  subject_name
  subject_href
  author {
    name
    image
  }
}
    `;
export const ReviewEligibilityFieldsFragmentDoc = gql`
    fragment ReviewEligibilityFields on ReviewEligibility {
  can_review
  reason
  my_review {
    ...ReviewFields
  }
}
    `;
export const WorkshopConfigFieldsFragmentDoc = gql`
    fragment WorkshopConfigFields on WorkshopConfig {
  id
  slug
  name
  description
  image_url
  timezone
  opening_minutes
  closing_minutes
  slot_minutes
  capacity_per_slot
  booking_window_days
  slot_span_days
  closed_weekdays
  tiers {
    hours
    price_per_person
    pieces_per_person
  }
}
    `;
export const WorkshopBookingFieldsFragmentDoc = gql`
    fragment WorkshopBookingFields on WorkshopBooking {
  id
  starts_at
  ends_at
  slots {
    starts_at
    ends_at
  }
  hours
  participants
  price_per_person
  pieces_per_person
  subtotal
  discount
  total
  status
  note
  cancel_reason
  can_cancel
  can_reschedule
  created_at
  approved_at
  confirmed_at
  rejected_at
  cancelled_at
  config {
    ...WorkshopConfigFields
  }
}
    `;
export const AddressesDocument = gql`
    query Addresses {
  addresses {
    ...AddressFields
  }
}
    ${AddressFieldsFragmentDoc}`;

/**
 * __useAddressesQuery__
 *
 * To run a query within a React component, call `useAddressesQuery` and pass it any options that fit your needs.
 * When your component renders, `useAddressesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useAddressesQuery({
 *   variables: {
 *   },
 * });
 */
export function useAddressesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<AddressesQuery, AddressesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<AddressesQuery, AddressesQueryVariables>(AddressesDocument, options);
      }
export function useAddressesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<AddressesQuery, AddressesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<AddressesQuery, AddressesQueryVariables>(AddressesDocument, options);
        }
export type AddressesQueryHookResult = ReturnType<typeof useAddressesQuery>;
export type AddressesLazyQueryHookResult = ReturnType<typeof useAddressesLazyQuery>;
export type AddressesQueryResult = ApolloReactCommon.QueryResult<AddressesQuery, AddressesQueryVariables>;
export const CreateAddressDocument = gql`
    mutation CreateAddress($input: AddressInput!) {
  createAddress(input: $input) {
    ...AddressFields
  }
}
    ${AddressFieldsFragmentDoc}`;

/**
 * __useCreateAddressMutation__
 *
 * To run a mutation, you first call `useCreateAddressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAddressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAddressMutation, { data, loading, error }] = useCreateAddressMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateAddressMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateAddressMutation, CreateAddressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateAddressMutation, CreateAddressMutationVariables>(CreateAddressDocument, options);
      }
export type CreateAddressMutationHookResult = ReturnType<typeof useCreateAddressMutation>;
export type CreateAddressMutationResult = ApolloReactCommon.MutationResult<CreateAddressMutation>;
export const UpdateAddressDocument = gql`
    mutation UpdateAddress($id: Int!, $input: AddressInput!) {
  updateAddress(id: $id, input: $input) {
    ...AddressFields
  }
}
    ${AddressFieldsFragmentDoc}`;

/**
 * __useUpdateAddressMutation__
 *
 * To run a mutation, you first call `useUpdateAddressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAddressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAddressMutation, { data, loading, error }] = useUpdateAddressMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateAddressMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateAddressMutation, UpdateAddressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateAddressMutation, UpdateAddressMutationVariables>(UpdateAddressDocument, options);
      }
export type UpdateAddressMutationHookResult = ReturnType<typeof useUpdateAddressMutation>;
export type UpdateAddressMutationResult = ApolloReactCommon.MutationResult<UpdateAddressMutation>;
export const DeleteAddressDocument = gql`
    mutation DeleteAddress($id: Int!) {
  deleteAddress(id: $id)
}
    `;

/**
 * __useDeleteAddressMutation__
 *
 * To run a mutation, you first call `useDeleteAddressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAddressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAddressMutation, { data, loading, error }] = useDeleteAddressMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteAddressMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteAddressMutation, DeleteAddressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteAddressMutation, DeleteAddressMutationVariables>(DeleteAddressDocument, options);
      }
export type DeleteAddressMutationHookResult = ReturnType<typeof useDeleteAddressMutation>;
export type DeleteAddressMutationResult = ApolloReactCommon.MutationResult<DeleteAddressMutation>;
export const SetDefaultAddressDocument = gql`
    mutation SetDefaultAddress($id: Int!) {
  setDefaultAddress(id: $id) {
    ...AddressFields
  }
}
    ${AddressFieldsFragmentDoc}`;

/**
 * __useSetDefaultAddressMutation__
 *
 * To run a mutation, you first call `useSetDefaultAddressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSetDefaultAddressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [setDefaultAddressMutation, { data, loading, error }] = useSetDefaultAddressMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useSetDefaultAddressMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SetDefaultAddressMutation, SetDefaultAddressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SetDefaultAddressMutation, SetDefaultAddressMutationVariables>(SetDefaultAddressDocument, options);
      }
export type SetDefaultAddressMutationHookResult = ReturnType<typeof useSetDefaultAddressMutation>;
export type SetDefaultAddressMutationResult = ApolloReactCommon.MutationResult<SetDefaultAddressMutation>;
export const ArchiveWallDocument = gql`
    query ArchiveWall($filter: ProductsFilterInput) {
  products(filter: $filter) {
    items {
      ...ArchivePiece
    }
    page_info {
      total
      page
      limit
      has_more
    }
  }
}
    ${ArchivePieceFragmentDoc}`;

/**
 * __useArchiveWallQuery__
 *
 * To run a query within a React component, call `useArchiveWallQuery` and pass it any options that fit your needs.
 * When your component renders, `useArchiveWallQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useArchiveWallQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useArchiveWallQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ArchiveWallQuery, ArchiveWallQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ArchiveWallQuery, ArchiveWallQueryVariables>(ArchiveWallDocument, options);
      }
export function useArchiveWallLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ArchiveWallQuery, ArchiveWallQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ArchiveWallQuery, ArchiveWallQueryVariables>(ArchiveWallDocument, options);
        }
export type ArchiveWallQueryHookResult = ReturnType<typeof useArchiveWallQuery>;
export type ArchiveWallLazyQueryHookResult = ReturnType<typeof useArchiveWallLazyQuery>;
export type ArchiveWallQueryResult = ApolloReactCommon.QueryResult<ArchiveWallQuery, ArchiveWallQueryVariables>;
export const CartDocument = gql`
    query Cart {
  cart {
    ...CartFields
  }
}
    ${CartFieldsFragmentDoc}
${ProductCardFragmentDoc}
${GlazeCardFragmentDoc}`;

/**
 * __useCartQuery__
 *
 * To run a query within a React component, call `useCartQuery` and pass it any options that fit your needs.
 * When your component renders, `useCartQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCartQuery({
 *   variables: {
 *   },
 * });
 */
export function useCartQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CartQuery, CartQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CartQuery, CartQueryVariables>(CartDocument, options);
      }
export function useCartLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CartQuery, CartQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CartQuery, CartQueryVariables>(CartDocument, options);
        }
export type CartQueryHookResult = ReturnType<typeof useCartQuery>;
export type CartLazyQueryHookResult = ReturnType<typeof useCartLazyQuery>;
export type CartQueryResult = ApolloReactCommon.QueryResult<CartQuery, CartQueryVariables>;
export const CartCountDocument = gql`
    query CartCount {
  cartCount
}
    `;

/**
 * __useCartCountQuery__
 *
 * To run a query within a React component, call `useCartCountQuery` and pass it any options that fit your needs.
 * When your component renders, `useCartCountQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCartCountQuery({
 *   variables: {
 *   },
 * });
 */
export function useCartCountQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CartCountQuery, CartCountQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CartCountQuery, CartCountQueryVariables>(CartCountDocument, options);
      }
export function useCartCountLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CartCountQuery, CartCountQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CartCountQuery, CartCountQueryVariables>(CartCountDocument, options);
        }
export type CartCountQueryHookResult = ReturnType<typeof useCartCountQuery>;
export type CartCountLazyQueryHookResult = ReturnType<typeof useCartCountLazyQuery>;
export type CartCountQueryResult = ApolloReactCommon.QueryResult<CartCountQuery, CartCountQueryVariables>;
export const AddToCartDocument = gql`
    mutation AddToCart($input: AddToCartInput!) {
  addToCart(input: $input) {
    ...CartFields
  }
}
    ${CartFieldsFragmentDoc}
${ProductCardFragmentDoc}
${GlazeCardFragmentDoc}`;

/**
 * __useAddToCartMutation__
 *
 * To run a mutation, you first call `useAddToCartMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useAddToCartMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [addToCartMutation, { data, loading, error }] = useAddToCartMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useAddToCartMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<AddToCartMutation, AddToCartMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<AddToCartMutation, AddToCartMutationVariables>(AddToCartDocument, options);
      }
export type AddToCartMutationHookResult = ReturnType<typeof useAddToCartMutation>;
export type AddToCartMutationResult = ApolloReactCommon.MutationResult<AddToCartMutation>;
export const UpdateCartItemDocument = gql`
    mutation UpdateCartItem($id: Int!, $quantity: Int!) {
  updateCartItem(id: $id, quantity: $quantity) {
    ...CartFields
  }
}
    ${CartFieldsFragmentDoc}
${ProductCardFragmentDoc}
${GlazeCardFragmentDoc}`;

/**
 * __useUpdateCartItemMutation__
 *
 * To run a mutation, you first call `useUpdateCartItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateCartItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateCartItemMutation, { data, loading, error }] = useUpdateCartItemMutation({
 *   variables: {
 *      id: // value for 'id'
 *      quantity: // value for 'quantity'
 *   },
 * });
 */
export function useUpdateCartItemMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateCartItemMutation, UpdateCartItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateCartItemMutation, UpdateCartItemMutationVariables>(UpdateCartItemDocument, options);
      }
export type UpdateCartItemMutationHookResult = ReturnType<typeof useUpdateCartItemMutation>;
export type UpdateCartItemMutationResult = ApolloReactCommon.MutationResult<UpdateCartItemMutation>;
export const RemoveCartItemDocument = gql`
    mutation RemoveCartItem($id: Int!) {
  removeCartItem(id: $id) {
    ...CartFields
  }
}
    ${CartFieldsFragmentDoc}
${ProductCardFragmentDoc}
${GlazeCardFragmentDoc}`;

/**
 * __useRemoveCartItemMutation__
 *
 * To run a mutation, you first call `useRemoveCartItemMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRemoveCartItemMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [removeCartItemMutation, { data, loading, error }] = useRemoveCartItemMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRemoveCartItemMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RemoveCartItemMutation, RemoveCartItemMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RemoveCartItemMutation, RemoveCartItemMutationVariables>(RemoveCartItemDocument, options);
      }
export type RemoveCartItemMutationHookResult = ReturnType<typeof useRemoveCartItemMutation>;
export type RemoveCartItemMutationResult = ApolloReactCommon.MutationResult<RemoveCartItemMutation>;
export const ClearCartDocument = gql`
    mutation ClearCart {
  clearCart {
    ...CartFields
  }
}
    ${CartFieldsFragmentDoc}
${ProductCardFragmentDoc}
${GlazeCardFragmentDoc}`;

/**
 * __useClearCartMutation__
 *
 * To run a mutation, you first call `useClearCartMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useClearCartMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [clearCartMutation, { data, loading, error }] = useClearCartMutation({
 *   variables: {
 *   },
 * });
 */
export function useClearCartMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ClearCartMutation, ClearCartMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ClearCartMutation, ClearCartMutationVariables>(ClearCartDocument, options);
      }
export type ClearCartMutationHookResult = ReturnType<typeof useClearCartMutation>;
export type ClearCartMutationResult = ApolloReactCommon.MutationResult<ClearCartMutation>;
export const CommissionOptionsDocument = gql`
    query CommissionOptions {
  commissionOptions {
    piece_types
    sizes
    glazes {
      slug
      name
      color_code
    }
  }
}
    `;

/**
 * __useCommissionOptionsQuery__
 *
 * To run a query within a React component, call `useCommissionOptionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommissionOptionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommissionOptionsQuery({
 *   variables: {
 *   },
 * });
 */
export function useCommissionOptionsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CommissionOptionsQuery, CommissionOptionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CommissionOptionsQuery, CommissionOptionsQueryVariables>(CommissionOptionsDocument, options);
      }
export function useCommissionOptionsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CommissionOptionsQuery, CommissionOptionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CommissionOptionsQuery, CommissionOptionsQueryVariables>(CommissionOptionsDocument, options);
        }
export type CommissionOptionsQueryHookResult = ReturnType<typeof useCommissionOptionsQuery>;
export type CommissionOptionsLazyQueryHookResult = ReturnType<typeof useCommissionOptionsLazyQuery>;
export type CommissionOptionsQueryResult = ApolloReactCommon.QueryResult<CommissionOptionsQuery, CommissionOptionsQueryVariables>;
export const CommissionPiecesDocument = gql`
    query CommissionPieces($limit: Int) {
  commissionPieces(limit: $limit) {
    ...ProductCard
  }
}
    ${ProductCardFragmentDoc}
${GlazeCardFragmentDoc}`;

/**
 * __useCommissionPiecesQuery__
 *
 * To run a query within a React component, call `useCommissionPiecesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCommissionPiecesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCommissionPiecesQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useCommissionPiecesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CommissionPiecesQuery, CommissionPiecesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CommissionPiecesQuery, CommissionPiecesQueryVariables>(CommissionPiecesDocument, options);
      }
export function useCommissionPiecesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CommissionPiecesQuery, CommissionPiecesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CommissionPiecesQuery, CommissionPiecesQueryVariables>(CommissionPiecesDocument, options);
        }
export type CommissionPiecesQueryHookResult = ReturnType<typeof useCommissionPiecesQuery>;
export type CommissionPiecesLazyQueryHookResult = ReturnType<typeof useCommissionPiecesLazyQuery>;
export type CommissionPiecesQueryResult = ApolloReactCommon.QueryResult<CommissionPiecesQuery, CommissionPiecesQueryVariables>;
export const CreateCommissionRequestDocument = gql`
    mutation CreateCommissionRequest($input: CommissionRequestInput!) {
  createCommissionRequest(input: $input) {
    id
    piece_type
    size
    glaze
    created_at
  }
}
    `;

/**
 * __useCreateCommissionRequestMutation__
 *
 * To run a mutation, you first call `useCreateCommissionRequestMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCommissionRequestMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCommissionRequestMutation, { data, loading, error }] = useCreateCommissionRequestMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateCommissionRequestMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateCommissionRequestMutation, CreateCommissionRequestMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateCommissionRequestMutation, CreateCommissionRequestMutationVariables>(CreateCommissionRequestDocument, options);
      }
export type CreateCommissionRequestMutationHookResult = ReturnType<typeof useCreateCommissionRequestMutation>;
export type CreateCommissionRequestMutationResult = ApolloReactCommon.MutationResult<CreateCommissionRequestMutation>;
export const ContentPageDocument = gql`
    query ContentPage($slug: String!) {
  contentPage(slug: $slug) {
    slug
    title
    subtitle
    hero_image_url
    is_published
    updated_at
    sections {
      heading
      body
      items {
        title
        body
      }
    }
  }
}
    `;

/**
 * __useContentPageQuery__
 *
 * To run a query within a React component, call `useContentPageQuery` and pass it any options that fit your needs.
 * When your component renders, `useContentPageQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useContentPageQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useContentPageQuery(baseOptions: ApolloReactHooks.QueryHookOptions<ContentPageQuery, ContentPageQueryVariables> & ({ variables: ContentPageQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ContentPageQuery, ContentPageQueryVariables>(ContentPageDocument, options);
      }
export function useContentPageLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ContentPageQuery, ContentPageQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ContentPageQuery, ContentPageQueryVariables>(ContentPageDocument, options);
        }
export type ContentPageQueryHookResult = ReturnType<typeof useContentPageQuery>;
export type ContentPageLazyQueryHookResult = ReturnType<typeof useContentPageLazyQuery>;
export type ContentPageQueryResult = ApolloReactCommon.QueryResult<ContentPageQuery, ContentPageQueryVariables>;
export const SendContactMessageDocument = gql`
    mutation SendContactMessage($input: ContactMessageInput!) {
  sendContactMessage(input: $input)
}
    `;

/**
 * __useSendContactMessageMutation__
 *
 * To run a mutation, you first call `useSendContactMessageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSendContactMessageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [sendContactMessageMutation, { data, loading, error }] = useSendContactMessageMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useSendContactMessageMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SendContactMessageMutation, SendContactMessageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SendContactMessageMutation, SendContactMessageMutationVariables>(SendContactMessageDocument, options);
      }
export type SendContactMessageMutationHookResult = ReturnType<typeof useSendContactMessageMutation>;
export type SendContactMessageMutationResult = ApolloReactCommon.MutationResult<SendContactMessageMutation>;
export const SubscribeToNewsletterDocument = gql`
    mutation SubscribeToNewsletter($email: String!) {
  subscribeToNewsletter(email: $email) {
    email
    is_active
    was_already_subscribed
  }
}
    `;

/**
 * __useSubscribeToNewsletterMutation__
 *
 * To run a mutation, you first call `useSubscribeToNewsletterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useSubscribeToNewsletterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [subscribeToNewsletterMutation, { data, loading, error }] = useSubscribeToNewsletterMutation({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useSubscribeToNewsletterMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<SubscribeToNewsletterMutation, SubscribeToNewsletterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<SubscribeToNewsletterMutation, SubscribeToNewsletterMutationVariables>(SubscribeToNewsletterDocument, options);
      }
export type SubscribeToNewsletterMutationHookResult = ReturnType<typeof useSubscribeToNewsletterMutation>;
export type SubscribeToNewsletterMutationResult = ApolloReactCommon.MutationResult<SubscribeToNewsletterMutation>;
export const UnsubscribeFromNewsletterDocument = gql`
    mutation UnsubscribeFromNewsletter($token: String!) {
  unsubscribeFromNewsletter(token: $token)
}
    `;

/**
 * __useUnsubscribeFromNewsletterMutation__
 *
 * To run a mutation, you first call `useUnsubscribeFromNewsletterMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUnsubscribeFromNewsletterMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [unsubscribeFromNewsletterMutation, { data, loading, error }] = useUnsubscribeFromNewsletterMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useUnsubscribeFromNewsletterMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UnsubscribeFromNewsletterMutation, UnsubscribeFromNewsletterMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UnsubscribeFromNewsletterMutation, UnsubscribeFromNewsletterMutationVariables>(UnsubscribeFromNewsletterDocument, options);
      }
export type UnsubscribeFromNewsletterMutationHookResult = ReturnType<typeof useUnsubscribeFromNewsletterMutation>;
export type UnsubscribeFromNewsletterMutationResult = ApolloReactCommon.MutationResult<UnsubscribeFromNewsletterMutation>;
export const EventsDocument = gql`
    query Events($filter: EventsFilterInput) {
  events(filter: $filter) {
    items {
      ...EventCard
    }
    page_info {
      total
      page
      limit
      has_more
    }
  }
}
    ${EventCardFragmentDoc}`;

/**
 * __useEventsQuery__
 *
 * To run a query within a React component, call `useEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEventsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useEventsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<EventsQuery, EventsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<EventsQuery, EventsQueryVariables>(EventsDocument, options);
      }
export function useEventsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<EventsQuery, EventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<EventsQuery, EventsQueryVariables>(EventsDocument, options);
        }
export type EventsQueryHookResult = ReturnType<typeof useEventsQuery>;
export type EventsLazyQueryHookResult = ReturnType<typeof useEventsLazyQuery>;
export type EventsQueryResult = ApolloReactCommon.QueryResult<EventsQuery, EventsQueryVariables>;
export const EventDocument = gql`
    query Event($slug: String!) {
  event(slug: $slug) {
    ...EventCard
    description
    address
    gallery
    includes
    highlights
    performers
    my_registration {
      ...RegistrationFields
    }
  }
}
    ${EventCardFragmentDoc}
${RegistrationFieldsFragmentDoc}`;

/**
 * __useEventQuery__
 *
 * To run a query within a React component, call `useEventQuery` and pass it any options that fit your needs.
 * When your component renders, `useEventQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEventQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useEventQuery(baseOptions: ApolloReactHooks.QueryHookOptions<EventQuery, EventQueryVariables> & ({ variables: EventQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<EventQuery, EventQueryVariables>(EventDocument, options);
      }
export function useEventLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<EventQuery, EventQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<EventQuery, EventQueryVariables>(EventDocument, options);
        }
export type EventQueryHookResult = ReturnType<typeof useEventQuery>;
export type EventLazyQueryHookResult = ReturnType<typeof useEventLazyQuery>;
export type EventQueryResult = ApolloReactCommon.QueryResult<EventQuery, EventQueryVariables>;
export const UpcomingEventsDocument = gql`
    query UpcomingEvents($limit: Int) {
  upcomingEvents(limit: $limit) {
    ...EventCard
  }
}
    ${EventCardFragmentDoc}`;

/**
 * __useUpcomingEventsQuery__
 *
 * To run a query within a React component, call `useUpcomingEventsQuery` and pass it any options that fit your needs.
 * When your component renders, `useUpcomingEventsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useUpcomingEventsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useUpcomingEventsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<UpcomingEventsQuery, UpcomingEventsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<UpcomingEventsQuery, UpcomingEventsQueryVariables>(UpcomingEventsDocument, options);
      }
export function useUpcomingEventsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<UpcomingEventsQuery, UpcomingEventsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<UpcomingEventsQuery, UpcomingEventsQueryVariables>(UpcomingEventsDocument, options);
        }
export type UpcomingEventsQueryHookResult = ReturnType<typeof useUpcomingEventsQuery>;
export type UpcomingEventsLazyQueryHookResult = ReturnType<typeof useUpcomingEventsLazyQuery>;
export type UpcomingEventsQueryResult = ApolloReactCommon.QueryResult<UpcomingEventsQuery, UpcomingEventsQueryVariables>;
export const RegisterForEventDocument = gql`
    mutation RegisterForEvent($input: RegisterForEventInput!) {
  registerForEvent(input: $input) {
    ...RegistrationFields
  }
}
    ${RegistrationFieldsFragmentDoc}
${EventCardFragmentDoc}`;

/**
 * __useRegisterForEventMutation__
 *
 * To run a mutation, you first call `useRegisterForEventMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRegisterForEventMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [registerForEventMutation, { data, loading, error }] = useRegisterForEventMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRegisterForEventMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RegisterForEventMutation, RegisterForEventMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RegisterForEventMutation, RegisterForEventMutationVariables>(RegisterForEventDocument, options);
      }
export type RegisterForEventMutationHookResult = ReturnType<typeof useRegisterForEventMutation>;
export type RegisterForEventMutationResult = ApolloReactCommon.MutationResult<RegisterForEventMutation>;
export const MyRegistrationsDocument = gql`
    query MyRegistrations($page: Int, $limit: Int) {
  myRegistrations(page: $page, limit: $limit) {
    items {
      ...RegistrationFields
    }
    page_info {
      total
      page
      limit
      has_more
    }
  }
}
    ${RegistrationFieldsFragmentDoc}
${EventCardFragmentDoc}`;

/**
 * __useMyRegistrationsQuery__
 *
 * To run a query within a React component, call `useMyRegistrationsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyRegistrationsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyRegistrationsQuery({
 *   variables: {
 *      page: // value for 'page'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useMyRegistrationsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MyRegistrationsQuery, MyRegistrationsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MyRegistrationsQuery, MyRegistrationsQueryVariables>(MyRegistrationsDocument, options);
      }
export function useMyRegistrationsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MyRegistrationsQuery, MyRegistrationsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MyRegistrationsQuery, MyRegistrationsQueryVariables>(MyRegistrationsDocument, options);
        }
export type MyRegistrationsQueryHookResult = ReturnType<typeof useMyRegistrationsQuery>;
export type MyRegistrationsLazyQueryHookResult = ReturnType<typeof useMyRegistrationsLazyQuery>;
export type MyRegistrationsQueryResult = ApolloReactCommon.QueryResult<MyRegistrationsQuery, MyRegistrationsQueryVariables>;
export const RegistrationDocument = gql`
    query Registration($id: String!) {
  registration(id: $id) {
    ...RegistrationFields
  }
}
    ${RegistrationFieldsFragmentDoc}
${EventCardFragmentDoc}`;

/**
 * __useRegistrationQuery__
 *
 * To run a query within a React component, call `useRegistrationQuery` and pass it any options that fit your needs.
 * When your component renders, `useRegistrationQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRegistrationQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useRegistrationQuery(baseOptions: ApolloReactHooks.QueryHookOptions<RegistrationQuery, RegistrationQueryVariables> & ({ variables: RegistrationQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<RegistrationQuery, RegistrationQueryVariables>(RegistrationDocument, options);
      }
export function useRegistrationLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<RegistrationQuery, RegistrationQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<RegistrationQuery, RegistrationQueryVariables>(RegistrationDocument, options);
        }
export type RegistrationQueryHookResult = ReturnType<typeof useRegistrationQuery>;
export type RegistrationLazyQueryHookResult = ReturnType<typeof useRegistrationLazyQuery>;
export type RegistrationQueryResult = ApolloReactCommon.QueryResult<RegistrationQuery, RegistrationQueryVariables>;
export const CancelRegistrationDocument = gql`
    mutation CancelRegistration($id: String!, $reason: String) {
  cancelRegistration(id: $id, reason: $reason) {
    ...RegistrationFields
  }
}
    ${RegistrationFieldsFragmentDoc}
${EventCardFragmentDoc}`;

/**
 * __useCancelRegistrationMutation__
 *
 * To run a mutation, you first call `useCancelRegistrationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelRegistrationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelRegistrationMutation, { data, loading, error }] = useCancelRegistrationMutation({
 *   variables: {
 *      id: // value for 'id'
 *      reason: // value for 'reason'
 *   },
 * });
 */
export function useCancelRegistrationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CancelRegistrationMutation, CancelRegistrationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CancelRegistrationMutation, CancelRegistrationMutationVariables>(CancelRegistrationDocument, options);
      }
export type CancelRegistrationMutationHookResult = ReturnType<typeof useCancelRegistrationMutation>;
export type CancelRegistrationMutationResult = ApolloReactCommon.MutationResult<CancelRegistrationMutation>;
export const NotifyWhenBackInStockDocument = gql`
    mutation NotifyWhenBackInStock($productId: Int!, $email: String!) {
  notifyWhenBackInStock(product_id: $productId, email: $email) {
    email
    was_already_waiting
  }
}
    `;

/**
 * __useNotifyWhenBackInStockMutation__
 *
 * To run a mutation, you first call `useNotifyWhenBackInStockMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useNotifyWhenBackInStockMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [notifyWhenBackInStockMutation, { data, loading, error }] = useNotifyWhenBackInStockMutation({
 *   variables: {
 *      productId: // value for 'productId'
 *      email: // value for 'email'
 *   },
 * });
 */
export function useNotifyWhenBackInStockMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<NotifyWhenBackInStockMutation, NotifyWhenBackInStockMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<NotifyWhenBackInStockMutation, NotifyWhenBackInStockMutationVariables>(NotifyWhenBackInStockDocument, options);
      }
export type NotifyWhenBackInStockMutationHookResult = ReturnType<typeof useNotifyWhenBackInStockMutation>;
export type NotifyWhenBackInStockMutationResult = ApolloReactCommon.MutationResult<NotifyWhenBackInStockMutation>;
export const StopBatchNotificationDocument = gql`
    mutation StopBatchNotification($token: String!) {
  stopBatchNotification(token: $token)
}
    `;

/**
 * __useStopBatchNotificationMutation__
 *
 * To run a mutation, you first call `useStopBatchNotificationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useStopBatchNotificationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [stopBatchNotificationMutation, { data, loading, error }] = useStopBatchNotificationMutation({
 *   variables: {
 *      token: // value for 'token'
 *   },
 * });
 */
export function useStopBatchNotificationMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<StopBatchNotificationMutation, StopBatchNotificationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<StopBatchNotificationMutation, StopBatchNotificationMutationVariables>(StopBatchNotificationDocument, options);
      }
export type StopBatchNotificationMutationHookResult = ReturnType<typeof useStopBatchNotificationMutation>;
export type StopBatchNotificationMutationResult = ApolloReactCommon.MutationResult<StopBatchNotificationMutation>;
export const CheckoutQuoteDocument = gql`
    query CheckoutQuote($input: CheckoutQuoteInput) {
  checkoutQuote(input: $input) {
    subtotal
    discount
    shipping_fee
    total
    item_count
    coupon_code
    coupon_message
    problems
  }
}
    `;

/**
 * __useCheckoutQuoteQuery__
 *
 * To run a query within a React component, call `useCheckoutQuoteQuery` and pass it any options that fit your needs.
 * When your component renders, `useCheckoutQuoteQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCheckoutQuoteQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCheckoutQuoteQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CheckoutQuoteQuery, CheckoutQuoteQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CheckoutQuoteQuery, CheckoutQuoteQueryVariables>(CheckoutQuoteDocument, options);
      }
export function useCheckoutQuoteLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CheckoutQuoteQuery, CheckoutQuoteQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CheckoutQuoteQuery, CheckoutQuoteQueryVariables>(CheckoutQuoteDocument, options);
        }
export type CheckoutQuoteQueryHookResult = ReturnType<typeof useCheckoutQuoteQuery>;
export type CheckoutQuoteLazyQueryHookResult = ReturnType<typeof useCheckoutQuoteLazyQuery>;
export type CheckoutQuoteQueryResult = ApolloReactCommon.QueryResult<CheckoutQuoteQuery, CheckoutQuoteQueryVariables>;
export const PlaceOrderDocument = gql`
    mutation PlaceOrder($input: PlaceOrderInput!) {
  placeOrder(input: $input) {
    ...OrderFields
  }
}
    ${OrderFieldsFragmentDoc}`;

/**
 * __usePlaceOrderMutation__
 *
 * To run a mutation, you first call `usePlaceOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `usePlaceOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [placeOrderMutation, { data, loading, error }] = usePlaceOrderMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function usePlaceOrderMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<PlaceOrderMutation, PlaceOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<PlaceOrderMutation, PlaceOrderMutationVariables>(PlaceOrderDocument, options);
      }
export type PlaceOrderMutationHookResult = ReturnType<typeof usePlaceOrderMutation>;
export type PlaceOrderMutationResult = ApolloReactCommon.MutationResult<PlaceOrderMutation>;
export const OrdersDocument = gql`
    query Orders($page: Int, $limit: Int) {
  orders(page: $page, limit: $limit) {
    items {
      ...OrderFields
    }
    page_info {
      total
      page
      limit
      has_more
    }
  }
}
    ${OrderFieldsFragmentDoc}`;

/**
 * __useOrdersQuery__
 *
 * To run a query within a React component, call `useOrdersQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrdersQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrdersQuery({
 *   variables: {
 *      page: // value for 'page'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useOrdersQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<OrdersQuery, OrdersQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<OrdersQuery, OrdersQueryVariables>(OrdersDocument, options);
      }
export function useOrdersLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<OrdersQuery, OrdersQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<OrdersQuery, OrdersQueryVariables>(OrdersDocument, options);
        }
export type OrdersQueryHookResult = ReturnType<typeof useOrdersQuery>;
export type OrdersLazyQueryHookResult = ReturnType<typeof useOrdersLazyQuery>;
export type OrdersQueryResult = ApolloReactCommon.QueryResult<OrdersQuery, OrdersQueryVariables>;
export const OrderDocument = gql`
    query Order($id: String!) {
  order(id: $id) {
    ...OrderFields
  }
}
    ${OrderFieldsFragmentDoc}`;

/**
 * __useOrderQuery__
 *
 * To run a query within a React component, call `useOrderQuery` and pass it any options that fit your needs.
 * When your component renders, `useOrderQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useOrderQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useOrderQuery(baseOptions: ApolloReactHooks.QueryHookOptions<OrderQuery, OrderQueryVariables> & ({ variables: OrderQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<OrderQuery, OrderQueryVariables>(OrderDocument, options);
      }
export function useOrderLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<OrderQuery, OrderQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<OrderQuery, OrderQueryVariables>(OrderDocument, options);
        }
export type OrderQueryHookResult = ReturnType<typeof useOrderQuery>;
export type OrderLazyQueryHookResult = ReturnType<typeof useOrderLazyQuery>;
export type OrderQueryResult = ApolloReactCommon.QueryResult<OrderQuery, OrderQueryVariables>;
export const CancelOrderDocument = gql`
    mutation CancelOrder($id: String!, $reason: String) {
  cancelOrder(id: $id, reason: $reason) {
    ...OrderFields
  }
}
    ${OrderFieldsFragmentDoc}`;

/**
 * __useCancelOrderMutation__
 *
 * To run a mutation, you first call `useCancelOrderMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelOrderMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelOrderMutation, { data, loading, error }] = useCancelOrderMutation({
 *   variables: {
 *      id: // value for 'id'
 *      reason: // value for 'reason'
 *   },
 * });
 */
export function useCancelOrderMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CancelOrderMutation, CancelOrderMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CancelOrderMutation, CancelOrderMutationVariables>(CancelOrderDocument, options);
      }
export type CancelOrderMutationHookResult = ReturnType<typeof useCancelOrderMutation>;
export type CancelOrderMutationResult = ApolloReactCommon.MutationResult<CancelOrderMutation>;
export const ProductsDocument = gql`
    query Products($filter: ProductsFilterInput) {
  products(filter: $filter) {
    items {
      ...ProductCard
    }
    page_info {
      total
      page
      limit
      has_more
    }
    facets {
      categories {
        value
        label
        count
      }
      collections {
        value
        label
        count
      }
      materials {
        value
        label
        count
      }
      glazes {
        value
        label
        count
      }
      price_min
      price_max
      active_count
      archive_count
      seconds_count
    }
  }
}
    ${ProductCardFragmentDoc}
${GlazeCardFragmentDoc}`;

/**
 * __useProductsQuery__
 *
 * To run a query within a React component, call `useProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductsQuery({
 *   variables: {
 *      filter: // value for 'filter'
 *   },
 * });
 */
export function useProductsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<ProductsQuery, ProductsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ProductsQuery, ProductsQueryVariables>(ProductsDocument, options);
      }
export function useProductsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ProductsQuery, ProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ProductsQuery, ProductsQueryVariables>(ProductsDocument, options);
        }
export type ProductsQueryHookResult = ReturnType<typeof useProductsQuery>;
export type ProductsLazyQueryHookResult = ReturnType<typeof useProductsLazyQuery>;
export type ProductsQueryResult = ApolloReactCommon.QueryResult<ProductsQuery, ProductsQueryVariables>;
export const ProductDocument = gql`
    query Product($slug: String!) {
  product(slug: $slug) {
    ...ProductCard
    description
    created_at
    flaw_note
    dimensions
    capacity_ml
    height_cm
    diameter_cm
    weight_g
    maker_note
    care_notes
    glaze {
      ...GlazeCard
      description
      variation_note
    }
    sales_count
    categories {
      id
      slug
      name
    }
    option_groups {
      id
      name
      kind
      is_required
      price_modifier
      max_length
      options {
        id
        name
        price_modifier
      }
    }
  }
}
    ${ProductCardFragmentDoc}
${GlazeCardFragmentDoc}`;

/**
 * __useProductQuery__
 *
 * To run a query within a React component, call `useProductQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useProductQuery(baseOptions: ApolloReactHooks.QueryHookOptions<ProductQuery, ProductQueryVariables> & ({ variables: ProductQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ProductQuery, ProductQueryVariables>(ProductDocument, options);
      }
export function useProductLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ProductQuery, ProductQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ProductQuery, ProductQueryVariables>(ProductDocument, options);
        }
export type ProductQueryHookResult = ReturnType<typeof useProductQuery>;
export type ProductLazyQueryHookResult = ReturnType<typeof useProductLazyQuery>;
export type ProductQueryResult = ApolloReactCommon.QueryResult<ProductQuery, ProductQueryVariables>;
export const RelatedProductsDocument = gql`
    query RelatedProducts($slug: String!, $limit: Int) {
  relatedProducts(slug: $slug, limit: $limit) {
    ...ProductCard
  }
}
    ${ProductCardFragmentDoc}
${GlazeCardFragmentDoc}`;

/**
 * __useRelatedProductsQuery__
 *
 * To run a query within a React component, call `useRelatedProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRelatedProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRelatedProductsQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useRelatedProductsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<RelatedProductsQuery, RelatedProductsQueryVariables> & ({ variables: RelatedProductsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<RelatedProductsQuery, RelatedProductsQueryVariables>(RelatedProductsDocument, options);
      }
export function useRelatedProductsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<RelatedProductsQuery, RelatedProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<RelatedProductsQuery, RelatedProductsQueryVariables>(RelatedProductsDocument, options);
        }
export type RelatedProductsQueryHookResult = ReturnType<typeof useRelatedProductsQuery>;
export type RelatedProductsLazyQueryHookResult = ReturnType<typeof useRelatedProductsLazyQuery>;
export type RelatedProductsQueryResult = ApolloReactCommon.QueryResult<RelatedProductsQuery, RelatedProductsQueryVariables>;
export const FeaturedProductsDocument = gql`
    query FeaturedProducts($limit: Int) {
  featuredProducts(limit: $limit) {
    ...ProductCard
  }
}
    ${ProductCardFragmentDoc}
${GlazeCardFragmentDoc}`;

/**
 * __useFeaturedProductsQuery__
 *
 * To run a query within a React component, call `useFeaturedProductsQuery` and pass it any options that fit your needs.
 * When your component renders, `useFeaturedProductsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useFeaturedProductsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useFeaturedProductsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<FeaturedProductsQuery, FeaturedProductsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<FeaturedProductsQuery, FeaturedProductsQueryVariables>(FeaturedProductsDocument, options);
      }
export function useFeaturedProductsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<FeaturedProductsQuery, FeaturedProductsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<FeaturedProductsQuery, FeaturedProductsQueryVariables>(FeaturedProductsDocument, options);
        }
export type FeaturedProductsQueryHookResult = ReturnType<typeof useFeaturedProductsQuery>;
export type FeaturedProductsLazyQueryHookResult = ReturnType<typeof useFeaturedProductsLazyQuery>;
export type FeaturedProductsQueryResult = ApolloReactCommon.QueryResult<FeaturedProductsQuery, FeaturedProductsQueryVariables>;
export const CategoriesDocument = gql`
    query Categories {
  categories {
    id
    slug
    name
    icon
    image_url
    product_count
  }
}
    `;

/**
 * __useCategoriesQuery__
 *
 * To run a query within a React component, call `useCategoriesQuery` and pass it any options that fit your needs.
 * When your component renders, `useCategoriesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCategoriesQuery({
 *   variables: {
 *   },
 * });
 */
export function useCategoriesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options);
      }
export function useCategoriesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CategoriesQuery, CategoriesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CategoriesQuery, CategoriesQueryVariables>(CategoriesDocument, options);
        }
export type CategoriesQueryHookResult = ReturnType<typeof useCategoriesQuery>;
export type CategoriesLazyQueryHookResult = ReturnType<typeof useCategoriesLazyQuery>;
export type CategoriesQueryResult = ApolloReactCommon.QueryResult<CategoriesQuery, CategoriesQueryVariables>;
export const CollectionsDocument = gql`
    query Collections($archive: Boolean) {
  collections(archive: $archive) {
    id
    slug
    name
    description
    image_url
    ends_at
    product_count
  }
}
    `;

/**
 * __useCollectionsQuery__
 *
 * To run a query within a React component, call `useCollectionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useCollectionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCollectionsQuery({
 *   variables: {
 *      archive: // value for 'archive'
 *   },
 * });
 */
export function useCollectionsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<CollectionsQuery, CollectionsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CollectionsQuery, CollectionsQueryVariables>(CollectionsDocument, options);
      }
export function useCollectionsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CollectionsQuery, CollectionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CollectionsQuery, CollectionsQueryVariables>(CollectionsDocument, options);
        }
export type CollectionsQueryHookResult = ReturnType<typeof useCollectionsQuery>;
export type CollectionsLazyQueryHookResult = ReturnType<typeof useCollectionsLazyQuery>;
export type CollectionsQueryResult = ApolloReactCommon.QueryResult<CollectionsQuery, CollectionsQueryVariables>;
export const CollectionDocument = gql`
    query Collection($slug: String!, $archive: Boolean) {
  collection(slug: $slug, archive: $archive) {
    id
    slug
    name
    description
    image_url
    ends_at
    product_count
  }
}
    `;

/**
 * __useCollectionQuery__
 *
 * To run a query within a React component, call `useCollectionQuery` and pass it any options that fit your needs.
 * When your component renders, `useCollectionQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useCollectionQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *      archive: // value for 'archive'
 *   },
 * });
 */
export function useCollectionQuery(baseOptions: ApolloReactHooks.QueryHookOptions<CollectionQuery, CollectionQueryVariables> & ({ variables: CollectionQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<CollectionQuery, CollectionQueryVariables>(CollectionDocument, options);
      }
export function useCollectionLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<CollectionQuery, CollectionQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<CollectionQuery, CollectionQueryVariables>(CollectionDocument, options);
        }
export type CollectionQueryHookResult = ReturnType<typeof useCollectionQuery>;
export type CollectionLazyQueryHookResult = ReturnType<typeof useCollectionLazyQuery>;
export type CollectionQueryResult = ApolloReactCommon.QueryResult<CollectionQuery, CollectionQueryVariables>;
export const GlazesDocument = gql`
    query Glazes {
  glazes {
    ...GlazeCard
    description
    variation_note
  }
}
    ${GlazeCardFragmentDoc}`;

/**
 * __useGlazesQuery__
 *
 * To run a query within a React component, call `useGlazesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGlazesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGlazesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGlazesQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<GlazesQuery, GlazesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GlazesQuery, GlazesQueryVariables>(GlazesDocument, options);
      }
export function useGlazesLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GlazesQuery, GlazesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GlazesQuery, GlazesQueryVariables>(GlazesDocument, options);
        }
export type GlazesQueryHookResult = ReturnType<typeof useGlazesQuery>;
export type GlazesLazyQueryHookResult = ReturnType<typeof useGlazesLazyQuery>;
export type GlazesQueryResult = ApolloReactCommon.QueryResult<GlazesQuery, GlazesQueryVariables>;
export const GlazeDocument = gql`
    query Glaze($slug: String!) {
  glaze(slug: $slug) {
    ...GlazeCard
    description
    variation_note
    pieces {
      ...ProductCard
    }
  }
}
    ${GlazeCardFragmentDoc}
${ProductCardFragmentDoc}`;

/**
 * __useGlazeQuery__
 *
 * To run a query within a React component, call `useGlazeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGlazeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGlazeQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useGlazeQuery(baseOptions: ApolloReactHooks.QueryHookOptions<GlazeQuery, GlazeQueryVariables> & ({ variables: GlazeQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<GlazeQuery, GlazeQueryVariables>(GlazeDocument, options);
      }
export function useGlazeLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<GlazeQuery, GlazeQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<GlazeQuery, GlazeQueryVariables>(GlazeDocument, options);
        }
export type GlazeQueryHookResult = ReturnType<typeof useGlazeQuery>;
export type GlazeLazyQueryHookResult = ReturnType<typeof useGlazeLazyQuery>;
export type GlazeQueryResult = ApolloReactCommon.QueryResult<GlazeQuery, GlazeQueryVariables>;
export const CreateProductReviewDocument = gql`
    mutation CreateProductReview($product_id: Int!, $input: ReviewInput!) {
  createProductReview(product_id: $product_id, input: $input) {
    ...ReviewFields
  }
}
    ${ReviewFieldsFragmentDoc}`;

/**
 * __useCreateProductReviewMutation__
 *
 * To run a mutation, you first call `useCreateProductReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateProductReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createProductReviewMutation, { data, loading, error }] = useCreateProductReviewMutation({
 *   variables: {
 *      product_id: // value for 'product_id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateProductReviewMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateProductReviewMutation, CreateProductReviewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateProductReviewMutation, CreateProductReviewMutationVariables>(CreateProductReviewDocument, options);
      }
export type CreateProductReviewMutationHookResult = ReturnType<typeof useCreateProductReviewMutation>;
export type CreateProductReviewMutationResult = ApolloReactCommon.MutationResult<CreateProductReviewMutation>;
export const CreateEventReviewDocument = gql`
    mutation CreateEventReview($event_id: Int!, $input: ReviewInput!) {
  createEventReview(event_id: $event_id, input: $input) {
    ...ReviewFields
  }
}
    ${ReviewFieldsFragmentDoc}`;

/**
 * __useCreateEventReviewMutation__
 *
 * To run a mutation, you first call `useCreateEventReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateEventReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createEventReviewMutation, { data, loading, error }] = useCreateEventReviewMutation({
 *   variables: {
 *      event_id: // value for 'event_id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateEventReviewMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateEventReviewMutation, CreateEventReviewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateEventReviewMutation, CreateEventReviewMutationVariables>(CreateEventReviewDocument, options);
      }
export type CreateEventReviewMutationHookResult = ReturnType<typeof useCreateEventReviewMutation>;
export type CreateEventReviewMutationResult = ApolloReactCommon.MutationResult<CreateEventReviewMutation>;
export const UpdateReviewDocument = gql`
    mutation UpdateReview($id: Int!, $input: ReviewInput!) {
  updateReview(id: $id, input: $input) {
    ...ReviewFields
  }
}
    ${ReviewFieldsFragmentDoc}`;

/**
 * __useUpdateReviewMutation__
 *
 * To run a mutation, you first call `useUpdateReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateReviewMutation, { data, loading, error }] = useUpdateReviewMutation({
 *   variables: {
 *      id: // value for 'id'
 *      input: // value for 'input'
 *   },
 * });
 */
export function useUpdateReviewMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<UpdateReviewMutation, UpdateReviewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<UpdateReviewMutation, UpdateReviewMutationVariables>(UpdateReviewDocument, options);
      }
export type UpdateReviewMutationHookResult = ReturnType<typeof useUpdateReviewMutation>;
export type UpdateReviewMutationResult = ApolloReactCommon.MutationResult<UpdateReviewMutation>;
export const DeleteReviewDocument = gql`
    mutation DeleteReview($id: Int!) {
  deleteReview(id: $id)
}
    `;

/**
 * __useDeleteReviewMutation__
 *
 * To run a mutation, you first call `useDeleteReviewMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteReviewMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteReviewMutation, { data, loading, error }] = useDeleteReviewMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useDeleteReviewMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<DeleteReviewMutation, DeleteReviewMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<DeleteReviewMutation, DeleteReviewMutationVariables>(DeleteReviewDocument, options);
      }
export type DeleteReviewMutationHookResult = ReturnType<typeof useDeleteReviewMutation>;
export type DeleteReviewMutationResult = ApolloReactCommon.MutationResult<DeleteReviewMutation>;
export const CreateReviewImageUploadDocument = gql`
    mutation CreateReviewImageUpload($input: ReviewUploadInput!) {
  createReviewImageUpload(input: $input) {
    upload_url
    public_url
    key
  }
}
    `;

/**
 * __useCreateReviewImageUploadMutation__
 *
 * To run a mutation, you first call `useCreateReviewImageUploadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateReviewImageUploadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createReviewImageUploadMutation, { data, loading, error }] = useCreateReviewImageUploadMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useCreateReviewImageUploadMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateReviewImageUploadMutation, CreateReviewImageUploadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateReviewImageUploadMutation, CreateReviewImageUploadMutationVariables>(CreateReviewImageUploadDocument, options);
      }
export type CreateReviewImageUploadMutationHookResult = ReturnType<typeof useCreateReviewImageUploadMutation>;
export type CreateReviewImageUploadMutationResult = ApolloReactCommon.MutationResult<CreateReviewImageUploadMutation>;
export const ProductReviewsDocument = gql`
    query ProductReviews($product_id: Int!, $page: Int, $limit: Int) {
  productReviews(product_id: $product_id, page: $page, limit: $limit) {
    items {
      ...ReviewFields
    }
    page_info {
      total
      page
      limit
      has_more
    }
    summary {
      ...ReviewSummaryFields
    }
  }
}
    ${ReviewFieldsFragmentDoc}
${ReviewSummaryFieldsFragmentDoc}`;

/**
 * __useProductReviewsQuery__
 *
 * To run a query within a React component, call `useProductReviewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductReviewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductReviewsQuery({
 *   variables: {
 *      product_id: // value for 'product_id'
 *      page: // value for 'page'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useProductReviewsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<ProductReviewsQuery, ProductReviewsQueryVariables> & ({ variables: ProductReviewsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ProductReviewsQuery, ProductReviewsQueryVariables>(ProductReviewsDocument, options);
      }
export function useProductReviewsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ProductReviewsQuery, ProductReviewsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ProductReviewsQuery, ProductReviewsQueryVariables>(ProductReviewsDocument, options);
        }
export type ProductReviewsQueryHookResult = ReturnType<typeof useProductReviewsQuery>;
export type ProductReviewsLazyQueryHookResult = ReturnType<typeof useProductReviewsLazyQuery>;
export type ProductReviewsQueryResult = ApolloReactCommon.QueryResult<ProductReviewsQuery, ProductReviewsQueryVariables>;
export const EventReviewsDocument = gql`
    query EventReviews($event_id: Int!, $page: Int, $limit: Int) {
  eventReviews(event_id: $event_id, page: $page, limit: $limit) {
    items {
      ...ReviewFields
    }
    page_info {
      total
      page
      limit
      has_more
    }
    summary {
      ...ReviewSummaryFields
    }
  }
}
    ${ReviewFieldsFragmentDoc}
${ReviewSummaryFieldsFragmentDoc}`;

/**
 * __useEventReviewsQuery__
 *
 * To run a query within a React component, call `useEventReviewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useEventReviewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEventReviewsQuery({
 *   variables: {
 *      event_id: // value for 'event_id'
 *      page: // value for 'page'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useEventReviewsQuery(baseOptions: ApolloReactHooks.QueryHookOptions<EventReviewsQuery, EventReviewsQueryVariables> & ({ variables: EventReviewsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<EventReviewsQuery, EventReviewsQueryVariables>(EventReviewsDocument, options);
      }
export function useEventReviewsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<EventReviewsQuery, EventReviewsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<EventReviewsQuery, EventReviewsQueryVariables>(EventReviewsDocument, options);
        }
export type EventReviewsQueryHookResult = ReturnType<typeof useEventReviewsQuery>;
export type EventReviewsLazyQueryHookResult = ReturnType<typeof useEventReviewsLazyQuery>;
export type EventReviewsQueryResult = ApolloReactCommon.QueryResult<EventReviewsQuery, EventReviewsQueryVariables>;
export const ProductReviewEligibilityDocument = gql`
    query ProductReviewEligibility($slug: String!) {
  product(slug: $slug) {
    id
    review_eligibility {
      ...ReviewEligibilityFields
    }
  }
}
    ${ReviewEligibilityFieldsFragmentDoc}
${ReviewFieldsFragmentDoc}`;

/**
 * __useProductReviewEligibilityQuery__
 *
 * To run a query within a React component, call `useProductReviewEligibilityQuery` and pass it any options that fit your needs.
 * When your component renders, `useProductReviewEligibilityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useProductReviewEligibilityQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useProductReviewEligibilityQuery(baseOptions: ApolloReactHooks.QueryHookOptions<ProductReviewEligibilityQuery, ProductReviewEligibilityQueryVariables> & ({ variables: ProductReviewEligibilityQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<ProductReviewEligibilityQuery, ProductReviewEligibilityQueryVariables>(ProductReviewEligibilityDocument, options);
      }
export function useProductReviewEligibilityLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<ProductReviewEligibilityQuery, ProductReviewEligibilityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<ProductReviewEligibilityQuery, ProductReviewEligibilityQueryVariables>(ProductReviewEligibilityDocument, options);
        }
export type ProductReviewEligibilityQueryHookResult = ReturnType<typeof useProductReviewEligibilityQuery>;
export type ProductReviewEligibilityLazyQueryHookResult = ReturnType<typeof useProductReviewEligibilityLazyQuery>;
export type ProductReviewEligibilityQueryResult = ApolloReactCommon.QueryResult<ProductReviewEligibilityQuery, ProductReviewEligibilityQueryVariables>;
export const EventReviewEligibilityDocument = gql`
    query EventReviewEligibility($slug: String!) {
  event(slug: $slug) {
    id
    review_eligibility {
      ...ReviewEligibilityFields
    }
  }
}
    ${ReviewEligibilityFieldsFragmentDoc}
${ReviewFieldsFragmentDoc}`;

/**
 * __useEventReviewEligibilityQuery__
 *
 * To run a query within a React component, call `useEventReviewEligibilityQuery` and pass it any options that fit your needs.
 * When your component renders, `useEventReviewEligibilityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useEventReviewEligibilityQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useEventReviewEligibilityQuery(baseOptions: ApolloReactHooks.QueryHookOptions<EventReviewEligibilityQuery, EventReviewEligibilityQueryVariables> & ({ variables: EventReviewEligibilityQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<EventReviewEligibilityQuery, EventReviewEligibilityQueryVariables>(EventReviewEligibilityDocument, options);
      }
export function useEventReviewEligibilityLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<EventReviewEligibilityQuery, EventReviewEligibilityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<EventReviewEligibilityQuery, EventReviewEligibilityQueryVariables>(EventReviewEligibilityDocument, options);
        }
export type EventReviewEligibilityQueryHookResult = ReturnType<typeof useEventReviewEligibilityQuery>;
export type EventReviewEligibilityLazyQueryHookResult = ReturnType<typeof useEventReviewEligibilityLazyQuery>;
export type EventReviewEligibilityQueryResult = ApolloReactCommon.QueryResult<EventReviewEligibilityQuery, EventReviewEligibilityQueryVariables>;
export const RecentReviewsDocument = gql`
    query RecentReviews($limit: Int) {
  recentReviews(limit: $limit) {
    ...ReviewFields
  }
}
    ${ReviewFieldsFragmentDoc}`;

/**
 * __useRecentReviewsQuery__
 *
 * To run a query within a React component, call `useRecentReviewsQuery` and pass it any options that fit your needs.
 * When your component renders, `useRecentReviewsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useRecentReviewsQuery({
 *   variables: {
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useRecentReviewsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<RecentReviewsQuery, RecentReviewsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<RecentReviewsQuery, RecentReviewsQueryVariables>(RecentReviewsDocument, options);
      }
export function useRecentReviewsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<RecentReviewsQuery, RecentReviewsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<RecentReviewsQuery, RecentReviewsQueryVariables>(RecentReviewsDocument, options);
        }
export type RecentReviewsQueryHookResult = ReturnType<typeof useRecentReviewsQuery>;
export type RecentReviewsLazyQueryHookResult = ReturnType<typeof useRecentReviewsLazyQuery>;
export type RecentReviewsQueryResult = ApolloReactCommon.QueryResult<RecentReviewsQuery, RecentReviewsQueryVariables>;
export const SiteSettingsDocument = gql`
    query SiteSettings {
  siteSettings {
    contact_phone
    whatsapp_number
    contact_email
    address
    opening_hours
    instagram_url
    facebook_url
    youtube_url
    shipping_flat_fee
    free_shipping_above
    dispatch_days_min
    dispatch_days_max
    announcement_text
    announcement_href
    hero_heading
    hero_subheading
    hero_image_url
    hero_cta_text
    hero_cta_href
  }
}
    `;

/**
 * __useSiteSettingsQuery__
 *
 * To run a query within a React component, call `useSiteSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useSiteSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSiteSettingsQuery({
 *   variables: {
 *   },
 * });
 */
export function useSiteSettingsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<SiteSettingsQuery, SiteSettingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<SiteSettingsQuery, SiteSettingsQueryVariables>(SiteSettingsDocument, options);
      }
export function useSiteSettingsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SiteSettingsQuery, SiteSettingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<SiteSettingsQuery, SiteSettingsQueryVariables>(SiteSettingsDocument, options);
        }
export type SiteSettingsQueryHookResult = ReturnType<typeof useSiteSettingsQuery>;
export type SiteSettingsLazyQueryHookResult = ReturnType<typeof useSiteSettingsLazyQuery>;
export type SiteSettingsQueryResult = ApolloReactCommon.QueryResult<SiteSettingsQuery, SiteSettingsQueryVariables>;
export const SuggestDocument = gql`
    query Suggest($q: String!) {
  suggest(q: $q) {
    pieces {
      id
      slug
      name
      price
      image_url
      is_archived
    }
    events {
      id
      slug
      title
      starts_at
    }
    workshops {
      id
      slug
      name
    }
  }
}
    `;

/**
 * __useSuggestQuery__
 *
 * To run a query within a React component, call `useSuggestQuery` and pass it any options that fit your needs.
 * When your component renders, `useSuggestQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useSuggestQuery({
 *   variables: {
 *      q: // value for 'q'
 *   },
 * });
 */
export function useSuggestQuery(baseOptions: ApolloReactHooks.QueryHookOptions<SuggestQuery, SuggestQueryVariables> & ({ variables: SuggestQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<SuggestQuery, SuggestQueryVariables>(SuggestDocument, options);
      }
export function useSuggestLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<SuggestQuery, SuggestQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<SuggestQuery, SuggestQueryVariables>(SuggestDocument, options);
        }
export type SuggestQueryHookResult = ReturnType<typeof useSuggestQuery>;
export type SuggestLazyQueryHookResult = ReturnType<typeof useSuggestLazyQuery>;
export type SuggestQueryResult = ApolloReactCommon.QueryResult<SuggestQuery, SuggestQueryVariables>;
export const CreateCustomizationUploadDocument = gql`
    mutation CreateCustomizationUpload($content_type: String!, $size: Int!) {
  createCustomizationUpload(content_type: $content_type, size: $size) {
    upload_url
    public_url
    key
  }
}
    `;

/**
 * __useCreateCustomizationUploadMutation__
 *
 * To run a mutation, you first call `useCreateCustomizationUploadMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateCustomizationUploadMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createCustomizationUploadMutation, { data, loading, error }] = useCreateCustomizationUploadMutation({
 *   variables: {
 *      content_type: // value for 'content_type'
 *      size: // value for 'size'
 *   },
 * });
 */
export function useCreateCustomizationUploadMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CreateCustomizationUploadMutation, CreateCustomizationUploadMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CreateCustomizationUploadMutation, CreateCustomizationUploadMutationVariables>(CreateCustomizationUploadDocument, options);
      }
export type CreateCustomizationUploadMutationHookResult = ReturnType<typeof useCreateCustomizationUploadMutation>;
export type CreateCustomizationUploadMutationResult = ApolloReactCommon.MutationResult<CreateCustomizationUploadMutation>;
export const StudioVisitAvailabilityDocument = gql`
    query StudioVisitAvailability($from: String, $days: Int) {
  studioVisitAvailability(from: $from, days: $days) {
    date
    weekday
    is_closed
    reason
    windows {
      starts_at
      ends_at
      is_available
      reason
    }
  }
}
    `;

/**
 * __useStudioVisitAvailabilityQuery__
 *
 * To run a query within a React component, call `useStudioVisitAvailabilityQuery` and pass it any options that fit your needs.
 * When your component renders, `useStudioVisitAvailabilityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useStudioVisitAvailabilityQuery({
 *   variables: {
 *      from: // value for 'from'
 *      days: // value for 'days'
 *   },
 * });
 */
export function useStudioVisitAvailabilityQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<StudioVisitAvailabilityQuery, StudioVisitAvailabilityQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<StudioVisitAvailabilityQuery, StudioVisitAvailabilityQueryVariables>(StudioVisitAvailabilityDocument, options);
      }
export function useStudioVisitAvailabilityLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<StudioVisitAvailabilityQuery, StudioVisitAvailabilityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<StudioVisitAvailabilityQuery, StudioVisitAvailabilityQueryVariables>(StudioVisitAvailabilityDocument, options);
        }
export type StudioVisitAvailabilityQueryHookResult = ReturnType<typeof useStudioVisitAvailabilityQuery>;
export type StudioVisitAvailabilityLazyQueryHookResult = ReturnType<typeof useStudioVisitAvailabilityLazyQuery>;
export type StudioVisitAvailabilityQueryResult = ApolloReactCommon.QueryResult<StudioVisitAvailabilityQuery, StudioVisitAvailabilityQueryVariables>;
export const BookStudioVisitDocument = gql`
    mutation BookStudioVisit($input: StudioVisitInput!) {
  bookStudioVisit(input: $input) {
    id
    starts_at
    ends_at
    name
  }
}
    `;

/**
 * __useBookStudioVisitMutation__
 *
 * To run a mutation, you first call `useBookStudioVisitMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBookStudioVisitMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bookStudioVisitMutation, { data, loading, error }] = useBookStudioVisitMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBookStudioVisitMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<BookStudioVisitMutation, BookStudioVisitMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<BookStudioVisitMutation, BookStudioVisitMutationVariables>(BookStudioVisitDocument, options);
      }
export type BookStudioVisitMutationHookResult = ReturnType<typeof useBookStudioVisitMutation>;
export type BookStudioVisitMutationResult = ApolloReactCommon.MutationResult<BookStudioVisitMutation>;
export const WishlistDocument = gql`
    query Wishlist {
  wishlist {
    ...ProductCard
  }
}
    ${ProductCardFragmentDoc}
${GlazeCardFragmentDoc}`;

/**
 * __useWishlistQuery__
 *
 * To run a query within a React component, call `useWishlistQuery` and pass it any options that fit your needs.
 * When your component renders, `useWishlistQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWishlistQuery({
 *   variables: {
 *   },
 * });
 */
export function useWishlistQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<WishlistQuery, WishlistQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<WishlistQuery, WishlistQueryVariables>(WishlistDocument, options);
      }
export function useWishlistLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<WishlistQuery, WishlistQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<WishlistQuery, WishlistQueryVariables>(WishlistDocument, options);
        }
export type WishlistQueryHookResult = ReturnType<typeof useWishlistQuery>;
export type WishlistLazyQueryHookResult = ReturnType<typeof useWishlistLazyQuery>;
export type WishlistQueryResult = ApolloReactCommon.QueryResult<WishlistQuery, WishlistQueryVariables>;
export const WishlistIdsDocument = gql`
    query WishlistIds {
  wishlistIds
}
    `;

/**
 * __useWishlistIdsQuery__
 *
 * To run a query within a React component, call `useWishlistIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useWishlistIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWishlistIdsQuery({
 *   variables: {
 *   },
 * });
 */
export function useWishlistIdsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<WishlistIdsQuery, WishlistIdsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<WishlistIdsQuery, WishlistIdsQueryVariables>(WishlistIdsDocument, options);
      }
export function useWishlistIdsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<WishlistIdsQuery, WishlistIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<WishlistIdsQuery, WishlistIdsQueryVariables>(WishlistIdsDocument, options);
        }
export type WishlistIdsQueryHookResult = ReturnType<typeof useWishlistIdsQuery>;
export type WishlistIdsLazyQueryHookResult = ReturnType<typeof useWishlistIdsLazyQuery>;
export type WishlistIdsQueryResult = ApolloReactCommon.QueryResult<WishlistIdsQuery, WishlistIdsQueryVariables>;
export const ToggleWishlistDocument = gql`
    mutation ToggleWishlist($productId: Int!) {
  toggleWishlist(product_id: $productId) {
    product_id
    is_wishlisted
    wishlist_count
  }
}
    `;

/**
 * __useToggleWishlistMutation__
 *
 * To run a mutation, you first call `useToggleWishlistMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useToggleWishlistMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [toggleWishlistMutation, { data, loading, error }] = useToggleWishlistMutation({
 *   variables: {
 *      productId: // value for 'productId'
 *   },
 * });
 */
export function useToggleWishlistMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<ToggleWishlistMutation, ToggleWishlistMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<ToggleWishlistMutation, ToggleWishlistMutationVariables>(ToggleWishlistDocument, options);
      }
export type ToggleWishlistMutationHookResult = ReturnType<typeof useToggleWishlistMutation>;
export type ToggleWishlistMutationResult = ApolloReactCommon.MutationResult<ToggleWishlistMutation>;
export const WorkshopsDocument = gql`
    query Workshops {
  workshops {
    ...WorkshopConfigFields
  }
}
    ${WorkshopConfigFieldsFragmentDoc}`;

/**
 * __useWorkshopsQuery__
 *
 * To run a query within a React component, call `useWorkshopsQuery` and pass it any options that fit your needs.
 * When your component renders, `useWorkshopsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWorkshopsQuery({
 *   variables: {
 *   },
 * });
 */
export function useWorkshopsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<WorkshopsQuery, WorkshopsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<WorkshopsQuery, WorkshopsQueryVariables>(WorkshopsDocument, options);
      }
export function useWorkshopsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<WorkshopsQuery, WorkshopsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<WorkshopsQuery, WorkshopsQueryVariables>(WorkshopsDocument, options);
        }
export type WorkshopsQueryHookResult = ReturnType<typeof useWorkshopsQuery>;
export type WorkshopsLazyQueryHookResult = ReturnType<typeof useWorkshopsLazyQuery>;
export type WorkshopsQueryResult = ApolloReactCommon.QueryResult<WorkshopsQuery, WorkshopsQueryVariables>;
export const WorkshopDocument = gql`
    query Workshop($slug: String!) {
  workshop(slug: $slug) {
    ...WorkshopConfigFields
  }
}
    ${WorkshopConfigFieldsFragmentDoc}`;

/**
 * __useWorkshopQuery__
 *
 * To run a query within a React component, call `useWorkshopQuery` and pass it any options that fit your needs.
 * When your component renders, `useWorkshopQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWorkshopQuery({
 *   variables: {
 *      slug: // value for 'slug'
 *   },
 * });
 */
export function useWorkshopQuery(baseOptions: ApolloReactHooks.QueryHookOptions<WorkshopQuery, WorkshopQueryVariables> & ({ variables: WorkshopQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<WorkshopQuery, WorkshopQueryVariables>(WorkshopDocument, options);
      }
export function useWorkshopLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<WorkshopQuery, WorkshopQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<WorkshopQuery, WorkshopQueryVariables>(WorkshopDocument, options);
        }
export type WorkshopQueryHookResult = ReturnType<typeof useWorkshopQuery>;
export type WorkshopLazyQueryHookResult = ReturnType<typeof useWorkshopLazyQuery>;
export type WorkshopQueryResult = ApolloReactCommon.QueryResult<WorkshopQuery, WorkshopQueryVariables>;
export const WorkshopAvailabilityDocument = gql`
    query WorkshopAvailability($input: WorkshopAvailabilityInput!) {
  workshopAvailability(input: $input) {
    date
    weekday
    is_closed
    reason
    slots {
      starts_at
      ends_at
      remaining
      is_available
      reason
    }
  }
}
    `;

/**
 * __useWorkshopAvailabilityQuery__
 *
 * To run a query within a React component, call `useWorkshopAvailabilityQuery` and pass it any options that fit your needs.
 * When your component renders, `useWorkshopAvailabilityQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWorkshopAvailabilityQuery({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useWorkshopAvailabilityQuery(baseOptions: ApolloReactHooks.QueryHookOptions<WorkshopAvailabilityQuery, WorkshopAvailabilityQueryVariables> & ({ variables: WorkshopAvailabilityQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<WorkshopAvailabilityQuery, WorkshopAvailabilityQueryVariables>(WorkshopAvailabilityDocument, options);
      }
export function useWorkshopAvailabilityLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<WorkshopAvailabilityQuery, WorkshopAvailabilityQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<WorkshopAvailabilityQuery, WorkshopAvailabilityQueryVariables>(WorkshopAvailabilityDocument, options);
        }
export type WorkshopAvailabilityQueryHookResult = ReturnType<typeof useWorkshopAvailabilityQuery>;
export type WorkshopAvailabilityLazyQueryHookResult = ReturnType<typeof useWorkshopAvailabilityLazyQuery>;
export type WorkshopAvailabilityQueryResult = ApolloReactCommon.QueryResult<WorkshopAvailabilityQuery, WorkshopAvailabilityQueryVariables>;
export const BookWorkshopDocument = gql`
    mutation BookWorkshop($input: BookWorkshopInput!) {
  bookWorkshop(input: $input) {
    ...WorkshopBookingFields
  }
}
    ${WorkshopBookingFieldsFragmentDoc}
${WorkshopConfigFieldsFragmentDoc}`;

/**
 * __useBookWorkshopMutation__
 *
 * To run a mutation, you first call `useBookWorkshopMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBookWorkshopMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bookWorkshopMutation, { data, loading, error }] = useBookWorkshopMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useBookWorkshopMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<BookWorkshopMutation, BookWorkshopMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<BookWorkshopMutation, BookWorkshopMutationVariables>(BookWorkshopDocument, options);
      }
export type BookWorkshopMutationHookResult = ReturnType<typeof useBookWorkshopMutation>;
export type BookWorkshopMutationResult = ApolloReactCommon.MutationResult<BookWorkshopMutation>;
export const RescheduleWorkshopBookingDocument = gql`
    mutation RescheduleWorkshopBooking($input: RescheduleWorkshopInput!) {
  rescheduleWorkshopBooking(input: $input) {
    ...WorkshopBookingFields
  }
}
    ${WorkshopBookingFieldsFragmentDoc}
${WorkshopConfigFieldsFragmentDoc}`;

/**
 * __useRescheduleWorkshopBookingMutation__
 *
 * To run a mutation, you first call `useRescheduleWorkshopBookingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useRescheduleWorkshopBookingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [rescheduleWorkshopBookingMutation, { data, loading, error }] = useRescheduleWorkshopBookingMutation({
 *   variables: {
 *      input: // value for 'input'
 *   },
 * });
 */
export function useRescheduleWorkshopBookingMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<RescheduleWorkshopBookingMutation, RescheduleWorkshopBookingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<RescheduleWorkshopBookingMutation, RescheduleWorkshopBookingMutationVariables>(RescheduleWorkshopBookingDocument, options);
      }
export type RescheduleWorkshopBookingMutationHookResult = ReturnType<typeof useRescheduleWorkshopBookingMutation>;
export type RescheduleWorkshopBookingMutationResult = ApolloReactCommon.MutationResult<RescheduleWorkshopBookingMutation>;
export const MyWorkshopBookingsDocument = gql`
    query MyWorkshopBookings($page: Int, $limit: Int) {
  myWorkshopBookings(page: $page, limit: $limit) {
    items {
      ...WorkshopBookingFields
    }
    page_info {
      total
      page
      limit
      has_more
    }
  }
}
    ${WorkshopBookingFieldsFragmentDoc}
${WorkshopConfigFieldsFragmentDoc}`;

/**
 * __useMyWorkshopBookingsQuery__
 *
 * To run a query within a React component, call `useMyWorkshopBookingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useMyWorkshopBookingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useMyWorkshopBookingsQuery({
 *   variables: {
 *      page: // value for 'page'
 *      limit: // value for 'limit'
 *   },
 * });
 */
export function useMyWorkshopBookingsQuery(baseOptions?: ApolloReactHooks.QueryHookOptions<MyWorkshopBookingsQuery, MyWorkshopBookingsQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<MyWorkshopBookingsQuery, MyWorkshopBookingsQueryVariables>(MyWorkshopBookingsDocument, options);
      }
export function useMyWorkshopBookingsLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<MyWorkshopBookingsQuery, MyWorkshopBookingsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<MyWorkshopBookingsQuery, MyWorkshopBookingsQueryVariables>(MyWorkshopBookingsDocument, options);
        }
export type MyWorkshopBookingsQueryHookResult = ReturnType<typeof useMyWorkshopBookingsQuery>;
export type MyWorkshopBookingsLazyQueryHookResult = ReturnType<typeof useMyWorkshopBookingsLazyQuery>;
export type MyWorkshopBookingsQueryResult = ApolloReactCommon.QueryResult<MyWorkshopBookingsQuery, MyWorkshopBookingsQueryVariables>;
export const WorkshopBookingDocument = gql`
    query WorkshopBooking($id: String!) {
  workshopBooking(id: $id) {
    ...WorkshopBookingFields
  }
}
    ${WorkshopBookingFieldsFragmentDoc}
${WorkshopConfigFieldsFragmentDoc}`;

/**
 * __useWorkshopBookingQuery__
 *
 * To run a query within a React component, call `useWorkshopBookingQuery` and pass it any options that fit your needs.
 * When your component renders, `useWorkshopBookingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useWorkshopBookingQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useWorkshopBookingQuery(baseOptions: ApolloReactHooks.QueryHookOptions<WorkshopBookingQuery, WorkshopBookingQueryVariables> & ({ variables: WorkshopBookingQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useQuery<WorkshopBookingQuery, WorkshopBookingQueryVariables>(WorkshopBookingDocument, options);
      }
export function useWorkshopBookingLazyQuery(baseOptions?: ApolloReactHooks.LazyQueryHookOptions<WorkshopBookingQuery, WorkshopBookingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return ApolloReactHooks.useLazyQuery<WorkshopBookingQuery, WorkshopBookingQueryVariables>(WorkshopBookingDocument, options);
        }
export type WorkshopBookingQueryHookResult = ReturnType<typeof useWorkshopBookingQuery>;
export type WorkshopBookingLazyQueryHookResult = ReturnType<typeof useWorkshopBookingLazyQuery>;
export type WorkshopBookingQueryResult = ApolloReactCommon.QueryResult<WorkshopBookingQuery, WorkshopBookingQueryVariables>;
export const CancelWorkshopBookingDocument = gql`
    mutation CancelWorkshopBooking($id: String!, $reason: String) {
  cancelWorkshopBooking(id: $id, reason: $reason) {
    ...WorkshopBookingFields
  }
}
    ${WorkshopBookingFieldsFragmentDoc}
${WorkshopConfigFieldsFragmentDoc}`;

/**
 * __useCancelWorkshopBookingMutation__
 *
 * To run a mutation, you first call `useCancelWorkshopBookingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCancelWorkshopBookingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [cancelWorkshopBookingMutation, { data, loading, error }] = useCancelWorkshopBookingMutation({
 *   variables: {
 *      id: // value for 'id'
 *      reason: // value for 'reason'
 *   },
 * });
 */
export function useCancelWorkshopBookingMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<CancelWorkshopBookingMutation, CancelWorkshopBookingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<CancelWorkshopBookingMutation, CancelWorkshopBookingMutationVariables>(CancelWorkshopBookingDocument, options);
      }
export type CancelWorkshopBookingMutationHookResult = ReturnType<typeof useCancelWorkshopBookingMutation>;
export type CancelWorkshopBookingMutationResult = ApolloReactCommon.MutationResult<CancelWorkshopBookingMutation>;