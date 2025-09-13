import mongoose from 'mongoose';

// Define schema for stock preferences
const stockPreferenceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Stock preference must belong to a user'],
    },
    symbol: {
      type: String,
      required: [true, 'Stock symbol is required'],
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Stock name is required'],
      trim: true,
    },
    watchlist: {
      type: Boolean,
      default: true,
    },
    priceAlerts: [
      {
        type: {
          type: String,
          enum: ['above', 'below', 'percent_change'],
          required: true,
        },
        value: {
          type: Number,
          required: true,
        },
        triggered: {
          type: Boolean,
          default: false,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    notes: {
      type: String,
      trim: true,
    },
    sector: {
      type: String,
      trim: true,
    },
    industry: {
      type: String,
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    lastPrice: {
      type: Number,
      default: 0,
    },
    lastPriceUpdate: {
      type: Date,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Create compound index for faster queries
stockPreferenceSchema.index({ user: 1, symbol: 1 }, { unique: true });
stockPreferenceSchema.index({ user: 1, watchlist: 1 });

// Method to check if any price alerts are triggered by a new price
stockPreferenceSchema.methods.checkAlerts = function(currentPrice) {
  if (!currentPrice || currentPrice <= 0) return [];
  
  const triggeredAlerts = [];
  const previousPrice = this.lastPrice || currentPrice;
  
  this.priceAlerts.forEach((alert, index) => {
    if (alert.triggered) return;
    
    let isTriggered = false;
    
    switch (alert.type) {
      case 'above':
        isTriggered = currentPrice >= alert.value;
        break;
      case 'below':
        isTriggered = currentPrice <= alert.value;
        break;
      case 'percent_change':
        const percentChange = ((currentPrice - previousPrice) / previousPrice) * 100;
        isTriggered = Math.abs(percentChange) >= alert.value;
        break;
      default:
        break;
    }
    
    if (isTriggered) {
      this.priceAlerts[index].triggered = true;
      triggeredAlerts.push({
        ...this.priceAlerts[index].toObject(),
        symbol: this.symbol,
        name: this.name,
        previousPrice,
        currentPrice,
      });
    }
  });
  
  // Update the last price and timestamp
  this.lastPrice = currentPrice;
  this.lastPriceUpdate = new Date();
  
  return triggeredAlerts;
};

// Update timestamp before saving
stockPreferenceSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Create the model from the schema
const StockPreference = mongoose.model('StockPreference', stockPreferenceSchema);

export default StockPreference;
