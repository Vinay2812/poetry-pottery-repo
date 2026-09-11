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
  clearCart: Cart;
  moveWishlistItemToCart: Cart;
  removeCartItem: Cart;
  toggleWishlist: WishlistToggleResult;
  updateCartItem: Cart;
};


export type MutationAddToCartArgs = {
  input: AddToCartInput;
};


export type MutationMoveWishlistItemToCartArgs = {
  product_id: Scalars['Int']['input'];
};


export type MutationRemoveCartItemArgs = {
  id: Scalars['Int']['input'];
};


export type MutationToggleWishlistArgs = {
  product_id: Scalars['Int']['input'];
};


export type MutationUpdateCartItemArgs = {
  id: Scalars['Int']['input'];
  quantity: Scalars['Int']['input'];
};

export enum OptionGroupKind {
  Choice = 'CHOICE',
  Text = 'TEXT'
}

export type PageInfo = {
  __typename?: 'PageInfo';
  has_more: Scalars['Boolean']['output'];
  limit: Scalars['Int']['output'];
  page: Scalars['Int']['output'];
  total: Scalars['Int']['output'];
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
  cart: Cart;
  categories: Array<Category>;
  collection: Collection;
  collections: Array<Collection>;
  featuredProducts: Array<Product>;
  product: Product;
  products: ProductsResult;
  relatedProducts: Array<Product>;
  siteSettings: SiteSettings;
  users: UsersResponse;
  wishlist: Array<Product>;
  wishlistIds: Array<Scalars['Int']['output']>;
};


export type QueryCollectionArgs = {
  slug: Scalars['String']['input'];
};


export type QueryFeaturedProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
};


export type QueryProductArgs = {
  slug: Scalars['String']['input'];
};


export type QueryProductsArgs = {
  filter?: InputMaybe<ProductsFilterInput>;
};


export type QueryRelatedProductsArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  slug: Scalars['String']['input'];
};


export type QueryUsersArgs = {
  limit?: InputMaybe<Scalars['Int']['input']>;
  page?: InputMaybe<Scalars['Int']['input']>;
};

export type SelectionInputType = {
  group_id: Scalars['Int']['input'];
  option_id?: InputMaybe<Scalars['Int']['input']>;
  text?: InputMaybe<Scalars['String']['input']>;
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

export type CartFieldsFragment = { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, ends_at: string | null } | null } }> };

export type CartQueryVariables = Exact<{ [key: string]: never; }>;


export type CartQuery = { cart: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, ends_at: string | null } | null } }> } };

export type AddToCartMutationVariables = Exact<{
  input: AddToCartInput;
}>;


export type AddToCartMutation = { addToCart: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, ends_at: string | null } | null } }> } };

export type UpdateCartItemMutationVariables = Exact<{
  id: number;
  quantity: number;
}>;


export type UpdateCartItemMutation = { updateCartItem: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, ends_at: string | null } | null } }> } };

export type RemoveCartItemMutationVariables = Exact<{
  id: number;
}>;


export type RemoveCartItemMutation = { removeCartItem: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, ends_at: string | null } | null } }> } };

export type ClearCartMutationVariables = Exact<{ [key: string]: never; }>;


export type ClearCartMutation = { clearCart: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, ends_at: string | null } | null } }> } };

export type ProductCardFragment = { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, ends_at: string | null } | null };

export type ProductsQueryVariables = Exact<{
  filter?: ProductsFilterInput | null | undefined;
}>;


export type ProductsQuery = { products: { items: Array<{ id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, ends_at: string | null } | null }>, page_info: { total: number, page: number, limit: number, has_more: boolean }, facets: { price_min: number, price_max: number, categories: Array<{ value: string, label: string, count: number }>, materials: Array<{ value: string, label: string, count: number }> } } };

export type ProductQueryVariables = Exact<{
  slug: string;
}>;


export type ProductQuery = { product: { description: string, dimensions: string | null, care_notes: Array<string>, sales_count: number, id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, categories: Array<{ id: number, slug: string, name: string }>, option_groups: Array<{ id: number, name: string, kind: OptionGroupKind, is_required: boolean, price_modifier: number, max_length: number | null, options: Array<{ id: number, name: string, price_modifier: number }> }>, collection: { id: number, slug: string, name: string, ends_at: string | null } | null } };

export type RelatedProductsQueryVariables = Exact<{
  slug: string;
  limit?: number | null | undefined;
}>;


export type RelatedProductsQuery = { relatedProducts: Array<{ id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, ends_at: string | null } | null }> };

export type FeaturedProductsQueryVariables = Exact<{
  limit?: number | null | undefined;
}>;


export type FeaturedProductsQuery = { featuredProducts: Array<{ id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, ends_at: string | null } | null }> };

export type CategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type CategoriesQuery = { categories: Array<{ id: number, slug: string, name: string, icon: string | null, image_url: string | null, product_count: number }> };

export type CollectionsQueryVariables = Exact<{ [key: string]: never; }>;


export type CollectionsQuery = { collections: Array<{ id: number, slug: string, name: string, description: string | null, image_url: string | null, ends_at: string | null, product_count: number }> };

export type CollectionQueryVariables = Exact<{
  slug: string;
}>;


export type CollectionQuery = { collection: { id: number, slug: string, name: string, description: string | null, image_url: string | null, ends_at: string | null, product_count: number } };

export type SiteSettingsQueryVariables = Exact<{ [key: string]: never; }>;


export type SiteSettingsQuery = { siteSettings: { contact_phone: string, whatsapp_number: string, contact_email: string, address: string, opening_hours: string, instagram_url: string, facebook_url: string, youtube_url: string, shipping_flat_fee: number, free_shipping_above: number | null, announcement_text: string | null, announcement_href: string | null, hero_heading: string, hero_subheading: string, hero_image_url: string, hero_cta_text: string, hero_cta_href: string } };

export type WishlistQueryVariables = Exact<{ [key: string]: never; }>;


export type WishlistQuery = { wishlist: Array<{ id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, ends_at: string | null } | null }> };

export type WishlistIdsQueryVariables = Exact<{ [key: string]: never; }>;


export type WishlistIdsQuery = { wishlistIds: Array<number> };

export type ToggleWishlistMutationVariables = Exact<{
  productId: number;
}>;


export type ToggleWishlistMutation = { toggleWishlist: { product_id: number, is_wishlisted: boolean, wishlist_count: number } };

export type MoveWishlistItemToCartMutationVariables = Exact<{
  productId: number;
}>;


export type MoveWishlistItemToCartMutation = { moveWishlistItemToCart: { item_count: number, subtotal: number, shipping_fee: number, free_shipping_above: number | null, total: number, items: Array<{ id: number, quantity: number, unit_price: number, line_total: number, is_available: boolean, unavailable_reason: string | null, selections: Array<{ group_id: number, group_name: string, option_id: number | null, option_name: string | null, text: string | null, price_modifier: number }>, product: { id: number, slug: string, name: string, price: number, compare_at_price: number | null, material: string, color_name: string | null, color_code: string | null, image_urls: Array<string>, stock: number, is_featured: boolean, is_customizable: boolean, rating_avg: number, rating_count: number, collection: { id: number, slug: string, name: string, ends_at: string | null } | null } }> } };

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
  is_featured
  is_customizable
  rating_avg
  rating_count
  collection {
    id
    slug
    name
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
    query Collections {
  collections {
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
export const MoveWishlistItemToCartDocument = gql`
    mutation MoveWishlistItemToCart($productId: Int!) {
  moveWishlistItemToCart(product_id: $productId) {
    ...CartFields
  }
}
    ${CartFieldsFragmentDoc}
${ProductCardFragmentDoc}`;

/**
 * __useMoveWishlistItemToCartMutation__
 *
 * To run a mutation, you first call `useMoveWishlistItemToCartMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useMoveWishlistItemToCartMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [moveWishlistItemToCartMutation, { data, loading, error }] = useMoveWishlistItemToCartMutation({
 *   variables: {
 *      productId: // value for 'productId'
 *   },
 * });
 */
export function useMoveWishlistItemToCartMutation(baseOptions?: ApolloReactHooks.MutationHookOptions<MoveWishlistItemToCartMutation, MoveWishlistItemToCartMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return ApolloReactHooks.useMutation<MoveWishlistItemToCartMutation, MoveWishlistItemToCartMutationVariables>(MoveWishlistItemToCartDocument, options);
      }
export type MoveWishlistItemToCartMutationHookResult = ReturnType<typeof useMoveWishlistItemToCartMutation>;
export type MoveWishlistItemToCartMutationResult = ApolloReactCommon.MutationResult<MoveWishlistItemToCartMutation>;