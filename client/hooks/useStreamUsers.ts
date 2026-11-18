import { useCallback, useEffect, useState } from "react";
import { StreamChat, UserResponse } from "stream-chat";

export const useStreamUsers = (
  client: StreamChat,
  userId: string
) => {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchUsers = useCallback(
    async (isRefresh = false) => {
      if (!client || !userId) {
        setUsers([]);
        setLoading(false);
        setRefreshing(false);
        return;
      }

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await client.queryUsers(
          {},
          { last_active: -1 },
          { limit: 100 }
        );

        const filteredUsers = response.users.filter(
          (streamUser) =>
            streamUser.id !== userId &&
            streamUser.role !== "admin"
        );

        setUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [client, userId]
  );

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const refreshUsers = useCallback(() => {
    return fetchUsers(true);
  }, [fetchUsers]);

  return {
    users,
    loading,
    refreshing,
    refreshUsers,
  };
};