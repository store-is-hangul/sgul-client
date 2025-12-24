"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ControlledDialog() {
  const [isOpen, setIsOpen] = useState(false);

  const handleConfirm = () => {
    // 작업 수행
    setIsOpen(false);
  };

  return (
    <>
      <button onClick={() => setIsOpen(true)}>다이얼로그 열기</button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>WARNING!</DialogTitle>
          </DialogHeader>
          <p className="font-galmuri text-[3.2rem] text-black">
            정말 삭제하시겠습니까?
          </p>
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
    </>
  );
}
