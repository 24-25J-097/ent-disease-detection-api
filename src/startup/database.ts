import env from "../utils/validate-env";

const mongoose = require('mongoose');

mongoose.ObjectId.get((v: any) => v ? v.toString() : v);

export default async function connectDatabase() {
    await mongoose.connect(getMongooseUri(), {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });
}

function getMongooseUri() {
    return process.env.NODE_ENV !== 'test' ? env.MONGOOSE_URI : env.TEST_MONGOOSE_URI;
}
