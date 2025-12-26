import * as a11yAddonAnnotations from "@storybook/addon-a11y/preview";
import * as projectAnnotations from "./preview";

import { setProjectAnnotations } from "@storybook/vue3-vite";

setProjectAnnotations([a11yAddonAnnotations, projectAnnotations]);
