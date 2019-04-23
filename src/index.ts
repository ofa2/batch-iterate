import bb from 'bluebird';

// eslint-disable-next-line import/no-unresolved
import { Document, Model } from 'mongoose';

interface IBatchIterateOptions {
  batchSize?: number;
  projection?: object;
  options?: object;
}

async function batchIterate<T extends Document>(
  MongooseModel: Model<T>,
  conditions: object,
  iterator: Function,
  { projection, options, batchSize = 10 }: IBatchIterateOptions = {}
) {
  let cursor = MongooseModel.find(conditions, projection, options).cursor();

  let arr = [];
  /* eslint-disable no-constant-condition, no-await-in-loop */
  while (true) {
    let doc = await cursor.next();

    if (doc !== null) {
      arr.push(doc);
    }

    if (doc === null || arr.length >= batchSize) {
      await bb.map(arr, (item) => {
        return iterator(item);
      });
    }

    if (doc === null) {
      break;
    }
  }
  /* eslint-enable */
}

export { batchIterate };
