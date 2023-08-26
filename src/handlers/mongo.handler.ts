import mongoose from 'mongoose';
import logger from '../libraries/log.library';

export async function mongoHandler(mongoUrl: string) {
  mongoose.connection.on('connecting', () => {
    logger.info('connecting to mongo', { service: 'mongse' });
  });

  mongoose.connection.on('connected', () => {
    logger.info('connected to mongo', { service: 'mongse' });
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
