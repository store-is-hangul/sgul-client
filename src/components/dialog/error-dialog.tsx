"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ErrorDialog({
  isOpen,
  onOpenChange,
  message,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  message: string;
}) {
  const handleConfirm = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>WARNING!</DialogTitle>
        </DialogHeader>
        <p className="font-galmuri text-[3.2rem] text-black">{message}</p>
        <DialogFooter>
          <button
            onClick={handleConfirm}
            className="bg-[url('/assets/btn_confirm.webp')] bg-contain bg-center bg-no-repeat w-[18.2rem] h-[7.8rem] cursor-pointer flex-shrink-0"
            aria-label="확인"
            tabIndex={0}
          />
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
