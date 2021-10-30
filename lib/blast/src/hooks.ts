import { BlastRef } from "./classes";
import {
  BlastTunnel,
  BlastTunnelSymbol,
  BlastComponentState,
  BlastEffect,
} from "./types";
import { deepEqual } from "./utils";

export function useState(state: BlastComponentState, defaultValue: any) {
  const { index, hookValues, fresh } = state;

  if (fresh) {
    state.update(index, defaultValue);
  }

  function setState(value: any) {
    let val = value;
    if (typeof val === "function") {
      val = val(hookValues[index]);
    }
    state.update(index, val);
  }
  state.index++;
  return [fresh ? defaultValue : hookValues[index], setState];
}

export function useEffect(
  state: BlastComponentState,
  effect: BlastEffect,
  dependencies: any
): void {
  const { index, hookValues, fresh } = state;

  if (fresh) {
    state.update(index, { deps: null, ext: null });
  }

  if (!deepEqual(fresh ? dependencies : hookValues[index].deps, dependencies)) {
    state.pushEffects(effect, dependencies);
  }
  state.index++;
}

export function useRef(state: BlastComponentState, defaultValue: any = null) {
  const { index, hookValues, fresh } = state;

  const refObject = new BlastRef(defaultValue);

  if (fresh) {
    state.update(index, refObject);
  }

  state.index++;

  return fresh ? refObject : hookValues[index];
}

export function createTunnel() {
  return {
    [BlastTunnelSymbol]: true,
    update: null,
    value: null,
  } as BlastTunnel;
}

export function startContext(
  state: BlastComponentState,
  tunnel: BlastTunnel,
  defaultValue: any
) {
  const [v, s] = useState(state, defaultValue);
  tunnel.update = s;
  tunnel.value = v;
  return v;
}

export function useContext(tunnel: BlastTunnel) {
  const { value } = tunnel;
  return [value, tunnel.update];
}
