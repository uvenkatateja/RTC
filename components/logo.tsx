import { CheckCircle2 } from "lucide-react";

export const Logo = () => {
    return (
        <div className="flex items-center gap-2">
            <CheckCircle2 className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">TaskFlow</span>
        </div>
    );
}
