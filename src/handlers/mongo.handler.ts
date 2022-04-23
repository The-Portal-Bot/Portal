import mongoose from "mongoose";

export async function mongoHandler(mongoUrl: string) {
    mongoose.connection.on('connecting', () => {
        console.log('[mongoose] connecting to mongo');
    });

    mongoose.connection.on('connected', () => {
        console.log('[mongoose] connected to mongo');
    });

    const connectOptions = {
        dbName: 'portal',
        autoCreate: false,
        connectTimeoutMS: 10000,
        compressors: 'zlib'
    }

    return mongoose.connect(mongoUrl, connectOptions);
}