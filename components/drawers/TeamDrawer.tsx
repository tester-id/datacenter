import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { Icons } from "../icons";

export function TeamDrawer() {
  const team = [
    {
      name: "Iftihar Abdillah",
      number: "230602100",
      image: "/team/if1.jpg",
    },
    {
      name: "Reza Aulia",
      number: "230602114",
      image: "/team/eja.jpg",
    },
    {
      name: "Samsul Wali Hamidi",
      number: "230602116",
      image: "/team/hamidi.jpg",
    },
    {
      name: "Siska Widia Candra Atnira",
      number: "230602117",
      image: "/team/siska.jpg",
    },
    {
      name: "Wanda Maulana Dirayadi",
      number: "230602119",
      image: "/team/wanda.jpg",
    },
  ]

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" className="gap-1 cursor-pointer">
            <Icons.users className="h-5 w-5" />
            <p className="hidden md:block">Team</p>
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Our Team</DrawerTitle>
          <DrawerDescription>
            Here's our team working on this project.
          </DrawerDescription>
        </DrawerHeader>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 p-4">
          {team.map((member, index) => (
            <div key={index} className="flex flex-col items-center">
              <Image
                src={member.image}
                alt={member.name}
                width={100}
                height={100}
                className="rounded-full object-cover"
              />
              <p className="mt-2 font-medium text-sm">{member.name}</p>
              <p className="text-xs text-gray-500">{member.number}</p>
            </div>
          ))}
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="default" className="cursor-pointer">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}
