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

export type AddToCartInput = {
  product_id: Scalars['Int']['input'];
  quantity?: InputMaybe<Scalars['Int']['input']>;
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

export type Mutation = {
  __typename?: 'Mutation';
  addToCart: Cart;
  bookWorkshop: WorkshopBooking;
  cancelOrder: Order;
  cancelRegistration: Registration;
  cancelWorkshopBooking: WorkshopBooking;
  clearCart: Cart;
  createAddress: Address;
  deleteAddress: Scalars['Boolean']['output'];
  markContactMessageRead: ContactMessage;
  placeOrder: Order;
  registerForEvent: Registration;
  removeCartItem: Cart;
  rescheduleWorkshopBooking: WorkshopBooking;
  sendContactMessage: Scalars['Boolean']['output'];
  setDefaultAddress: Address;
  subscribeToNewsletter: NewsletterResult;
  toggleWishlist: WishlistToggleResult;
  unsubscribeFromNewsletter: Scalars['Boolean']['output'];
  updateAddress: Address;
  updateCartItem: Cart;
  updateContentPage: ContentPage;
};


export type MutationAddToCartArgs = {
  input: AddToCartInput;
};


export type MutationBookWorkshopArgs = {
  input: BookWorkshopInput;
};


export type MutationCancelOrderArgs = {
  id: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCancelRegistrationArgs = {
  id: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCancelWorkshopBookingArgs = {
  id: Scalars['String']['input'];
  reason?: InputMaybe<Scalars['String']['input']>;
};


export type MutationCreateAddressArgs = {
  input: AddressInput;
};


export type MutationDeleteAddressArgs = {
  id: Scalars['Int']['input'];
};


export type MutationMarkContactMessageReadArgs = {
  id: Scalars['Int']['input'];
};


export type MutationPlaceOrderArgs = {
  input: PlaceOrderInput;
};


export type MutationRegisterForEventArgs = {
  input: RegisterForEventInput;
};


export type MutationRemoveCartItemArgs = {
  id: Scalars['Int']['input'];
};


export type MutationRescheduleWorkshopBookingArgs = {
  input: RescheduleWorkshopInput;
};


export type MutationSendContactMessageArgs = {
  input: ContactMessageInput;
};


export type MutationSetDefaultAddressArgs = {
  id: Scalars['Int']['input'];
};


export type MutationSubscribeToNewsletterArgs = {
  email: Scalars['String']['input'];
};


export type MutationToggleWishlistArgs = {
  product_id: Scalars['Int']['input'];
};


export type MutationUnsubscribeFromNewsletterArgs = {
  token: Scalars['String']['input'];
};


export type MutationUpdateAddressArgs = {
  id: Scalars['Int']['input'];
  input: AddressInput;
};


export type MutationUpdateCartItemArgs = {
  id: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
};


export type MutationUpdateContentPageArgs = {
  input: ContentPageInput;
  slug: Scalars['String']['input'];
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
  confirmed_at?: Maybe<Scalars['DateTime']['output']>;
  coupon_code?: Maybe<Scalars['String']['output']>;
  created_at: Scalars['DateTime']['output'];
  customer_note?: Maybe<Scalars['String']['output']>;
  delivered_at?: Maybe<Scalars['DateTime']['output']>;
  discount: Scalars['Int']['output'];
  id: Scalars['String']['output'];
  item_count: Scalars['Int']['output'];
  items: Array<OrderItem>;
  paid_at?: Maybe<Scalars['DateTime']['output']>;
  refunded_at?: Maybe<Scalars['DateTime']['output']>;
  shipped_at?: Maybe<Scalars['DateTime']['output']>;
  shipping_address: ShippingAddress;
  shipping_fee: Scalars['Int']['output'];
  status: OrderStatus;
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
  selections: Array<CartSelection>;
  unit_price: Scalars['Int']['output'];
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
};

export type Product = {
  __typename?: 'Product';
  care_notes: Array<Scalars['String']['output']>;
  categories: Array<CategoryRef>;
  collection?: Maybe<CollectionRef>;
  color_code?: Maybe<Scalars['String']['output']>;
  color_name?: Maybe<Scalars['String']['output']>;
  compare_at_price?: Maybe<Scalars['Int']['output']>;
  created_at: Scalars['DateTime']['output'];
  description: Scalars['String']['output'];
  dimensions?: Maybe<Scalars['String']['output']>;
  id: Scalars['Int']['output'];
  image_urls: Array<Scalars['String']['output']>;
  in_wishlist: Scalars['Boolean']['output'];
  is_active: Scalars['Boolean']['output'];
  is_archived: Scalars['Boolean']['output'];
  is_customizable: Scalars['Boolean']['output'];
  is_featured: Scalars['Boolean']['output'];
  material: Scalars['String']['output'];
  name: Scalars['String']['output'];
  option_groups: Array<ProductOptionGroup>;
  price: Scalars['Int']['output'];
  rating_avg: Scalars['Float']['output'];
  rating_count: Scalars['Int']['output'];
  sales_count: Scalars['Int']['output'];
  slug: Scalars['String']['output'];
  stock: Scalars['Int']['output'];
};

export type ProductFacets = {
  __typename?: 'ProductFacets';
  active_count: Scalars['Int']['output'];
  archive_count: Scalars['Int']['output'];
  categories: Array<FacetCount>;
  materials: Array<FacetCount>;
  price_max: Scalars['Int']['output'];
  price_min: Scalars['Int']['output'];
};

export type ProductOption = {
  __typename?: 'ProductOption';
  id: Scalars['Int']['output'];
  name: Scalars['String']['output'];
  price_modifier: Scalars['Int']['output'];
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
  in_stock_only?: InputMaybe<Scalars['Boolean']['input']>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  materials?: InputMaybe<Array<Scalars['String']['input']>>;
  max_price?: InputMaybe<Scalars['Int']['input']>;
  min_price?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
  search?: InputMaybe<Scalars['String']['input']>;
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
  cart: Cart;
  categories: Array<Category>;
  checkoutQuote: CheckoutQuote;
  collection: Collection;
  collections: Array<Collection>;
  contactMessages: ContactMessagesResult;
  contentPage: ContentPage;
  contentPages: Array<ContentPageSummary>;
  event: Event;
  events: EventsResult;
  featuredProducts: Array<Product>;
  myRegistrations: RegistrationsResult;
  myWorkshopBookings: WorkshopBookingsResult;
  newsletterStatus: NewsletterStatus;
  order: Order;
  orders: OrdersResult;
  product: Product;
  products: ProductsResult;
  registration: Registration;
  relatedProducts: Array<Product>;
  siteSettings: SiteSettings;
  upcomingEvents: Array<Event>;
  users: UsersResponse;
  wishlist: Array<Product>;
  wishlistIds: Array<Scalars['Int']['output']>;
  workshop: WorkshopConfig;
  workshopAvailability: Array<WorkshopDay>;
  workshopBooking: WorkshopBooking;
  workshops: Array<WorkshopConfig>;
};


export type QueryCheckoutQuoteArgs = {
  input?: InputMaybe<CheckoutQuoteInput>;
};


export type QueryCollectionArgs = {
  slug: Scalars['String']['input'];
};


export type QueryCollectionsArgs = {
  archive?: InputMaybe<Scalars['Boolean']['input']>;
};


export type QueryContactMessagesArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryContentPageArgs = {
  slug: Scalars['String']['input'];
};


export type QueryEventArgs = {
  slug: Scalars['String']['input'];
};


export type QueryEventsArgs = {
  filter?: InputMaybe<EventsFilterInput>;
};


export type QueryFeaturedProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
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


export type QueryProductsArgs = {
  filter?: InputMaybe<ProductsFilterInput>;
};


export type QueryRegistrationArgs = {
  id: Scalars['String']['input'];
};


export type QueryRelatedProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  slug: Scalars['String']['input'];
};


export type QueryUpcomingEventsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
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

export type User = {
  __typename?: 'User';
  auth_id: Scalars['String']['output'];
  created_at: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['Int']['output'];
  image?: Maybe<Scalars['String']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  phone?: Maybe<Scalars['String']['output']>;
  role: UserRole;
  updated_at: Scalars['DateTime']['output'];
};

export enum UserRole {
  Admin = 'ADMIN',
  User = 'USER'
}

export type UsersResponse = {
  __typename?: 'UsersResponse';
  items: Array<User>;
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
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

export type CartFieldsFragment = { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null } }> };

export type CartQueryVariables = Exact<{ [key: string]: never; }>;


export type CartQuery = { cart: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null } }> } };

export type AddToCartMutationVariables = Exact<{
  input: AddToCartInput;
}>;


export type AddToCartMutation = { addToCart: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null } }> } };

export type UpdateCartItemMutationVariables = Exact<{
  id: number;
  quantity: number;
}>;


export type UpdateCartItemMutation = { updateCartItem: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null } }> } };

export type RemoveCartItemMutationVariables = Exact<{
  id: number;
}>;


export type RemoveCartItemMutation = { removeCartItem: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null } }> } };

export type ClearCartMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearCartMutation = { clearCart: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null } }> } };

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

export type OrderFieldsFragment = { id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }> };

export type CheckoutQuoteQueryVariables = Exact<{
  input?: CheckoutQuoteInput | null | undefined;
}>;


export type CheckoutQuoteQuery = { checkoutQuote: { subtotal: number, discount: number, shipping_fee: number, total: number, item_count: number, coupon_code: string | null, coupon_message: string | null, problems: Array<string> } };

export type PlaceOrderMutationVariables = Exact<{
  input: PlaceOrderInput;
}>;


export type PlaceOrderMutation = { placeOrder: { id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }> } };

export type OrdersQueryVariables = Exact<{
  page?: number | null | undefined;
  limit?: number | null | undefined;
}>;


export type OrdersQuery = { orders: { items: Array<{ id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }> }>, page_info: { total: number, page: number, limit: number, has_more: boolean } } };

export type OrderQueryVariables = Exact<{
  id: string;
}>;


export type OrderQuery = { order: { id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }> } };

export type CancelOrderMutationVariables = Exact<{
  id: string;
  reason?: string | null | undefined;
}>;


export type CancelOrderMutation = { cancelOrder: { id: string, status: OrderStatus, subtotal: number, discount: number, shipping_fee: number, total: number, coupon_code: string | null, customer_note: string | null, tracking_note: string | null, cancel_reason: string | null, can_cancel: boolean, item_count: number, created_at: string, confirmed_at: string | null, paid_at: string | null, shipped_at: string | null, delivered_at: string | null, cancelled_at: string | null, refunded_at: string | null, shipping_address: { name: string, phone: string, line1: string, line2: string | null, landmark: string | null, city: string, state: string, pincode: string }, items: Array<{ id: number, product_name: string, product_image: string | null, unit_price: number, quantity: number, line_total: number, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, is_customizable: boolean } | null }> } };

export type ProductCardFragment = { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null };

export type ProductsQueryVariables = Exact<{
  filter?: ProductsFilterInput | null | undefined;
}>;


export type ProductsQuery = { products: { items: Array<{ id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null }>, page_info: { total: number, page: number, limit: number, has_more: boolean }, facets: { price_min: number, price_max: number, active_count: number, archive_count: number, categories: Array<{ value: string, label: string, count: number }>, materials: Array<{ value: string, label: string, count: number }> } } };

export type ProductQueryVariables = Exact<{
  slug: string;
}>;


export type ProductQuery = { product: { description: string, dimensions: string | null, care_notes: Array<string>, sales_count: number, id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, categories: Array<{ id: number, slug: string, name: string }>, option_groups: Array<{ id: number, name: string, kind: OptionGroupKind, is_required: boolean, price_modifier: number, max_length: number | null, options: Array<{ id: number, name: string, price_modifier: number }> }>, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null } };

export type RelatedProductsQueryVariables = Exact<{
  slug: string;
  limit?: number | null | undefined;
}>;


export type RelatedProductsQuery = { relatedProducts: Array<{ id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null }> };

export type FeaturedProductsQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export type FeaturedProductsQuery = { featuredProducts: Array<{ id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null }> };

export type CategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoriesQuery = { categories: Array<{ id: number, slug: string, name: string, icon: string | null, image_url: string | null, product_count: number }> };

export type CollectionsQueryVariables = Exact<{
  archive?: boolean | null | undefined;
}>;


export type CollectionsQuery = { collections: Array<{ id: number, slug: string, name: string, description: string | null, image_url: string | null, ends_at: string | null, product_count: number }> };

export type CollectionQueryVariables = Exact<{
  slug: string;
}>;


export type CollectionQuery = { collection: { id: number, slug: string, name: string, description: string | null, image_url: string | null, ends_at: string | null, product_count: number } };

export type SiteSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type SiteSettingsQuery = { siteSettings: { contact_phone: string, whatsapp_number: string, contact_email: string, address: string, opening_hours: string, instagram_url: string, facebook_url: string, youtube_url: string, shipping_flat_fee: number, free_shipping_above: number | null, announcement_text: string | null, announcement_href: string | null, hero_heading: string, hero_subheading: string, hero_image_url: string, hero_cta_text: string, hero_cta_href: string } };

export type WishlistQueryVariables = Exact<{ [key: string]: never; }>;


export type WishlistQuery = { wishlist: Array<{ id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_active: boolean, is_archived: boolean, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, starts_at: string | null, ends_at: string | null } | null }> };

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
  image_urls
  stock
  is_active
  is_archived
  is_featured
  is_customizable
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
  tracking_note
  cancel_reason
  can_cancel
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
    product {
      id
      slug
      is_customizable
    }
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
export const CartDocument = gql`
    query Cart {
  cart {
    ...CartFields
  }
}
    ${CartFieldsFragmentDoc}
${ProductCardFragmentDoc}`;

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
export const AddToCartDocument = gql`
    mutation AddToCart($input: AddToCartInput!) {
  addToCart(input: $input) {
    ...CartFields
  }
}
    ${CartFieldsFragmentDoc}
${ProductCardFragmentDoc}`;

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
${ProductCardFragmentDoc}`;

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
${ProductCardFragmentDoc}`;

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
${ProductCardFragmentDoc}`;

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
      materials {
        value
        label
        count
      }
      price_min
      price_max
      active_count
      archive_count
    }
  }
}
    ${ProductCardFragmentDoc}`;

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
    dimensions
    care_notes
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
    ${ProductCardFragmentDoc}`;

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
    ${ProductCardFragmentDoc}`;

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
    ${ProductCardFragmentDoc}`;

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
    query Collection($slug: String!) {
  collection(slug: $slug) {
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
export const WishlistDocument = gql`
    query Wishlist {
  wishlist {
    ...ProductCard
  }
}
    ${ProductCardFragmentDoc}`;

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