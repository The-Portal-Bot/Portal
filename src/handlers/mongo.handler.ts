import mongoose, { ConnectOptions } from 'mongoose';
import logger from '../utilities/log.utility';

export async function mongoHandler(mongoUrl: string) {
  mongoose.connection.on('connecting', () => {
    logger.info('connecting to mongo', { service: 'mongse' });
  });

  mongoose.connection.on('connected', () => {
    logger.info('connected to mongo', { service: 'mongse' });
  });

  const connectOptions: ConnectOptions = {
    dbName: 'portal',
    compressors: 'zlib',
    maxPoolSize: 50,
    wtimeoutMS: 2500,
  };
  // {
  //     dbName: 'portal',
  //     autoCreate: false,
  //     connectTimeoutMS: 10000,
  //     compressors: 'zlib'
  // }

  return mongoose.connect(mongoUrl, connectOptions);
}
