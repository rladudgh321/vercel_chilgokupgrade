`/api/supabase/build/[id]/toggle/route.ts`에서 visibility를 false로 하면,
`/landSearch`페이지와 `/card`페이지에서 사용하는 SearchBar컴포넌트의 소괄호 안에 매물 갯수에 대해서 포함되지 않도록 해줘.
---
좋아 잘 작동되는데, `/admin/listings/deleted-listings`페이지는 삭제된 페이지야
여기에 포함된 매물들은 보이지 않도록 하여서 SearchBar컴포넌트의 소괄호 안에도 포함되지 않도록 해줘