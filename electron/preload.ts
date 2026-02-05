import { contextBridge, ipcRenderer } from "electron";
import type { LoadDataResponse } from "../src/types";

export type ZzzApi = {
  loadData: () => Promise<LoadDataResponse>;
};

const api: ZzzApi = {
  loadData: () => ipcRenderer.invoke("zzz:loadData"),
};

contextBridge.exposeInMainWorld("zzzApi", api);

declare global {
  interface Window {
    zzzApi: ZzzApi;
  }
}


