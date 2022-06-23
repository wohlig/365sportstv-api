var schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        plan: { type: Schema.Types.ObjectId, ref: "Plan" },
        planPrice: { type: Number },
        planName: { type: String },
        planDuration: { type: Number },
        startDate: { type: Date },
        endDate: { type: Date },
        planStatus: {
            type: String,
            enum: ["active", "expired", "cancelled", "pre-active"],
            default: "active"
        },
        daysRemaining: { type: Number },
        transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" }
    },
    {
        timestamps: true
    }
)
export default mongoose.model("Subscription", schema)
