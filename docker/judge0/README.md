# Judge0 runtime image

This directory owns the code-execution runtime used by local development and
CI. It avoids host-wide cgroup changes and avoids third-party Judge0 images.

## Pinned inputs

| Input     | Pin                                                                                                        |
| --------- | ---------------------------------------------------------------------------------------------------------- |
| Judge0 CE | `judge0/judge0:1.13.1` at digest `sha256:6b5d6a66aa19a8e878a52ea3c6a560afc1086734d96e2885b561fd5c6018f082` |
| isolate   | official `ioi/isolate` tag `v2.2.1`, commit `9c84554464d2aa9161a424e70af67f4210a12c45`                     |

The Dockerfile verifies the isolate checkout commit before compiling it. A
multi-stage build keeps the compiler-only packages in the builder stage.

## Reviewable compatibility changes

- `isolate-quotactl.patch` keeps isolate 2.2.1 buildable against Judge0's Debian
  userspace when the newer `quotactl_fd` syscall constant is unavailable.
- `judge0-cgroup-v2.patch` teaches Judge0 1.13.1 to detect modern isolate,
  removes its retired cgroup-timing argument for isolate 2.x, preserves cgroup
  memory limits, gives cold JVM/Kotlin compilation a bounded 30-second CPU /
  60-second wall budget without raising player execution limits, maps persisted
  submission IDs into isolate's supported 0–999 box range, and invokes the
  runtime readiness check before API/workers start.
- `ensure-isolate-runtime` delegates the CPU, memory, I/O, and PID controllers
  on cgroup v2. It verifies all four controllers and exits non-zero when the
  sandbox cannot be made safe. On cgroup v1 it keeps the upstream layout.

## Build and certify

```bash
docker compose build server
npm run judge0:up
npm run verify:judge0
npm run test:e2e:full
```

`npm run judge0:up` waits for the database, Redis, workers, and API. The full
browser test uses deterministic OpenAI transport fixtures, but all reference
solutions and player submissions execute in the real Judge0 sandbox.

The box-ID mapping is deliberate: Judge0 submission IDs grow without bound,
while isolate accepts only 1,000 concurrent box identifiers. Judge0 processes
a configured maximum queue of 100 plus its active worker slots in this stack,
so modulo 1,000 remains safely above the concurrency ceiling. Certification
runs against the existing database to cover submission IDs above 999.

When either upstream pin changes, regenerate and review both patches against
that exact source, update the regression assertions, build without cache, and
rerun every command above plus `npm run quality`.
