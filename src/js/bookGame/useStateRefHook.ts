import React from "react";
import { useState, useEffect, useRef } from "react";

function useStateRef<T>(
  initialValue: T
): [T, React.Dispatch<React.SetStateAction<T>>, React.MutableRefObject<T>] {
  const [value, setValue] = useState(initialValue);

  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return [value, setValue, ref];
}

export default useStateRef;
