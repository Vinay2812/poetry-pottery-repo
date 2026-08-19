import { applyDecorators, UseGuards } from "@nestjs/common";

import { AdminGuard } from "@/common/guards/admin.guard";
import { AuthGuard } from "@/common/guards/auth.guard";

export function AuthRequired() {
  return applyDecorators(UseGuards(AuthGuard));
}

export function AdminRequired() {
  return applyDecorators(UseGuards(AdminGuard));
}
