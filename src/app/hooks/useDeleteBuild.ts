import { useMutation, useQueryClient } from "@tanstack/react-query";
import { BuildDelete, BuildDeleteSome } from "@/app/apis/build";

export const useDeleteBuild = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: number[]) => BuildDeleteSome(ids),
    onSuccess: () => {
      // 삭제 후 캐시된 데이터 갱신
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: (error) => {
      console.error("삭제 중 오류 발생:", error);
      alert("삭제에 실패했습니다.");
    },
  });
};
