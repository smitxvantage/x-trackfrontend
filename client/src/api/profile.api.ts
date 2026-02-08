import { api } from "@/lib/axios";

export const uploadAvatarApi = (file: File) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return api.patch("/api/users/me/avatar", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
