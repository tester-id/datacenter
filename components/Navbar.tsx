import Link from "next/link";
import { Button } from "@/components/ui/button";
import { signOut } from "@/actions";
import { Icons } from "./icons";
import { ProfileModal } from "./modals/ProfileModal";
import { SettingModal } from "./modals/SettingModal";
import { ProfileDrawer } from "./drawers/ProfileDrawer";
import { SettingDrawer } from "./drawers/SettingDrawer";
import { TeamDrawer } from "./drawers/TeamDrawer";
import { Activity } from "lucide-react";
// import { ThemeToggleDropdown } from "@/components/ThemeToggle";

export function Navbar() {
  return (
    <div className="flex flex-col mt-3 mx-8">
      <div className="flex justify-between">
        <div className="flex items-center">
          <Link href={"/"}>
            <Icons.building2 className="w-12 h-12" />
          </Link>
        </div>
        <div className="flex items-center">
          <ul className="flex md:gap-1 items-center">
            <li className="hidden md:block">
              <Link
                href="/details"
              >
                <Button variant={"ghost"} className="gap-1 cursor-pointer">
                <Activity className="h-5 w-5" />
                <p className="hidden md:block">Details</p>
                </Button>
              </Link>
            </li>
            <li className="hidden md:block">
              <ProfileModal />
            </li>
            <li className="md:hidden">
              <ProfileDrawer />
            </li>
            <li className="hidden md:block">
              <SettingModal />
            </li>
            <li className="md:hidden">
              <SettingDrawer />
            </li>
            <li>
              <TeamDrawer />
            </li>
            <li>
              <Link href={"https://github.com/tester-id"} target="_blank">
                <Button variant={"ghost"} className="gap-1 cursor-pointer">
                  <Icons.gitHub className="h-5 w-5" />
                  <p className="hidden md:block">Github</p>
                </Button>
              </Link>
            </li>
            <li>
              <form action={signOut}>
                <Button className="gap-1 cursor-pointer">
                  <Icons.logout className="h-5 w-5" />
                  <p className="hidden md:block">Sign Out</p>
                </Button>
              </form>
            </li>
            {/*<li className="p-4">
              <ThemeToggleDropdown />
            </li>*/}
          </ul>
        </div>
      </div>
      <div className="w-full mt-2 h-[2px] bg-gradient-to-r from-transparent via-[#c3cbd8] to-transparent"></div>
    </div>
  );
}
