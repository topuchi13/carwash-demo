import { Transaction } from 'app/models/transaction';
import { BedPosition, Car, Truck, TruckBed } from 'app/models/vehicle';
import { TransactionHistory } from 'app/services/transaction-history';

export abstract class TransactionHandler {
  constructor(private _successor?: TransactionHandler) {
  }

  handle(transaction: Transaction): void {
    if (this._successor) {
      this._successor.handle(transaction);
    }
  }
}

export class BasePriceHandler extends TransactionHandler {

  handle(transaction: Transaction): void {
    if (transaction.vehicle instanceof Car) {
      transaction.price = 5;
    } else {
      if (transaction.vehicle instanceof Truck) {
        transaction.price = 10;
      } else {
        throw new Error('Invalid vehicle type');
      }
    }

    super.handle(transaction);
  }
}

export class TruckHandler extends TransactionHandler {

  handle(transaction: Transaction): void {
    if (transaction.vehicle instanceof Truck) {
      if (transaction.vehicle.truckBed.bedPosition === BedPosition.Down) {
        throw new Error('Truck bed let down');
      }
      if (transaction.vehicle.truckBed.isMuddy === true) {
        transaction.price += 2;
      }
    }

    super.handle(transaction);
  }
}

export class DiscountHandler extends TransactionHandler {

  constructor(private _transactionHistory: TransactionHistory, successor?: TransactionHandler) {
    super(successor);
  }

  handle(transaction: Transaction): void {
    const count = this._transactionHistory.transactions.reduce((n, trans) => {
      if (trans.vehicle.licensePlate === transaction.vehicle.licensePlate) {
        return ++n;
      }
    }, 0);
    if (count > 0) {
      transaction.price = transaction.price * .5;
    }
    super.handle(transaction);
  }
}

export class LicenseValidationHandler extends TransactionHandler {

  handle(transaction: Transaction): void {
    if (transaction.vehicle.licensePlate === '1111111') {
      throw new Error('Vehicle was stolen');
    }
    super.handle(transaction);
  }
}
