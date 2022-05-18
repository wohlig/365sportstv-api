var schema = new Schema(
    {
        amount: { type: Number },
        logs: {
            type: String
        }
    },
    {
        timestamps: true
    }
)
export default mongoose.model("SettleDeposits", schema)
