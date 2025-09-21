import { create } from "zustand";
import { Option,None } from "oxide.ts";
type AuthState = {
  isAuthenticated: boolean;
  userName:Option<string>;
  userImage:Option<string>;
  setUserName: (name: Option<string>) => void;
  setUserImage: (image: Option<string>) => void;
  setAuthenticated: (auth: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
    userName: None,
    userImage: None,
  setUserName: (name) => set({ userName: name }),
  setUserImage: (image) => set({ userImage: image }),
  setAuthenticated: (auth) => set({ isAuthenticated: auth }),
}));