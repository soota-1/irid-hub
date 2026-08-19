export type { MembershipApplicationDTO, UserDTO } from "@/shared/types/api";

export interface SubmitMembershipApplicationInput {
  full_name: string;
  email: string;
  phone: string;
  motivation?: string;
}
