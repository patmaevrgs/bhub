import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  middleName: { type: String, required: false },
  lastName: { type: String, required: true },
  userType: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  //transactions: [{type: mongoose.Schema.Types.ObjectId, ref: 'Transaction'}]
});

export default mongoose.model("User", userSchema);
