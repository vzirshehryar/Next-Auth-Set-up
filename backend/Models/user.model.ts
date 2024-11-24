import mongoose from "mongoose";
import bcrypt from "bcrypt";

const Schema = mongoose.Schema;

let userSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  otp: String,
  otp_expiration: {
    type: Date,
    default: null
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  phone: String,
  country: String,
  city: String,
  location: String,
  gender: String,
  about: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ENCRYPTING PASSWORD AS ANY UPDATION OF ADDITION HAPPENS IN THIS SCHEMA
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

export default mongoose.model("users", userSchema);
