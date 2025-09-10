"use client";
import type { ReactNode } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer
        position="top-right"
        autoClose={2500}
        newestOnTop
        closeOnClick
        pauseOnHover={false}
        draggable
        theme="light"
        toastClassName="!text-neutral-600 !bg-white !border !border-neutral-200 !rounded-xl !shadow-sm"
        progressClassName="!bg-neutral-600"
        style={{ zIndex: 99999 }}
      />
    </>
  );
}
