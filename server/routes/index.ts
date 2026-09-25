import { chains } from "./chains";
import { theatres } from "./theatres";
import { screens } from "./screens";
import { tdl } from "./tdl";
import { flm } from "./flm";
import { approvals } from "./approvals";
import { wiretap } from "./wiretap";
import { appliances } from "./appliances";
import { icount } from "./icount";
import { credentials } from "./credentials";
import { fleet } from "./fleet";
import { agentConfigs } from "./agentConfigs";
import { screenPulse } from "./screenPulse";

/** Mounted at /api/<key>. */
export const routes = {
  chains,
  theatres,
  screens,
  tdl,
  flm,
  approvals,
  wiretap,
  appliances,
  icount,
  credentials,
  fleet,
  "agent-configs": agentConfigs,
  "screen-pulse": screenPulse,
};
