var schema = new Schema(
    {
        name: { type: String },
        description: { type: String },
        startTime: {
            type: Date
        },
        status: {
            type: String,
            enum: ["enabled", "disabled", "archived"],
            default: "enabled"
        },
    },
    {
        timestamps: true
    }
)
export default mongoose.model("ScheduleList", schema)
