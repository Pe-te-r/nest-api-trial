import { DriverStatus, VehicleType } from 'src/types/types';

export class CreateDriverDto {
  userId: string;
  status?: DriverStatus;
  vehicle_type: VehicleType;
  license_plate: string;
}
