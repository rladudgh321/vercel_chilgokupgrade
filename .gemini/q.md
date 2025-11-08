`OrdersPage`컴포넌트에서 즉 `/orders`페이지에서 쿠키를 가지고 와서 supabase를 불러오고 있는데 fetch를 사용하여 불러오고 tags로 orders와 public을 줘서 코드를 수정해줘

---
import { createClient as createClientServer } from "@/app/utils/supabase/server";
import { cookies } from "next/headers";

const cookieStore = await cookies();
  const supabase = createClientServer(cookieStore);