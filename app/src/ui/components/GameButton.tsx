import type { ButtonHTMLAttributes, MouseEvent, ReactNode } from "react";
import { playClick } from "../../audio/sounds";

type Variant = "primary" | "danger" | "paper";

export function GameButton({
  children,
  variant = "primary",
  className = "",
  onClick,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode; variant?: Variant }) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!props.disabled) playClick();
    onClick?.(event);
  }
  return (
    <button className={`game-button game-button--${variant} ${className}`.trim()} onClick={handleClick} {...props}>
      {children}
    </button>
  );
}
