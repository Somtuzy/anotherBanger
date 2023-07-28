const { Schema, model } = require("mongoose");
const ObjectId = Schema.Types.ObjectId;

const productSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    details: {
      type: [{}],
      required: true,
    },
    size: {
      type: String,
      required: true,
      lowercase: true,
      enum: ["small", "medium", "large"],
    },
    price: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["pending", "available", "sold"],
      default: "available",
    },
    images: {
      type: [
        {
          type: String,
        },
      ],
      required: true,
    },
    category: {
      type: ObjectId,
      ref: "Category",
    },
    vendor: {
      type: ObjectId,
      ref: "User",
    },
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Product = model("Product", productSchema);
module.exports = Product;
