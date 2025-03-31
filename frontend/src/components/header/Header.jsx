import React from "react";
import DesktopNav from "./DesktopNav";
import MobileNav from "./MobileNav";

export default function Header() {
  return (
    <div >
      <DesktopNav />
      <MobileNav />
    </div>
  );
}
