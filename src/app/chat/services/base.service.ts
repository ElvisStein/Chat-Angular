import { DataProxy } from 'apollo-cache';
import { DocumentNode } from 'graphql';

export abstract class BaseService {

  protected readAndWriteQuery<T = any>(
    config: {
      store: DataProxy,
      newRecord: T,
      query: DocumentNode,
      queryName: string,
      arrayOperation: 'push' | 'unshift' | 'singleRecord',
      variable?: { [key: string]: any }
    }
  ): void {

    try {

    // Leitura da query
    const data = config.store.readQuery({
      query: config.query,
      variables: config.variable
    });
    // alteração dos dados da query
    switch (config.arrayOperation) {
      case 'push':
      case 'unshift':
        data[config.queryName] = [...data[config.queryName]];
        data[config.queryName][config.arrayOperation](config.newRecord);
        break;
      case 'singleRecord':
        data[config.queryName] = [config.newRecord];
    }
    // escrever a query
    config.store.writeQuery({
      query: config.query,
      variables: config.variable,
      data
    });

    } catch (e) {
      console.log(`Query ${config.queryName} não foi encontrado no cache!`);

    }

  }

}
