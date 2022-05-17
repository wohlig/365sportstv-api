var schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        plan: { type: Schema.Types.ObjectId, ref: "Plan" },
        amount: { type: Number },
        instamojo_purpose: { type: String },
        status: {
            type: String,
            enum: ["pending", "completed", "cancelled"],
            default: "pending"
        },
        currency: { type: Schema.Types.ObjectId },
        transactionType: { type: String, enum: ["deposit", "free"] },
        transactionWay: { type: String },
        paymentGatewayName: { type: String },
        paymentGatewayResponse: { type: Object }
    },
    {
        timestamps: true
    }
)
export default mongoose.model("Transaction", schema)
