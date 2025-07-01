export enum UserRole {
  CUSTOMER = 'customer',
  ADMIN = 'admin',
  VENDOR = 'vendor',
  DELIVERY = 'delivery',
}

export enum AccountStatus {
  ACTIVE = 'active', // User can use the system normally
  DEACTIVATED = 'deactivated', // Manually disabled by user or admin
  PENDING = 'pending', // Waiting for email/phone verification
  SUSPENDED = 'suspended', // Temporarily blocked due to policy issues
  BANNED = 'banned', // Permanently blocked from the system
  DELETED = 'deleted', // Soft-deleted but still in DB
  LOCKED = 'locked', // Locked due to security (e.g., failed login attempts)
  INACTIVE = 'inactive', // Hasn't used the system for a long time
}
