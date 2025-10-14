import { create } from "zustand";

import { Some, None, Option, Result, Err, Ok } from "oxide.ts";
import { userServiceEditUser, userServiceGetMe } from "@/api/user";

type Me={
    name: string;
    image: string;
}
type MeState = {
  me: Option<Me>;
  setMe: (me: Option<Me>) => void;
};

const useMeStore = create<MeState>((set) => ({
  me: None,
  setMe: (me) => set({ me: me }),
}));

export function useMe() {
  return useMeStore((s) => ({
    me: s.me,
    setMe: s.setMe,
  }));
}

export function getMe(): Option<Me> {
  return useMeStore.getState().me;
}

export function setMe(me: Option<Me>): void {
  useMeStore.setState({ me: me });
}

export async function updateMe(): Promise<Result<void, string>> {
  try {
    // orval's userServiceEditUser expects V1EditUserRequest; payload shape assumed compatible
    const res = await userServiceGetMe();
    const data = res.data;
    // If API indicates success, set store. Adjust according to actual response shape.
    if (data?.user) {
      const me: Me = { name: data.user.name??"" , image: data.user.image??"" }; ;
      setMe(Some(me));
      return Ok(undefined);
    }
    return Err('get-me-failed');
  } catch (e: any) {
    return Err(e?.message ?? 'network-error');
  }
}