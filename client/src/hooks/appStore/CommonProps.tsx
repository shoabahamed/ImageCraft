import { create } from "zustand";

type CommonProps = {
  sidebarName: string;
  setSidebarName: (value: string) => void;
};

export const useCommonProps = create<CommonProps>((set) => ({
  sidebarName: "",
  setSidebarName: (value) => set({ sidebarName: value }),
}));
