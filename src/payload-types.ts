/* tslint:disable */
/* eslint-disable */
/**
 * This file was automatically generated by Payload.
 * DO NOT MODIFY IT BY HAND. Instead, modify your source Payload config,
 * and re-run `payload generate:types` to regenerate this file.
 */

export interface Config {
  collections: {
    addresses: Address;
    companies: Company;
    deliveries: Delivery;
    'document-products': DocumentProduct;
    documents: Document;
    establishments: Establishment;
    logos: Logo;
    payments: Payment;
    'product-categories': ProductCategory;
    'product-collections': ProductCollection;
    'product-images': ProductImage;
    'product-promos': ProductPromo;
    projects: Project;
    products: Product;
    shelves: Shelf;
    'supplier-orders': SupplierOrder;
    'supplier-order-products': SupplierOrderProduct;
    suppliers: Supplier;
    'support-ticket-messages': SupportTicketMessage;
    'support-tickets': SupportTicket;
    tasks: Task;
    users: User;
    'task-comments': TaskComment;
    files: File;
    'payload-preferences': PayloadPreference;
    'payload-migrations': PayloadMigration;
  };
  globals: {};
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "addresses".
 */
export interface Address {
  id: number;
  country: string;
  street: string;
  door: string;
  zip: string;
  floor?: string | null;
  city?: string | null;
  province?: string | null;
  name?: string | null;
  isDeleted?: boolean | null;
  isDefault?: boolean | null;
  customer?: (number | null) | User;
  supplier?: (number | null) | Supplier;
  establishment?: (number | null) | Establishment;
  creator?: (number | null) | User;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "users".
 */
export interface User {
  id: number;
  role?: ('super_admin' | 'website' | 'admin' | 'employee' | 'customer') | null;
  firstName: string;
  lastName: string;
  phone?: string | null;
  isBlocked?: boolean | null;
  company?: (number | null) | Company;
  establishment?: (number | null) | Establishment;
  payments?: (number | Payment)[] | null;
  preferredLanguage?: string | null;
  employeeRank?: ('0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9') | null;
  customerCategory?: ('professional' | 'private') | null;
  customerCompany?: string | null;
  customerTaxNumber?: string | null;
  receivedDeliveries?: (number | Delivery)[] | null;
  documents?: (number | Document)[] | null;
  customerAddresses?: (number | Address)[] | null;
  updatedAt: string;
  createdAt: string;
  enableAPIKey?: boolean | null;
  apiKey?: string | null;
  apiKeyIndex?: string | null;
  email: string;
  resetPasswordToken?: string | null;
  resetPasswordExpiration?: string | null;
  salt?: string | null;
  hash?: string | null;
  loginAttempts?: number | null;
  lockUntil?: string | null;
  password: string | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "companies".
 */
export interface Company {
  id: number;
  name: string;
  logo?: (number | null) | Logo;
  active?: boolean | null;
  emailUser?: string | null;
  emailPassword?: string | null;
  emailHost?: string | null;
  emailPort?: number | null;
  emailSec?: string | null;
  stripeSecretKey?: string | null;
  stripePublishableKey?: string | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "logos".
 */
export interface Logo {
  id: number;
  name?: string | null;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "establishments".
 */
export interface Establishment {
  id: number;
  name: string;
  documents?: (number | Document)[] | null;
  deliveries?: (number | Delivery)[] | null;
  supplierOrders?: (number | SupplierOrder)[] | null;
  isDeleted?: boolean | null;
  phone?: string | null;
  phone2?: string | null;
  taxID?: string | null;
  bankAccount1?: string | null;
  bankAccount2?: string | null;
  bankAccount3?: string | null;
  category: 'storefront' | 'warehouse';
  address?: (number | null) | Address;
  shelves?: (number | Shelf)[] | null;
  logo?: (number | null) | Logo;
  users?: (number | User)[] | null;
  customers?: (number | User)[] | null;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "documents".
 */
export interface Document {
  id: number;
  number: string;
  type: 'quote' | 'order' | 'delivery_note' | 'invoice' | 'credit_note';
  prefix: string;
  date: string;
  phase?: number | null;
  files?: (number | File)[] | null;
  comments?: string | null;
  references?: string | null;
  notes?: string | null;
  managerNotes?: string | null;
  isDeleted?: boolean | null;
  decisionMaker?: string | null;
  supplier?: (number | null) | Supplier;
  customer: number | User;
  establishment?: (number | null) | Establishment;
  documentProducts: (number | DocumentProduct)[];
  payments?: (number | Payment)[] | null;
  supportTickets?: (number | SupportTicket)[] | null;
  tasks?: (number | Task)[] | null;
  toDocument?: (number | null) | Document;
  fromDocument?: (number | null) | Document;
  docAddress: number | Address;
  delAddress: number | Address;
  creator: number | User;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "files".
 */
export interface File {
  id: number;
  name: string;
  priority?: number | null;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "suppliers".
 */
export interface Supplier {
  id: number;
  name: string;
  logo?: (number | null) | Logo;
  addresses?: (number | Address)[] | null;
  isDeleted?: boolean | null;
  supplierOrders?: (number | SupplierOrder)[] | null;
  category: string;
  products?: (number | Product)[] | null;
  phone?: string | null;
  orderMail?: string | null;
  contactMail?: string | null;
  orderTime?: number | null;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "supplier-orders".
 */
export interface SupplierOrder {
  id: number;
  establishment: number | Establishment;
  creator: number | User;
  supplierOrderProducts?: (number | SupplierOrderProduct)[] | null;
  supplier: number | Supplier;
  isDeleted?: boolean | null;
  isCompleted?: boolean | null;
  date: string;
  notes?: string | null;
  reference?: string | null;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "supplier-order-products".
 */
export interface SupplierOrderProduct {
  id: number;
  product?: (number | null) | Product;
  quantity: number;
  name: string;
  description?: string | null;
  creator: number | User;
  establishment: number | Establishment;
  supplierOrder: number | SupplierOrder;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "products".
 */
export interface Product {
  id: number;
  name: string;
  description?: string | null;
  isDeleted?: boolean | null;
  EAN?: string | null;
  internalCode?: string | null;
  value: number;
  tax: number;
  categories: (number | ProductCategory)[];
  extraFields?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  productImages?: (number | ProductImage)[] | null;
  shelves?: (number | Shelf)[] | null;
  minStock?: number | null;
  minOrderAmount?: number | null;
  supplier?: (number | null) | Supplier;
  discountRange: number;
  isActive?: boolean | null;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "product-categories".
 */
export interface ProductCategory {
  id: number;
  name: string;
  description?: string | null;
  priority: number;
  isDeleted?: boolean | null;
  headCategory?: (number | null) | ProductCategory;
  categoryImage?: (number | null) | ProductImage;
  promos?: (number | ProductPromo)[] | null;
  products?: (number | Product)[] | null;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "product-images".
 */
export interface ProductImage {
  id: number;
  name: string;
  priority?: number | null;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  filesize?: number | null;
  width?: number | null;
  height?: number | null;
  focalX?: number | null;
  focalY?: number | null;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "product-promos".
 */
export interface ProductPromo {
  id: number;
  name: string;
  promoCode: string;
  calculation:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  products?: (number | Product)[] | null;
  categories?: (number | ProductCategory)[] | null;
  isDeleted?: boolean | null;
  isActive?: boolean | null;
  startDate: string;
  endDate: string;
  customers?: (number | User)[] | null;
  creator: number | User;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "shelves".
 */
export interface Shelf {
  id: number;
  establishment: number | Establishment;
  isDeleted?: boolean | null;
  product: number | Product;
  stock?: number | null;
  region?: string | null;
  stack?: string | null;
  level?: string | null;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "document-products".
 */
export interface DocumentProduct {
  id: number;
  name: string;
  description?: string | null;
  value: number;
  reduction?: number | null;
  amount: number;
  tax: number;
  product?: (number | null) | Product;
  customer: number | User;
  document?: (number | null) | Document;
  subTotal?: number | null;
  subTotalTax?: number | null;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payments".
 */
export interface Payment {
  id: number;
  value: number;
  date: string;
  type: 'cash' | 'debit_card' | 'credit_card' | 'online' | 'bank_transfer' | 'financing';
  notes?: string | null;
  reference?: string | null;
  isVerified?: boolean | null;
  isDeleted?: boolean | null;
  document: number | Document;
  creator?: (number | null) | User;
  establishment: number | Establishment;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "support-tickets".
 */
export interface SupportTicket {
  id: number;
  isDeleted?: boolean | null;
  openDate: string;
  closedDate?: string | null;
  document: number | Document;
  notes?: string | null;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "tasks".
 */
export interface Task {
  id: number;
  creator?: (number | null) | User;
  assignee?: (number | null) | User;
  category: string;
  description?: string | null;
  isCompleted?: boolean | null;
  isDeleted?: boolean | null;
  date: string;
  dateCreated: string;
  notes?: string | null;
  document?: (number | null) | Document;
  files?: (number | File)[] | null;
  taskComments?: (number | TaskComment)[] | null;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "task-comments".
 */
export interface TaskComment {
  id: number;
  date: string;
  comment?: string | null;
  isDeleted?: boolean | null;
  task?: (number | null) | Task;
  creator: number | User;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "deliveries".
 */
export interface Delivery {
  id: number;
  date: string;
  dateCreated: string;
  timeStart?: string | null;
  timeEnd?: string | null;
  notes?: string | null;
  deliveryTaker?: string | null;
  deliveryTakerPhone?: string | null;
  lift?: boolean | null;
  liftPhone?: string | null;
  isCompleted?: boolean | null;
  isIncoming?: boolean | null;
  isDeleted?: boolean | null;
  files?: (number | File)[] | null;
  establishment: number | Establishment;
  documentProducts?: (number | DocumentProduct)[] | null;
  address: number | Address;
  supplierOrderProducts?: (number | SupplierOrderProduct)[] | null;
  customer?: (number | null) | User;
  creator?: (number | null) | User;
  assignee?: (number | null) | User;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "product-collections".
 */
export interface ProductCollection {
  id: number;
  name: string;
  description?: string | null;
  collectionImage?: (number | null) | ProductImage;
  products?: (number | Product)[] | null;
  isDeleted?: boolean | null;
  isFeatured?: boolean | null;
  tags?: string | null;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "projects".
 */
export interface Project {
  id: number;
  title: string;
  description?: string | null;
  featured?: boolean | null;
  files?: (number | File)[] | null;
  cover?: (number | null) | File;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "support-ticket-messages".
 */
export interface SupportTicketMessage {
  id: number;
  supportTicket: number | SupportTicket;
  isDeleted?: boolean | null;
  date: string;
  message?: string | null;
  creator: number | User;
  company: number | Company;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-preferences".
 */
export interface PayloadPreference {
  id: number;
  user: {
    relationTo: 'users';
    value: number | User;
  };
  key?: string | null;
  value?:
    | {
        [k: string]: unknown;
      }
    | unknown[]
    | string
    | number
    | boolean
    | null;
  updatedAt: string;
  createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "payload-migrations".
 */
export interface PayloadMigration {
  id: number;
  name?: string | null;
  batch?: number | null;
  updatedAt: string;
  createdAt: string;
}


declare module 'payload' {
  export interface GeneratedTypes extends Config {}
}