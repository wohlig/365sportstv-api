var schema = new Schema(
    {
        gameId: { type: Schema.Types.ObjectId, ref: "Game" },
        userId: { type: Schema.Types.ObjectId, ref: "User" },
        status: {
            type: String,
            enum: ["enabled", "disabled", "archived"],
            default: "enabled"
        }
    },
    {
        timestamps: true
    }
)
export default mongoose.model("Favorite", schema)
