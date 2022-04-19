var schema = new Schema(
    {
        name: { type: String, index: true },
        email: { type: String },
        status: {
            type: String,
            enum: ["enabled", "disabled", "archived"],
            default: "enabled",
            index: true
        }
    },
    {
        timestamp: true
    }
)
export default mongoose.model("User", schema)
