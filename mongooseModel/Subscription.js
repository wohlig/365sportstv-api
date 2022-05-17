var schema = new Schema(
    {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        plan: { type: Schema.Types.ObjectId, ref: "Plan" },
        planPrice: { type: Number },
        planName: { type: String },
        planDuration: { type: Number },
        planStartDate: { type: Date },
        planEndDate: { type: Date },
        planStatus: {
            type: String,
            enum: ["active", "expeired", "cancelled"],
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
