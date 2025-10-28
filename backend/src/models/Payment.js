const mongoose = require('mongoose');

// Payment Schema - Handle course purchases and subscriptions
const paymentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  transactionId: {
    type: String,
    required: [true, 'Transaction ID is required'],
    unique: true
  },
  type: {
    type: String,
    enum: ['course_purchase', 'subscription', 'premium_upgrade', 'certification', 'one_time'],
    required: [true, 'Payment type is required']
  },
  
  // What was purchased
  items: [{
    itemType: {
      type: String,
      enum: ['course', 'subscription_plan', 'certification', 'premium_feature'],
      required: true
    },
    itemId: mongoose.Schema.Types.ObjectId,
    itemName: String,
    quantity: { type: Number, default: 1 },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true }
  }],
  
  // Payment details
  amount: {
    type: Number,
    required: [true, 'Payment amount is required'],
    min: 0
  },
  currency: {
    type: String,
    required: [true, 'Currency is required'],
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'INR', 'CAD', 'AUD']
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'stripe', 'bank_transfer', 'upi', 'wallet'],
    required: [true, 'Payment method is required']
  },
  
  // Payment processor details
  processor: {
    name: {
      type: String,
      enum: ['stripe', 'paypal', 'razorpay', 'square', 'manual'],
      required: true
    },
    transactionId: String, // Processor's transaction ID
    paymentIntentId: String, // For Stripe
    sessionId: String, // For checkout sessions
    webhookEventId: String
  },
  
  // Status tracking
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  
  // Billing details
  billingAddress: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  
  // Timestamps
  paidAt: Date,
  failedAt: Date,
  refundedAt: Date,
  
  // Subscription details (if applicable)
  subscription: {
    planId: String,
    planName: String,
    interval: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
    },
    startDate: Date,
    endDate: Date,
    nextBillingDate: Date,
    isActive: { type: Boolean, default: false }
  },
  
  // Discount and coupon information
  discount: {
    couponCode: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed_amount']
    },
    discountValue: Number,
    discountAmount: Number
  },
  
  // Tax information
  tax: {
    taxRate: Number,
    taxAmount: Number,
    taxRegion: String
  },
  
  // Invoice details
  invoice: {
    invoiceNumber: String,
    invoiceUrl: String,
    pdfUrl: String,
    generatedAt: Date
  },
  
  // Refund information
  refunds: [{
    refundId: String,
    amount: Number,
    reason: String,
    refundedAt: Date,
    processorRefundId: String
  }],
  
  // Payment metadata
  metadata: {
    userAgent: String,
    ipAddress: String,
    source: String, // web, mobile app, etc.
    referrer: String
  },
  
  // Notes and comments
  notes: String,
  adminNotes: String
}, {
  timestamps: true
});

// Indexes for payments
paymentSchema.index({ user: 1, createdAt: -1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ type: 1 });
paymentSchema.index({ 'processor.name': 1, 'processor.transactionId': 1 });
paymentSchema.index({ 'subscription.planId': 1 });
paymentSchema.index({ paidAt: 1 });

module.exports = mongoose.model('Payment', paymentSchema);