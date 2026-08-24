import { Label } from "../ui/label"

function Loading() {
  return (
    <div role="status" className="grid min-h-svh place-items-center">
      <div className="flex flex-col gap-2">
        <img
          src="/images/loading.png"
          alt="Loading"
          className="size-14 animate-pulse rounded-full object-contain"
        />
        <Label className="">Loading...</Label>
      </div>
    </div>
  )
}

export default Loading
