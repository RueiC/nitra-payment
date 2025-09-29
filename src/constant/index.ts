import type { Organization } from '@/models/Organization';
import type { Location } from '@/models/Location';
import type { PaymentLocationReader } from '@/models/PaymentLocationReader';
import { ReaderStatus } from '@/models/enums';

const FALLBACK_ZERO_PERCENTAGE_STRING = '0.00';
const FALLBACK_ZERO_STRING = '0';
const PERCENTAGE_DIVISOR = 100;
const INTEGER_PLACES = 0;
const DEFAULT_DECIMAL_PLACES = 2;

const MINIMUM_TOTAL_AMOUNT_IN_CENTS = 5;

const MAX_LENGTH_OF_AMOUNT = 6;

const mockCountries = [{ label: 'United States', value: 'US' }];

const mockOrganization: Organization = {
  id: 4,
  name: 'Nitra Clinic',
  totalProcessingFeeFixed: 10, // cents
  totalProcessingFeePercentage: '0.03500', // 3.5%
  createdAt: '2024-01-01T12:00:00Z',
  updatedAt: '2024-01-01T12:00:00Z',
  deletedAt: null,
};

const mockLocations: Location[] = [
  {
    id: 48,
    name: 'New York Clinic',
    taxRate: '0.06000',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
    deletedAt: null,
  },
  {
    id: 75,
    name: 'Los Angeles Clinic',
    taxRate: '0.04500',
    createdAt: '2024-03-08T12:00:00Z',
    updatedAt: '2024-03-08T12:00:00Z',
    deletedAt: null,
  },
];

const mockLocationReaders: PaymentLocationReader[] = [
  {
    id: 23,
    label: 'Device Reader 01',
    readerId: 'tmr_00000001582624',
    status: ReaderStatus.Online,
    locationId: 48,
    createdAt: '2024-01-20T12:00:00Z',
    updatedAt: '2024-01-20T12:00:00Z',
    deletedAt: null,
  },
  {
    id: 27,
    label: 'Device Reader 02',
    readerId: 'tmr_00000001582658',
    status: ReaderStatus.Offline,
    locationId: 48,
    createdAt: '2024-02-13T12:00:00Z',
    updatedAt: '2024-02-13T12:00:00Z',
    deletedAt: null,
  },
  {
    id: 35,
    label: 'Device Reader 03',
    readerId: 'tmr_00000001582824',
    status: ReaderStatus.Online,
    locationId: 48,
    createdAt: '2024-02-21T12:00:00Z',
    updatedAt: '2024-02-21T12:00:00Z',
    deletedAt: null,
  },
  {
    id: 58,
    label: 'Device Reader 01',
    readerId: 'tmr_00000001604824',
    status: ReaderStatus.Online,
    locationId: 75,
    createdAt: '2024-03-13T12:00:00Z',
    updatedAt: '2024-03-13T12:00:00Z',
    deletedAt: null,
  },
  {
    id: 63,
    label: 'Device Reader 04',
    readerId: 'tmr_00000001604858',
    status: ReaderStatus.Online,
    locationId: 48,
    createdAt: '2024-03-18T12:00:00Z',
    updatedAt: '2024-03-18T12:00:00Z',
    deletedAt: null,
  },
  {
    id: 71,
    label: 'Device Reader 02',
    readerId: 'tmr_00000001630824',
    status: ReaderStatus.Online,
    locationId: 75,
    createdAt: '2024-03-25T12:00:00Z',
    updatedAt: '2024-03-25T12:00:00Z',
    deletedAt: null,
  },
];

export {
  FALLBACK_ZERO_PERCENTAGE_STRING,
  FALLBACK_ZERO_STRING,
  PERCENTAGE_DIVISOR,
  INTEGER_PLACES,
  DEFAULT_DECIMAL_PLACES,
  mockCountries,
  mockOrganization,
  mockLocations,
  mockLocationReaders,
  MINIMUM_TOTAL_AMOUNT_IN_CENTS,
  MAX_LENGTH_OF_AMOUNT,
};
