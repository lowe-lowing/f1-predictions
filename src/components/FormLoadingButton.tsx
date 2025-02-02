import { type FC } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface LoadingButtonProps {
    children: React.ReactNode;
}

const FormLoadingButton: FC<LoadingButtonProps> = ({ children }) => {
    const { pending } = useFormStatus();
    return (
        <Button disabled={pending}>
            {children}
            {pending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
        </Button>
    );
};

export default FormLoadingButton;