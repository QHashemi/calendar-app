import { showNotification } from "@mantine/notifications";
import { ReactNode } from "react";
import { IconCheck, IconX } from "@tabler/icons-react";



interface NotifyOptions {
  msg: string;
  error: boolean;
  successIcon?: ReactNode;
  errorIcon?: ReactNode;
  successColor?: string;
  errorColor?: string;
  componentType?: string;
  expectedComponentType?: string;
}

export const notifyMessage = ({
  msg,
  error,
  componentType,
  expectedComponentType,
  successIcon = <IconCheck size={16} />,
  errorIcon = <IconX size={16} />,
  successColor = "green",
  errorColor = "red",
}: NotifyOptions) => {
  if (expectedComponentType && componentType !== expectedComponentType) return;
  if (!msg) return;
  

  showNotification({
    message: msg,
    color: error ? errorColor : successColor,
    icon: error ? errorIcon : successIcon,
    position: "top-center",
  });

};
