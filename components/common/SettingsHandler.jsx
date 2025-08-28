"use client";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { safeLocalStorage } from "@/utlis/clientUtils";
import { useClientMount } from "@/utlis/useClientMount";

export default function SettingsHandler() {
  const pathname = usePathname();
  const [isRtl, setIsRtl] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const hasMounted = useClientMount();

  // Optional: Sync state with localStorage on component mount
  useEffect(() => {
    if (!hasMounted) return; // Wait for client-side mount to prevent hydration mismatch

    const savedDir = safeLocalStorage.getItem("isRtl");
    if (savedDir) {
      setIsRtl(JSON.parse(savedDir));
    }
  }, [hasMounted]);

  const handleRtlChange = () => {
    const newIsRtl = !isRtl; // Toggle the state
    setIsRtl(newIsRtl); // Update state
    safeLocalStorage.setItem("isRtl", JSON.stringify(newIsRtl)); // Save to localStorage
  };

  useEffect(() => {
    document.dir = isRtl ? "rtl" : "ltr";
    if (isRtl) {
      document.body.classList.add("rtl");
    } else {
      document.body.classList.remove("rtl");
    }
  }, [isRtl]);

  return (
    <div className={`popup-setting ${isOpen ? "show" : ""}`}>
      <div className="btn-setting" onClick={() => setIsOpen((pre) => !pre)}>
        <a className="sw-click">
          <i className="icon-settings" />
        </a>
      </div>
      <div className="popup-setting-container">
        <div className="btn-RTL mb-20">
          <span className="title text-1 fw-5 text-color-heading mb-8">
            RTL:
          </span>
          <a
            id="toggle-rtl"
            className="btn-style-2 radius-3"
            onClick={() => handleRtlChange()}
          >
            {isRtl ? "ltr" : "rtl"}
          </a>
        </div>
      </div>
    </div>
  );
}
