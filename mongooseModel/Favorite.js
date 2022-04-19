var schema = new Schema(
    {
        gameId: { type: Schema.Types.ObjectId, ref: "Games" },
        userId: { type: Schema.Types.ObjectId, ref: "User" },
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
