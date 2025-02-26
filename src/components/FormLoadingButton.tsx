import { type FC } from "react";
import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button, ButtonProps } from "./ui/button";

const FormLoadingButton: FC<ButtonProps> = ({ children, disabled, ...props }) => {
  const { pending } = useFormStatus();
  return (
    <Button disabled={pending || disabled} {...props}>
      {children}
      {pending && <Loader2 className="w-4 h-4 ml-2 animate-spin" />}
    </Button>
  );
};

export default FormLoadingButton;
