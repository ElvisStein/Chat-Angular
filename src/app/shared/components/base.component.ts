// export class BaseComponent<T extends {id: number | string}> {

//   // O trackByFn vai receber um item que como parametro pode ser ou numero ou string (ou seja vaor generico)
//   trackByFn(index: number, item: T): number | string {
//     return item.id;
//   }
// }

export class BaseComponent<T extends {id: string}> {

  // O trackByFn vai receber um item que como parametro pode ser ou numero ou string (ou seja vaor generico)
  trackByFn(index: number, item: T): string {
    return item.id;
  }
}
