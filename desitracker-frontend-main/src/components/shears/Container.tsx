import React from "react";

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "sm" | "md" | "lg" | "none";
}

const maxWidthClasses = {
  sm: "max-w-screen-sm",
  md: "max-w-screen-md",
  lg: "max-w-screen-lg",
  xl: "max-w-screen-xl",
  "2xl": "max-w-screen-2xl",
  full: "max-w-full",
};

const paddingClasses = {
  sm: "px-4",
  md: "px-6",
  lg: "px-8",
  none: "",
};

const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = "full",
  padding = "none",
  className = "",
  ...props
}) => {
  const containerClasses =
    `w-full mx-auto ${maxWidthClasses[maxWidth]} ${paddingClasses[padding]} ${className}`.trim();

  return (
    <main className={containerClasses} {...props}>
      {children}
    </main>
  );
};

export default Container;
