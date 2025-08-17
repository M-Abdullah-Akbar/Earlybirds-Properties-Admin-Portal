import { useState, useEffect } from "react";

/**
 * Hook to determine if component has mounted on client side
 * Helps prevent hydration mismatches by ensuring client-only code
 * runs only after hydration is complete
 */
export const useClientMount = () => {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  return hasMounted;
};
