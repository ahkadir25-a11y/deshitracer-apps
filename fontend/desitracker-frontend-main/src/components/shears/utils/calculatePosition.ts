export function calculatePosition(
  buttonRef: React.RefObject<HTMLButtonElement | HTMLDivElement | null>
): boolean {
  if (!buttonRef.current) return false;
  const buttonRect = buttonRef.current.getBoundingClientRect();
  const windowHeight = window.innerHeight;
  const spaceBelow = windowHeight - buttonRect.bottom;
  return spaceBelow < 200; // Adjust this value based on your dropdown height
}
