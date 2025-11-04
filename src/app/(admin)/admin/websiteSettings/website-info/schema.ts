import { z } from "zod";

export const workInfoSchema = z.object({
  id: z.string().optional().nullable(),
  created_at: z.string().optional().nullable(),
  companyName: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  email: z.string().email({ message: "유효한 이메일을 입력해주세요." }).optional().nullable().or(z.literal('')),
  owner: z.string().optional().nullable(),
  businessId: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
});

export type WorkInfoFormData = z.infer<typeof workInfoSchema>;
