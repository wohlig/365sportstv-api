var schema = new Schema(
    {
        name: { type: String},
        description: { type: String },
        startTime: {
            type: Date
        },
        streamId: {
            type: String,
        },
        scoreId: {
            type: String,
        },
        status: {
            type: String,
            enum: ["enabled", "disabled", "archived"],
            default: "enabled"
        },
        liveStatus: {
            type: String,
            enum: ["upcoming", "live", "completed"],
            default: "upcoming"
        }
    },
    {
        timestamp: true
    }
)
export default mongoose.model("Game", schema)
