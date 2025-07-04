import { Icons } from "../icons";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { SettingForm } from "../forms/SettingForm";
import { readSetting } from "@/actions";
import { Badge } from "../ui/badge";

export async function SettingModal() {
  const result = await readSetting();
  let entityType: string = "";
  let entityId: string = "";
  let keys: string = "";
  let useStrictDataTypes: string = "";
  if (result.data && result.data.length > 0) {
    entityType = result.data[0].entityType;
    entityId = result.data[0].entityId;
    keys = result.data[0].keys;
    useStrictDataTypes = result.data[0].useStrictDataTypes;
  }
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className="gap-1 cursor-pointer">
          <Icons.setting className="h-5 w-5" />
          Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="min-w-[700px]">
        <DialogHeader>
          <DialogTitle>Setting</DialogTitle>
          <DialogDescription>
            <span>
              Here you can adjust your telemetry settings to connect to
              ThingsBoard:
            </span>
            <div className="flex flex-col gap-3 mt-1">
              <div className="flex gap-1">
                <h1>EntityType:</h1>
                <Badge>{entityType ? entityType : "NA"}</Badge>
              </div>
              <div className="flex gap-1">
                <h1>EntityId:</h1>
                <Badge>{entityId ? entityId : "NA"}</Badge>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
        <SettingForm />
        <DialogFooter>
          <DialogClose asChild className="w-full">
            <Button type="button" variant="destructive" className="cursor-pointer">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
