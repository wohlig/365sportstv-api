var schema = new Schema(
    {
        game: { type: Schema.Types.ObjectId, ref: "Games" },
        user: { type: Schema.Types.ObjectId, ref: "User" },
        status: {
            type: String,
            enum: ["enabled", "disabled", "archived"],
            default: "enabled"
        }
    },
    {
        timestamp: true
    }
)
export default mongoose.model("Favorite", schema)
