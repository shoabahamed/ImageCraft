import { create } from "zustand";

type CommonProps = {
  sidebarName: string;
  setSidebarName: (value: string) => void;
  projectName: string;
  setProjectName: (value: string) => void;
  showUpdateButton: boolean;
  setShowUpdateButton: (value: boolean) => void;
};

export const useCommonProps = create<CommonProps>((set) => ({
  sidebarName: "",
  setSidebarName: (value) => set({ sidebarName: value }),
  projectName: "Untitled",
  setProjectName: (value) => set({ projectName: value }),
  showUpdateButton: false,
  setShowUpdateButton: (value) => set({ showUpdateButton: value }),
}));
