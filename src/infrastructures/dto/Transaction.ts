import { PaymentMethod, TransactionMethod } from '@/models/enums/index';
import type { Location } from '@/models/Location';
import type { Organization } from '@/models/Organization';
import type { PaymentLocationReader } from '@/models/PaymentLocationReader';
import Decimal from 'decimal.js';

type CreditCardDetails = {
  name: string;
  cardNumber: string;
  expirationDate: string;
  cvc: string;
  country: string;
  zip: string;
};

export interface TransactionData {
  mockOrganization: Organization;
  mockLocations: Location[];
  mockLocationReaders: PaymentLocationReader[];
}

export interface TransactionPayload {
  amountInCents: Decimal;
  calculatedTaxInCents: Decimal;
  patientFeeInCents: Decimal;
  totalAmountInCents: Decimal;

  paymentMethod: PaymentMethod;
  transactionMethod: TransactionMethod;
  selectedLocationId: number | null;
  selectedReaderId: number | null;
  description?: string;
  creditCardDetails?: CreditCardDetails;
}
