import { PayrantService } from '../src/services/payrant.service';

// Mocking the VirtualAccount model
jest.mock('../src/models/VirtualAccount.js', () => {
  return {
    default: {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn()
    }
  };
});

import VirtualAccount from '../src/models/VirtualAccount.js';

describe('PayrantService createVirtualAccount', () => {
  let payrantService: PayrantService;

  beforeEach(() => {
    payrantService = new PayrantService();
    jest.clearAllMocks();
  });

  it('should return existing virtual account if user already has one', async () => {
    const mockExistingAccount = {
      accountNumber: '1234567890',
      accountName: 'Test User',
      metadata: {
        identityType: 'nin',
        licenseNumber: 'A1234567'
      },
      reference: 'ref123'
    };

    (VirtualAccount.findOne as jest.Mock).mockResolvedValue(mockExistingAccount);

    const data = {
      email: 'test@example.com',
      documentType: 'nin',
      documentNumber: 'A1234567',
      virtualAccountName: 'Test User',
      accountReference: 'ref123',
      customerName: 'Test User'
    };

    const result = await payrantService.createVirtualAccount(data, 'userId123');

    expect(result.status).toBe('exists');
    expect(result.account_no).toBe(mockExistingAccount.accountNumber);
    expect(result.virtualAccountName).toBe(mockExistingAccount.accountName);
  });

  it('should create and save a new virtual account if user does not have one', async () => {
    (VirtualAccount.findOne as jest.Mock).mockResolvedValue(null);
    (VirtualAccount.findOneAndUpdate as jest.Mock).mockResolvedValue(true);

    // Mock axiosInstance.post to simulate API response
    payrantService['axiosInstance'].post = jest.fn().mockResolvedValue({
      data: {
        account_no: '9876543210',
        virtualAccountName: 'New User'
      }
    });

    const data = {
      email: 'newuser@example.com',
      documentType: 'nin',
      documentNumber: 'B7654321',
      virtualAccountName: 'New User',
      accountReference: 'ref456',
      customerName: 'New User'
    };

    const result = await payrantService.createVirtualAccount(data, 'userId456');

    expect(result.status).toBe('success');
    expect(result.account_no).toBe('9876543210');
    expect(result.virtualAccountName).toBe('New User');
  });

});
