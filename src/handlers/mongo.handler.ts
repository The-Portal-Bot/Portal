import mongoose from 'mongoose';
import { logger } from '../libraries/help.library';

export async function mongoHandler(mongoUrl: string) {
  mongoose.connection.on('connecting', () => {
    logger.info('[mongoose] connecting to mongo');
  });

  mongoose.connection.on('connected', () => {
    logger.info('[mongoose] connected to mongo');
  });

  const connectOptions = {
    dbName: 'portal',
    compressors: 'zlib',
    maxPoolSize: 50,
    wtimeoutMS: 2500,
    useNewUrlParser: true,
  };
  // {
  //     dbName: 'portal',
  //     autoCreate: false,
  //     connectTimeoutMS: 10000,
  //     compressors: 'zlib'
  // }

  return mongoose.connect(mongoUrl, connectOptions);
}
