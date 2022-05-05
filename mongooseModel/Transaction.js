var schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        plan: { type: Schema.Types.ObjectId, ref: "Plan" },
        transactionId: { type: String },
        status: {
            type: String,
            enum: ["initiated", "completed", "cancelled"],
            default: "initiated"
        },
        paymentGateway: { type: String },
        paymentGatewayResponse: { type: String },
        amount: { type: Number },
        paymentMode: { type: String },
        referenceNumber: { type: String }
    },
    {
        timestamp: true
    }
)
export default mongoose.model("Transaction", schema)
