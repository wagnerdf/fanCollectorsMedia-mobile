import { styled } from "nativewind";
import "react-native";

declare global {
  namespace JSX {
    interface IntrinsicAttributes {
      className?: string;
    }
  }
}

declare module "nativewind" {
  export { styled };
}
