var schema = new Schema(
    {
        name: { type: String },
        description: { type: String },
        startTime: {
            type: Date
        },
        // username: { type: String },
        // meetingNumber: {
        //     type: String
        // },
        // password: {
        //     type: String
        // },
        meetings: {
            type: Array
        },
        // streamId: {
        //     type: String
        // },
        // scoreId: {
        //     type: String
        // },
        status: {
            type: String,
            enum: ["enabled", "disabled", "archived"],
            default: "enabled"
        },
        meetingStatus: {
            type: Boolean,
            enum: [true, false],
            default: true
        }
    },
    {
        timestamps: true
    }
)
export default mongoose.model("Game", schema)
