import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function TestPage() {
  const [testvalue, setTestvalue] = useState("");
  return (
    <div>
      <div>test page</div>
      <Input
        placeholder="test"
        value={testvalue}
        onChange={(e) => setTestvalue(e.target.value)}
      />
      <div>{testvalue}</div>
    </div>
  );
}
