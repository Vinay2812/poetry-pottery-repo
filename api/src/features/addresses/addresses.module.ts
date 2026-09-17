import { Module } from "@nestjs/common";

import { AddressesResolver } from "./addresses.resolver";
import { AddressesService } from "./addresses.service";

@Module({
  providers: [AddressesService, AddressesResolver],
  exports: [AddressesService],
})
export class AddressesModule {}
