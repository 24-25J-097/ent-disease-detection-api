import * as mongoose from "mongoose";

const CounterSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true
    }, // e.g., 'studentId'
    seq: {
        type: Number,
        default: 0
    },
});

export const Counter = mongoose.model('Counter', CounterSchema);

export default Counter;
