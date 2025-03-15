import { type UserPermission, type CompleteUserPermission } from "@/lib/db/schema/userPermissions";
import { OptimisticAction } from "@/lib/utils";
import { useOptimistic } from "react";

export type TAddOptimistic = (action: OptimisticAction<UserPermission>) => void;

export const useOptimisticUserPermissions = (userPermissions: CompleteUserPermission[]) => {
  const [optimisticUserPermissions, addOptimisticUserPermission] = useOptimistic(
    userPermissions,
    (currentState: CompleteUserPermission[], action: OptimisticAction<UserPermission>): CompleteUserPermission[] => {
      const { data } = action;

      const optimisticUserPermission = {
        user_permissions: {
          ...data,
          id: "optimistic",
        },
        user: {} as any,
      };

      switch (action.action) {
        case "create":
          return currentState.length === 0 ? [optimisticUserPermission] : [...currentState, optimisticUserPermission];
        case "update":
          return currentState.map((item) =>
            item.user_permissions.id === data.id ? { ...item, ...optimisticUserPermission } : item
          );
        case "delete":
          return currentState.map((item) => (item.user_permissions.id === data.id ? { ...item, id: "delete" } : item));
        default:
          return currentState;
      }
    }
  );

  return { addOptimisticUserPermission, optimisticUserPermissions };
};
