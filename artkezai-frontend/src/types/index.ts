export enum UserRole {
  BUYER = 'BUYER',
  ARTIST = 'ARTIST',
  ADMIN = 'ADMIN',
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  profileImageUrl?: string;
  bio?: string;
  country?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Public self-registration may only ever create BUYER or ARTIST accounts —
// narrowed from the full UserRole so the type system itself rules out
// {"role": "ADMIN"} here, without touching UserRole (used broadly across
// auth-domain types where the full 3-value enum is correct). The real
// enforcement is server-side (AuthService.register, Phase 2.14) — this is
// belt-and-suspenders on the one call site that ever sends this shape.
export type RegistrableRole = UserRole.BUYER | UserRole.ARTIST;

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: RegistrableRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export enum PaintingStatus {
  DRAFT = 'DRAFT',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  SOLD = 'SOLD',
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Medium {
  id: string;
  name: string;
}

export interface Country {
  id: string;
  name: string;
  code: string;
}

export interface PaintingImageDto {
  id: string;
  url: string;
  displayOrder: number;
  isPrimary: boolean;
}

// Mirrors the backend's PaintingListDto exactly (see PaintingListDto.java) — used
// for gallery cards, my-listings, and related-paintings, all of which receive the
// same flat list shape (image URLs, not a nested image object; no numeric ids).
export interface PaintingListDto {
  id: string;
  slug: string;
  title: string;
  price: number;
  currency: string;
  primaryImageUrl: string | null;
  thumbnailUrl: string | null;
  artistName: string;
  artistSlug: string;
  mediumName: string | null;
  categoryName: string | null;
  countryName: string | null;
  isOfferEnabled: boolean;
  status: PaintingStatus;
  createdAt: string;
}

// Mirrors PaintingDetailDto.java — a richer, differently-shaped response returned
// only for a single painting (numeric ids for editing, a nested primaryImage
// object, updatedAt, etc.). Adds the detail-only fields on top of the shared base.
export interface PaintingDto extends PaintingListDto {
  artistId: string;
  mediumId: string;
  categoryId: string;
  country: string;
  countryCode: string;
  updatedAt: string;
  description: string;
  width: number;
  height: number;
  yearCreated: number;
  orientation: string;
  primaryImage: PaintingImageDto;
  allImages: PaintingImageDto[];
  artist: {
    id: string;
    firstName: string;
    lastName: string;
    profileImageUrl?: string;
    bio?: string;
    slug: string;
  };
}

export interface PaintingCreateResponse {
  id: string;
  title: string;
  slug: string;
  status: PaintingStatus;
  createdAt: string;
}

export interface SubmitPaintingRequest {
  title: string;
  description: string;
  price: number;
  currency: string;
  mediumId: number;
  categoryId: number;
  countryId: number;
  widthCm: number;
  heightCm: number;
  yearCreated: number;
  orientation: string;
}

export interface GalleryFilters {
  categoryId?: string;
  mediumId?: string;
  country?: string;
  minPrice?: number;
  maxPrice?: number;
  orientation?: string;
  search?: string;
  artistId?: string | number;
}

export interface ArtistProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  bio: string;
  country: string;
  profileImageUrl?: string;
  slug: string;
  socialLinks?: {
    instagram?: string;
    website?: string;
    twitter?: string;
  };
  paintingCount: number;
  createdAt: string;
}

export interface ArtistProfileDto extends ArtistProfile {
  story?: string;
  storyImages?: string[];
}

// Mirrors the real GET /api/artists (list) response — ArtistListResponse.java.
// Deliberately minimal: no painting/follower/sales counts, since the backend
// doesn't compute or expose any (see Phase 2.9 report).
export interface ArtistSummary {
  id: number;
  displayName: string;
  slug: string;
  bio: string | null;
  profilePhotoUrl: string | null;
  countryName: string | null;
}

// Mirrors GET /api/artists/{slug} — ArtistDetailResponse.java. Also the
// shape returned by GET/PUT/POST /api/artists/me (Phase 2.11) — the backend
// reuses the same DTO since the field set is identical, only the audience
// (self vs. public) differs.
export interface ArtistDetail extends ArtistSummary {
  story: string | null;
  websiteUrl: string | null;
  instagram: string | null;
}

// Mirrors UpdateArtistProfileRequest.java — every field optional; only
// fields actually present are applied server-side. Slug is not editable.
export interface UpdateArtistProfileRequest {
  displayName?: string;
  bio?: string;
  story?: string;
  websiteUrl?: string;
  instagram?: string;
  countryId?: number;
}

export enum OfferStatus {
  SUBMITTED = 'SUBMITTED',
  COUNTERED = 'COUNTERED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface OfferDto {
  id: number;
  paintingId: number;
  paintingTitle: string;
  paintingThumbnailUrl?: string;
  buyerName: string;
  offerAmount: number;
  counterAmount?: number;
  buyerMessage?: string;
  adminMessage?: string;
  currency: string;
  status: OfferStatus;
  expiresAt: string;
  respondedAt?: string;
  createdAt: string;
}

export interface MakeOfferRequest {
  paintingId: number;
  offerAmount: number;
  message?: string;
}

export enum OfferAction {
  ACCEPT = 'ACCEPT',
  REJECT = 'REJECT',
  COUNTER = 'COUNTER',
}

export interface RespondOfferRequest {
  action: OfferAction;
  counterAmount?: number;
  message?: string;
}

export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  PAID = 'PAID',
  SHIPPING_IN_PROGRESS = 'SHIPPING_IN_PROGRESS',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CLOSED = 'CLOSED',
  REFUNDED = 'REFUNDED',
}

export enum PaymentMethod {
  ONLINE = 'ONLINE',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export enum PaymentStatus {
  INITIATED = 'INITIATED',
  INSTRUCTIONS_SENT = 'INSTRUCTIONS_SENT',
  AWAITING_TRANSFER = 'AWAITING_TRANSFER',
  SUCCEEDED = 'SUCCEEDED',
  CONFIRMED = 'CONFIRMED',
  FAILED = 'FAILED',
}

export interface OrderDto {
  id: number;
  paintingId: number;
  paintingTitle: string;
  paintingThumbnailUrl?: string;
  buyerId: number;
  buyerName: string;
  totalPrice: number;
  currency: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  shippingName: string;
  shippingAddress1: string;
  shippingCity: string;
  shippingCountry: string;
  trackingNumber?: string;
  trackingUrl?: string;
  createdAt: string;
  shippedAt?: string;
  deliveredAt?: string;
}

// Mirrors ArtistOrderResponse.java — an order on the current artist's own
// painting, as returned by GET /api/artists/me/orders (Phase 2.12).
// Deliberately narrower than OrderDto: no buyer name/id, no shipping
// address/contact, no payment method/status — an artist doesn't need the
// buyer's private information to see what sold.
export interface ArtistOrderSummary {
  id: number;
  paintingId: number;
  paintingTitle: string;
  paintingSlug: string;
  paintingThumbnailUrl: string | null;
  totalPrice: number;
  currency: string;
  status: OrderStatus;
  createdAt: string;
}

export interface CreateOrderRequest {
  paintingId: number;
  offerId?: number;
  shippingName: string;
  shippingEmail: string;
  shippingPhone?: string;
  shippingAddress1: string;
  shippingAddress2?: string;
  shippingCity: string;
  shippingState?: string;
  shippingZip: string;
  shippingCountry: string;
  paymentMethod: PaymentMethod;
}

export interface CreatePaymentIntentRequest {
  orderId: number;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  publishableKey: string;
}

export interface UpdateShippingRequest {
  trackingNumber: string;
  trackingUrl?: string;
}

export interface MessageDto {
  id: number;
  threadId: number;
  senderId: number;
  senderName: string;
  body: string;
  isRead?: boolean;
  createdAt: string;
}

export interface ThreadDto {
  id: number;
  subject: string;
  userId: number;
  userName: string;
  isResolved: boolean;
  unreadCount: number;
  paintingId?: number;
  lastMessageAt: string;
  createdAt: string;
  lastMessage?: string;
  messages?: MessageDto[];
}

export interface SendMessageRequest {
  body: string;
}

export interface PagedResponse<T> {
  data: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}
