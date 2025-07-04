import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { Button } from "../ui/button";
import { ProfileForm } from "../forms/ProfileForm";
import { User } from "lucide-react";

export function ProfileDrawer() {

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" className="cursor-pointer">
          <User className="h-4 w-4" />
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Profile</DrawerTitle>
          <DrawerDescription>
            View your profile information below.
          </DrawerDescription>
        </DrawerHeader>
        <ProfileForm />
        <DrawerFooter className="pt-2">
          <DrawerClose asChild>
            <Button variant="default" className="cursor-pointer">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
