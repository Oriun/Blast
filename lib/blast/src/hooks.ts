import { BlastRef } from "./classes";
import {
  BlastTunnel,
  BlastTunnelSymbol,
  BlastComponentState,
  BlastEffect,
  BlastDispatch,
  BlastMemo
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
    state.pushEffects(index, effect, dependencies);
  }
  state.index++;
}

export function useMemo(
  state: BlastComponentState,
  effect: BlastMemo,
  dependencies: any
): any {
  const { fresh } = state;
  const [data, setData] = useState(state, {
    value: fresh ? effect(null) : null,
    dependencies
  });
  if (fresh) return data.value;
  if (!deepEqual(dependencies, data?.dependencies)) {
    const value = effect(data?.value);
    setData(() => ({ value, dependencies }));
    return value;
  }
  return data.value;
}
export function useRef(
  state: BlastComponentState,
  defaultValue: any = null
): BlastRef {
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
    value: null
  } as BlastTunnel;
}

export function startContext(
  state: BlastComponentState,
  tunnel: BlastTunnel,
  defaultValue: any
): any {
  const [v, s] = useState(state, defaultValue);
  tunnel.update = s;
  tunnel.value = v;
  return v;
}

export function useContext(tunnel: BlastTunnel): [any, BlastDispatch] {
  const { value } = tunnel;
  return [value, tunnel.update!];
}
