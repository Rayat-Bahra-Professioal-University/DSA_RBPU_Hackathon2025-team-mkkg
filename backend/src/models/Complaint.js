import mongoose from "mongoose";

const { Schema } = mongoose;

const FileSchema = new Schema({
  url: { type: String, required: true },
  filename: String,
  provider: { type: String, default: "cloudinary" },
});

const LocationSchema = new Schema({
  lat: { type: Number, required: true },
  lng: { type: Number, required: true },
  address: String,
});

const ComplaintSchema = new Schema(
  {
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
      comment: "Clerk user ID of the person who created the complaint",
    },
    type: {
      type: String,
      required: true,
      enum: [
        "potholes",
        "rubbish-bins",
        "streetlights",
        "public-spaces",
        "other",
      ],
      index: true,
    },
    description: {
      type: String,
      required: true,
      minlength: 20,
      maxlength: 1000,
    },
    location: {
      type: LocationSchema,
      required: true,
    },
    phone: {
      type: String,
      validate: {
        validator: function (v) {
          return !v || /^[0-9]{10}$/.test(v);
        },
        message: (props) =>
          `${props.value} is not a valid 10-digit phone number!`,
      },
    },
    urgent: {
      type: Boolean,
      default: false,
      index: true,
    },
    files: [FileSchema],
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "in-progress", "closed", "rejected"],
      index: true,
    },
    // Admin features
    assignedTo: {
      type: String,
      comment: "Clerk user ID of admin assigned to this complaint",
    },
    resolvedAt: Date,
    rejectionReason: String,
    resolutionPhotos: {
      type: [FileSchema],
      comment: "Photos uploaded by admin when closing the issue",
    },
    adminNotes: [
      {
        note: String,
        addedBy: String, // Clerk user ID
        addedAt: { type: Date, default: Date.now },
      },
    ],
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedBy: String,
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Add indexes for better query performance
ComplaintSchema.index({ createdAt: -1 });
ComplaintSchema.index({ userId: 1, status: 1 });
ComplaintSchema.index({ type: 1, status: 1 });

// Virtual for complaint age in days
ComplaintSchema.virtual("ageInDays").get(function () {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Ensure virtuals are included in JSON
ComplaintSchema.set("toJSON", { virtuals: true });
ComplaintSchema.set("toObject", { virtuals: true });

const Complaint = mongoose.model("Complaint", ComplaintSchema);
export default Complaint;
