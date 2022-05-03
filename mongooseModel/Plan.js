var schema = new Schema(
    {
        name: { type: String },
        price: { type: Number },
        status: {
            type: String,
            enum: ["enabled", "disabled", "archived"],
            default: "enabled"
        },
        duration: {
            type: Number
        }
    },
    {
        timestamp: true
    }
)
export default mongoose.model("Plan", schema)
