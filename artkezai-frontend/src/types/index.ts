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

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
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
  LIVE = 'LIVE',
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

export interface PaintingListDto {
  id: string;
  slug: string;
  title: string;
  artistId: string;
  artistName: string;
  mediumId: string;
  mediumName: string;
  categoryId: string;
  categoryName: string;
  price: number;
  currency: string;
  country: string;
  countryCode: string;
  status: PaintingStatus;
  primaryImage: PaintingImageDto;
  createdAt: string;
  updatedAt: string;
}

export interface PaintingDto extends PaintingListDto {
  description: string;
  width: number;
  height: number;
  yearCreated: number;
  orientation: string;
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

export interface SubmitPaintingRequest {
  title: string;
  description: string;
  price: number;
  currency: string;
  mediumId: string;
  categoryId: string;
  country: string;
  width: number;
  height: number;
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

export enum OfferStatus {
  SUBMITTED = 'SUBMITTED',
  COUNTERED = 'COUNTERED',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED',
  WITHDRAWN = 'WITHDRAWN',
}

export interface OfferDto {
  id: string;
  paintingId: string;
  buyerId: string;
  buyerName: string;
  adminCounterAmount?: number;
  buyerAmount: number;
  status: OfferStatus;
  message?: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  painting: {
    slug: string;
    title: string;
    primaryImage: PaintingImageDto;
  };
}

export interface MakeOfferRequest {
  paintingId: string;
  amount: number;
  message?: string;
}

export interface RespondOfferRequest {
  status: OfferStatus;
  counterAmount?: number;
  rejectionReason?: string;
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
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  body: string;
  createdAt: string;
}

export interface ThreadDto {
  id: string;
  subject: string;
  paintingId?: string;
  participantIds: string[];
  lastMessageAt: string;
  createdAt: string;
  updatedAt: string;
  lastMessage?: string;
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
